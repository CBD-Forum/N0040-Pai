var Path = require('path');
var FS = require('fs');
var EventEmitter = require('events').EventEmitter;
var Queue = require('./queue');

module.exports = createDB;
function createDB(root, attachmentExtension) {
    if (attachmentExtension == null) {
        attachmentExtension = 'json';
    }
    var rootPath = Path.resolve(process.cwd(), root);
    // Make sure we have a directory to work with
    var stat;
    try {
        stat = FS.statSync(rootPath);
    } catch (err) {
        // try to create it if it's not there
        if (err.code === "ENOENT") {
            FS.mkdirSync(rootPath);
            stat = FS.statSync(rootPath);
        } else {
            throw err;
        }
    }
    if (!stat.isDirectory()) {
        throw new Error("Path " + rootPath + " is not a directory.");
    }
    var locks = {};

    var db = new EventEmitter();

    /**
     * get the name of all object
     * @param callback
     */
    db.list = function (callback) {
        FS.readdir(rootPath, function (err, files) {
            if (err) {
                return onReadComplete(path, err);
            }
            var entries = [];
            files.forEach(function (file) {
                var index = file.length - (attachmentExtension.length + 1);
                if (file.substr(index) === ("." + attachmentExtension)) {
                    entries.push(file.substr(0, index));
                }
            });
            callback(entries);
        });
    };

    db.get = function (path, callback) {
        var queue = locks[path];
        // If a read happens in locked state...
        if (queue) {
            var last = queue.last();
            // ...and last in queue is read batch, add to it
            if (last.read) {
                return last.batch.push(callback);
            }
            // ...else append a new read batch
            return queue.push({
                read: true,
                path: path,
                batch: [callback]
            });
        }
        // .. otherwise lock state, create a read batch, and process queue
        locks[path] = queue = new Queue();
        queue.push({
            read: true,
            path: path,
            batch: [callback]
        });
        processQueue(path);
    };

    db.put = function (path, data, callback) {
        var queue = locks[path];
        var write = {
            write: true,
            path: path,
            data: data,
            callback: callback
        };
        // If write happens in locked state...
        if (queue) {
            return queue.push(write);
        }
        // otherwise lock state, create write transaction and process queue
        locks[path] = queue = new Queue();
        queue.push(write);
        processQueue(path);

    };

    db.remove = function (path, callback) {
        var queue = locks[path];
        var remove = {
            remove: true,
            path: path,
            callback: callback
        };
        // If write happens in locked state...
        if (queue) {
            return queue.push(remove);
        }
        // otherwise lock state, create write transaction and process queue
        locks[path] = queue = new Queue();
        queue.push(remove);
        processQueue(path);
    };

    return db;

    /////////////////////////////////////////////

    function processQueue(path) {
        var queue = locks[path];
        var next = queue.first();
        // If queue is empty, put in idle state
        if (!next) {
            delete locks[path];
            return db.emit("unlock", path);
        }
        // If next is read, kick off read
        if (next.read) {
            return get(next.path);
        }
        // If next is write, kick off write
        if (next.write) {
            return put(next.path, next.data);
        }
        if (next.remove) {
            return remove(next.path);
        }
        throw new Error("Invalid item");
    }

    function onReadComplete(path, err, data) {
        var queue = locks[path];
        var read = queue.shift();
        if (!(read.read && read.path === path)) {
            throw new Error("Corrupted queue " + path);
        }
        var batch = read.batch;
        // process queue
        processQueue(path);
        // When read finishes, get batch from queue and process it.
        for (var i = 0, l = batch.length; i < l; i++) {
            batch[i](err, data);
        }
    }

    function onWriteComplete(path, err) {
        var queue = locks[path];
        var write = queue.shift();
        if (!(write.write && write.path === path)) {
            throw new Error("Corrupted queue " + path);
        }
        processQueue(path);
        write.callback(err);
        db.emit("change", path, write.data);
    }

    function onRemoveComplete(path, err) {
        var queue = locks[path];
        var remove = queue.shift();
        if (!(remove.remove && remove.path === path)) {
            throw new Error("Corrupted queue " + path);
        }
        processQueue(path);
        remove.callback(err);
        db.emit("change", path);
    }

    // Lists entries in a folder
    function list(path) {
        FS.readdir(Path.resolve(rootPath, path), function (err, files) {
            if (err) {
                return onReadComplete(path, err);
            }
            var entries = [];
            files.forEach(function (file) {
                var i = file.length - (attachmentExtension.length + 1);
                if (file.substr(i) === ("." + attachmentExtension)) {
                    entries.push(file.substr(0, i));
                }
            });
            onReadComplete(path, null, entries);
        });
    }

    // Load an entry
    function get(path) {
        var jsonPath = Path.resolve(rootPath, path + "." + attachmentExtension);
        FS.readFile(jsonPath, function (err, json) {
            if (err) {
                if (err.code === "ENOENT") {
                    return list(path);
                }
                return onReadComplete(path, err);
            }
            var data;
            try {
                data = JSON.parse(json);
            } catch (err) {
                return onReadComplete(path, new Error("Invalid JSON in " + jsonPath + "\n" + err.message));
            }
            var attachmentPath = Path.resolve(rootPath, path + attachmentExtension);
            FS.readFile(attachmentPath, 'utf8', function (err, attachment) {
                if (err) {
                    if (err.code !== "ENOENT") {
                        return onReadComplete(path, err);
                    }
                } else {
                    data.attachment = attachment;
                }
                onReadComplete(path, null, data);
            });
        });
    }

    // Put an entry
    function put(path, data) {
        var json;
        if (data.hasOwnProperty("attachment")) {
            Object.defineProperty(data, "attachment", {enumerable: false});
            json = JSON.stringify(data);
            Object.defineProperty(data, "attachment", {enumerable: true});
        } else {
            json = JSON.stringify(data);
        }
        var jsonPath = Path.resolve(rootPath, path + "." + attachmentExtension);
        FS.writeFile(jsonPath, json, function (err) {
            if (err) {
                return onWriteComplete(path, err);
            }
            if (data.hasOwnProperty("attachment")) {
                var attachmentPath = Path.resolve(rootPath, path + attachmentExtension);
                return FS.writeFile(attachmentPath, data.attachment, function (err) {
                    onWriteComplete(path, err);
                });
            }
            onWriteComplete(path);
        });
    }

    // Load an entry
    function remove(path) {
        var jsonPath = Path.resolve(rootPath, path + "." + attachmentExtension);
        FS.unlink(jsonPath, function (err) {
            onRemoveComplete(path, err);
        });
    }
}


