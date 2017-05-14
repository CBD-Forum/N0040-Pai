var PgPool = require('../common/PgPool');
var Async = require('async');
var Address = require('../address-api/Address');
var Goods = require('../auction-api/Goods');

var Order = {

    countByUserid: function (userid, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS ordercount FROM user_order WHERE userid=$1', [userid], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取用户的订单数量失败' + "userid=" + userid);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].ordercount) : 0);
            });
        });
    },

    listOrder: function (pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_order WHERE status=$1 limit $2 offset $3', [0, pagination.pageSize, offset], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取订单列表失败' + "pagination=" + pagination);
                }
                callback(null, result.rows.length ? result.rows : []);
            });
        });
    },

    /**
     * @param userid
     * @param callback
     */
    list: function (userid, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_order AS uo WHERE uo.userid=$1 and uo.status>0',
                [userid], function (err, result) {
                    if (err) {
                        throw new Error(err.message || '获取用户的订单失败' + "userid=" + userid);
                    }
                    var userOrderList = result.rows.length ? result.rows : [];
                    Async.map(userOrderList, function (userOrder, callback) {
                        Order.processGetOrderResult(err, client, done, userOrder, callback);
                    }, function (err, results) {
                        callback(err, userOrderList);
                    });
                });
        });
    },

    getByOrderCode: function (orderCode, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_order AS uo WHERE uo.ordercode=$1', [orderCode], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取父订单错误' + "ordercode=" + orderCode);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    getOrderByOrderCode: function (orderCode, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_order AS uo WHERE uo.ordercode=$1', [orderCode], function (err, result) {
                if (err) {
                    throw new Error(err.message || '获取父订单错误' + "id=" + id);
                }
                var userOrder = result.rows.length ? result.rows[0] : null;
                Order.processGetOrderResult(err, client, done, userOrder, callback);
            });
        });
    },

    processGetOrderResult: function (err, client, done, userOrder, callback) {
        if (userOrder == null) {
            return callback(null, userOrder);
        }
        var id = userOrder.id;
        Async.parallel([
            function (callback) {//get address
                Address.get(userOrder.addressid, function (err, address) {
                    callback(err, address);
                });
            },
            function (callback) {// get use sub address
                Async.waterfall([
                    function (callback) {
                        client.query('SELECT * FROM user_sub_order AS uso WHERE uso.orderid=$1', [id], function (err, result) {
                            if (err) {
                                return callback(new Error(err.message || "获取子订单失败id=" + id));
                            }
                            callback(null, result.rows.length ? result.rows : [])
                        });
                    },
                    function (result, callback) {
                        Async.map(result, function (element, callback) {
                            Async.parallel([
                                function (callback) {
                                    Goods.get(element.goodsid, function (err, goods) {
                                        callback(err, goods);
                                    });
                                }
                            ], function (err, results) {
                                element.goods = results[0];
                                callback(null, element);
                            });
                        }, function (err, results) {
                            if (err) {
                                return callback(new Error(err.message));
                            }
                            callback(null, results);
                        });
                    }
                ], function (err, userSubOrders) {
                    callback(err, userSubOrders);
                });
            }
        ], function (err, results) {
            userOrder.address = results[0];
            userOrder.userSubOrderList = results[1];
            callback(null, userOrder);
        });
    },

    getOrder: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_order AS uo WHERE uo.id=$1', [id], function (err, result) {
                if (err) {
                    throw new Error(err.message || '获取父订单错误' + "id=" + id);
                }
                var userOrder = result.rows.length ? result.rows[0] : null;
                Order.processGetOrderResult(err, client, done, userOrder, callback);
            });
        });
    },

    updateUserSubOrderFinishTime: function (orderId, finishTime, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE user_sub_order SET finishtime=$1 WHERE id=$2",
                [finishTime, orderId], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新子订单结束时间出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    updateUserOrderFinishTime: function (orderCode, finishTime, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE user_order SET finishtime=$1 WHERE id=$2",
                [finishTime, orderCode], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新订单结束时间出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    updateUserOrderStatus: function (orderId, status, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE user_order SET status=$1 WHERE id=$2",
                [status, orderId], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "更新订单状态出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    updateUserOrderTotalPrice: function (orderId, totalPrice, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE user_order SET totalprice=$1 WHERE id=$2",
                [totalPrice, orderId], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "更新订单总价格失败");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    insertUserOrder: function (userOrder, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO user_order(ordercode, ordercomment, userid, addressid, status, paymenttypeid, totalprice) VALUES($1, $2, $3, $4, $5, $6, $7)",
                [userOrder.ordercode, userOrder.ordercomment, userOrder.userid, userOrder.addressid, userOrder.status, userOrder.paymenttypeid, userOrder.totalprice], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存父订单数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    insertUserSubOrder: function (userSubOrder, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO user_sub_order(orderid, ordertype, goodsid, amount, subtotalprice, status, deliverywayid) VALUES($1, $2, $3, $4, $5, $6, $7)",
                [userSubOrder.orderid, userSubOrder.ordertype, userSubOrder.goodsid, userSubOrder.amount,
                    userSubOrder.subtotalprice, userSubOrder.status, userSubOrder.deliverywayid],
                function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存子订单数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("DELETE FROM user_sub_order WHERE orderid=$1", [id], function (err, result) {
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "删除子订单数据出错");
                }
                client.query("DELETE FROM user_order WHERE id=$1", [id], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "删除父订单数据出错");
                    }
                    callback(null, result.rowCount);
                });
            });
        });
    },

    payedGoodsDeposit: function (userId, goodsId, callback) {
        Order.getOrderListByType(userId, goodsId, 1, function (err, orderList) {
            if (orderList && orderList.length > 0) {
                return callback(null, true);
            }
            callback(null, false);
        });
    },

    payedGoods: function (userId, goodsId, callback) {
        Order.getOrderListByType(userId, goodsId, 0, function (err, orderList) {
            if (orderList && orderList.length > 0) {
                return callback(null, true);
            }
            callback(null, false);
        });
    },

    getOrderListByType: function (userId, goodsId, orderType, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("SELECT uo.* AS paycount FROM user_sub_order AS uso JOIN user_order AS uo ON uso.orderid=uo.id WHERE userid=$1 AND goodsid=$2 AND uo.status>0 AND ordertype=$3",
                [userId, goodsId, orderType], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "查询是否支付订单出错");
                    }
                    callback(null, result.rows.length ? result.rows : []);
                });
        });
    },

    getOrdersByUserIdAndGoodsId: function (userId, goodsId, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("SELECT uo.id, uo.ordercomment, uo.addressid, uo.totalprice, uo.paymenttypeid, uo.status, uso.ordertype, uso.deliverywayid, uo.createtime FROM user_order AS uo JOIN user_sub_order AS uso ON uso.orderid=uo.id WHERE uo.userid=$1 AND uso.goodsid=$2",
                [userId, goodsId], function (err, result) {
                    done();
                    if (err) {
                        throw new Error(err.message || "查询保证金订单出错");
                    }
                    callback(err, result.rows.length ? result.rows : []);
                });
        });
    }
};

module.exports = Order;
