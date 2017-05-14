var yesdb = require('../modules/yesdb/yesdb');
var db = yesdb.opendb('./global');

var globalDB = {
    getCID: function (callback) {
        var that = this;
        this.getKey('cid', function (cid) {
            if (cid == null) {
                cid = 1;
            }
            that.putKey('cid', cid + 1, function () {
                callback(cid);
            });
        });
    },
    getKey: function (key, callback) {
        db.get(key, function (err, v) {
            if (err) {
                callback(null);
            } else {
                callback(v);
            }
        });
    },
    putKey: function (key, data, callback) {
        db.set(key, data, function (err) {
            if (err) {
                callback(null);
            } else {
                callback(data);
            }
        });
    },
    removeKey: function (key, callback) {
        db.delete(key, function (err) {
            if (err) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }
};

module.exports = globalDB;