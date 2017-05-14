var create_db = require('../modules/jsondb');
var Promise = require("bluebird");
var cache_map = {};

var goodsDB = {
    /**
     * 初始化商品数据库
     */
    init: function () {
        if (!this.groupdb) {
            this.groupdb = create_db('goods');
        } else {
            console.log("goods database already create");
        }
    },
    /**
     * 获取商品列表
     * @param callback
     */
    list: function (callback) {
        this.groupdb.list(function (files) {
            if (files) {
                var goodsList = [];
                var promises = [];
                for (var i = 0; i < files.length; ++i) {
                    function pushFn(index) {
                        promises.push(new Promise(function (resolve) {
                            goodsDB.get(files[index], function (goods) {
                                goodsList.push(goods);
                                resolve();
                            });
                        }));
                    }

                    pushFn(i);
                }
                Promise.all(promises).then(function () {
                    callback(goodsList);
                });
            } else {
                callback(null);
            }
        });
    },
    deepCopy: function (goods) {
        return JSON.parse(JSON.stringify(goods));
    },
    /**
     * 获取商品信息
     * @param name
     * @param callback
     */
    get: function (name, callback) {
        var goods = cache_map[name];
        if (goods != null) {
            var deepCopy = goodsDB.deepCopy(goods);
            callback(deepCopy);
        } else {
            this.groupdb.get(name, function (err, goods) {
                if (goods != null) {
                    cache_map[name] = goods;
                    callback(goodsDB.deepCopy(goods));
                } else {
                    callback(null);
                }
            });
        }
    },
    /**
     * 添加商品
     * @param name
     * @param goods
     * @param callback
     */
    put: function (name, goods, callback) {
        var deepCopy = goodsDB.deepCopy(goods);
        cache_map[name] = deepCopy;
        this.groupdb.put(name, deepCopy, function (err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, deepCopy);
            }
        });
    },
    /**
     * 添加商品
     * @param name
     * @param callback
     */
    remove: function (name, callback) {
        delete cache_map[name];
        // cache_map[name] = null;
        this.groupdb.remove(name, function (err) {
            callback(err);
        });
    }
};

module.exports = goodsDB;