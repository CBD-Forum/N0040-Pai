var create_db = require('../modules/jsondb');
var cache_map = {};

var userDB = {
    /**
     * 初始化用户数据库
     */
    init: function () {

        if (!this.groupdb) {
            this.groupdb = create_db('users');
        } else {
            console.log("users db already create");
        }
    },
    /**
     * 获取用户列表
     * @param callback
     */
    listUser: function (callback) {
        this.groupdb.list(function (files) {
            if (files) {
                var len = files.length;
                var users = new Array(len);
                for (var i = 0; i < len; i++) {
                    users[i] = {name: files[i]};
                }
                callback(users);
            } else {
                callback(null);
            }
        });
    },
    /**
     * 获取用户信息
     * @param name
     * @param callback
     */
    getUser: function (name, callback) {
        var user = cache_map[name];
        if (user != null) {
            callback(user);
        } else {
            this.groupdb.get(name, function (err, user) {
                if (user != null) {
                    cache_map[name] = user;
                    callback(user);
                } else {
                    callback(null);
                }
            });
        }
    },
    /**
     * 添加用户
     * @param name
     * @param user
     * @param callback
     */
    putUser: function (name, user, callback) {
        cache_map[name] = user;
        this.groupdb.put(name, user, function (err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, user);
            }
        });
    }
};

module.exports = userDB;