var PgPool = require('../common/PgPool');
var Promise = require("bluebird");
var Async = require('async');

var Goods = {

    querySql: function () {
        return "*";
    },

    /**
     * 分页获取数据
     * @param params
     * @param pagination
     * @param callback
     */
    list: function (params, pagination, callback) {
        PgPool.connect(function (err, client, done) {
            var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
            var querys = [];
            var flag = params && params.status != null && params.status != undefined;
            if (flag) {
                querys.push(params.status);
            }
            querys.push(pagination.pageSize);
            querys.push(offset);
            client.query('SELECT ' + Goods.querySql() + ' FROM goods ' + (flag ? " WHERE status=$1 " : "") + 'ORDER BY createtime desc limit $' + (flag ? "2" : "1") + ' offset $' + (flag ? "3" : "2"), querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                var list = result.rows.length ? result.rows : [];
                var promises = [];
                list.forEach(function (element) {
                    function fn(element) {
                        promises.push(new Promise(function (resolve) {
                            PgPool.connect(function (err, client, done) {
                                client.query('SELECT filename FROM goods_img WHERE goodscode=$1', [element.code], function (err, result) {
                                    done();
                                    if (err) {
                                        throw new Error(err.message | '内部错误');
                                    }
                                    element.images = [];
                                    var goodsImages = result.rows.length ? result.rows : [];
                                    for (var i = 0; i < goodsImages.length; ++i) {
                                        element.images.push(goodsImages[i].filename);
                                    }
                                    resolve();
                                });
                            });
                        }));
                    }

                    fn(element);
                });
                Promise.all(promises).then(function () {
                    callback(null, list);
                });
            });
        });
    },

    getByCode: function (goodsCode, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('SELECT ' + Goods.querySql() + ' FROM goods WHERE code=$1', [goodsCode], function (err, result) {
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                Goods.processGetGoodsResult(err, client, done, result, callback);
            });
        });
    },

    processGetGoodsResult: function (err, client, done, result, callback) {
        var goods = result.rows.length ? result.rows[0] : null;
        if (goods == null) {
            return callback(null, goods);
        }
        client.query('SELECT filename FROM goods_img WHERE goodscode=$1', [goods.code], function (err, result) {
            done();
            if (err) {
                throw new Error(err.message | '内部错误');
            }
            goods.images = [];
            var goodsImages = result.rows.length ? result.rows : [];
            for (var i = 0; i < goodsImages.length; ++i) {
                goods.images.push(goodsImages[i].filename);
            }
            callback(null, goods);
        });
    },

    getByAddress: function (address, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('SELECT ' + Goods.querySql() + ' FROM goods WHERE address=$1', [address], function (err, result) {
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                Goods.processGetGoodsResult(err, client, done, result, callback);
            });
        });
    },

    get: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('SELECT ' + Goods.querySql() + ' FROM goods WHERE id=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                var goods = result.rows.length ? result.rows[0] : null;
                if (goods == null) {
                    return callback(null, goods);
                }
                new Promise(function (resolve) {
                    PgPool.connect(function (err, client, done) {
                        client.query('SELECT filename FROM goods_img WHERE goodscode=$1', [goods.code], function (err, result) {
                            done();
                            if (err) {
                                throw new Error(err.message | '内部错误');
                            }
                            goods.images = [];
                            var goodsImages = result.rows.length ? result.rows : [];
                            for (var i = 0; i < goodsImages.length; ++i) {
                                goods.images.push(goodsImages[i].filename);
                            }
                            resolve();
                        });
                    });
                }).then(function () {
                    callback(null, goods);
                })
            });
        });
    },

    remove: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('DELETE FROM goods WHERE id=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                callback(null, result.rowCount);
                PgPool.connect(function (err, client, done) {
                    client.query('DELETE FROM goods_img WHERE id=$1', [id], function (err, result1) {
                        done();
                        if (err) {
                            throw new Error(err.message || '内部错误');
                        }
                        callback(null, result.rowCount + result1.rowCount);
                    });
                });
            });
        });
    },

    /**
     * 保存商品
     * @param goods
     * @param callback
     */
    insert: function (goods, callback) {
        Async.waterfall([
            function (callback1) {
                PgPool.connect(function (err, client, done) {
                    client.query("INSERT INTO goods(goodsname, code, address, secret, description, " +
                        "starttime, baseprice, fixincprice, bidinterval, totalauction, " +
                        "marketvalue, salt, hash, visitcount, bidindex, status, locked, counterparty, deposit) " +
                        "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)",
                        [goods.goodsname, goods.code, goods.address, goods.secret, goods.description,
                            goods.starttime, goods.baseprice, goods.fixincprice, goods.bidinterval, goods.totalauction,
                            goods.marketvalue, goods.salt, goods.hash, goods.visitcount ? goods.visitcount : 0,
                            goods.bidindex ? goods.bidindex : 0, goods.status ? goods.status : 0,
                            goods.locked ? goods.locked : 0, goods.counterparty ? goods.counterparty : '', goods.deposit],
                        function (err, result) {
                            done();
                            if (err || result.rowCount < 1) {
                                throw new Error(err.message || "保存用户数据出错");
                            }
                            callback1(null, result.rowCount);
                        });
                });
            }, function (data, callback1) {
                var images = goods.images;
                Goods.getByCode(goods.code, function (err, goods) {
                    var promises = [];
                    images.forEach(function (element) {
                        promises.push(new Promise(function (resolve) {
                            PgPool.connect(function (err, client, done) {
                                client.query("INSERT INTO goods_img(filename, goodscode) VALUES($1, $2)",
                                    [element, goods.code],
                                    function (err, result) {
                                        done();
                                        if (err || result.rowCount < 1) {
                                            throw new Error(err.message || "保存用户数据出错");
                                        }
                                        resolve();
                                    });
                            });
                        }));
                    });
                    Promise.all(promises).then(function () {
                        callback1(null, images.length + 1);
                    });
                });
            }
        ], function (err, result) {
            callback(err, result);
        })
    },

    updateVisitCount: function (goods, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE goods SET visitcount=$1 WHERE code=$2",
                [goods.visitcount, goods.code], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "更新用户数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    updateStatus: function (goods, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE goods SET status=$1 WHERE code=$2",
                [goods.status, goods.code], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "保存用户数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    updateLocked: function (goods, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE goods SET locked=$1 WHERE code=$2",
                [goods.locked, goods.code], function (err, result) {
                    done();
                    if (err) {
                        throw new Error((err && err.message) || "保存用户数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    updateBidIndex: function (goods, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE goods SET bidindex=$1 WHERE code=$2",
                [goods.bidindex, goods.code], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "更新轮次数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    update: function (goods, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE goods SET status=$1, counterparty=$2, price=$3 WHERE code=$4",
                [goods.status, goods.counterparty, goods.price, goods.code], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "保存用户数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    }
};

module.exports = Goods;
