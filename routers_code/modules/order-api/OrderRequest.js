/**
 * Created by weijia on 16-11-20.
 */
const request = require('request');
var ApiRequest = require('../jingtum-api/ApiRequest');
var Async = require('async');
var parseString = require('xml2js').parseString;
var xml = require('xml');
var Schedule = require('node-schedule');

var Order = require('./Order');
var User = require('../login-api/User');

var hash = require('../../pass').hash;
var AuctionConfig = require('../auction-api/AuctionConfig');
var AuctionRequest = require('../auction-api/AuctionRequest');
var LoginConfig = require('../login-api/LoginConfig');
var OrderConfig = require('./OrderConfig');
var ObjConfig = require('../object-api/ObjConfig');
var Goods = require('../auction-api/Goods');
var ApplicationError = require('../error/ApplicationError');
var RedisClient = require('../common/RedisClient');
var RKG = require('../common/RedisKeyGenerator');
var SignUtils = require('./SignUtils');
var LocalTime = require('../common/Time');

const HTTP_SUCCESS_CODE = 200;

var orderRequest = {

    init: function () {
        var job = Schedule.scheduleJob(OrderConfig.scheduleJobCron, function () {
            console.log("global order job start", LocalTime.localDateFormatter(Date.now()).format());
            var pagination = {
                page: 1,
                pageSize: 20
            };
            orderRequest.doExpires(pagination);
        });
    },

    doExpires: function (pagination) {
        Order.listOrder(pagination, function (err, userOrderList) {
            if (err) {
                return console.error("获取父订单列表失败");
            }
            if (!userOrderList || userOrderList.length == 0) {
                return;
            }
            Async.mapLimit(userOrderList, 5, function (userOrder, callback) {
                callback(null, orderRequest.isEnded(userOrder));
            }, function (err, results) {
                if (err) {
                    return console.error("do expire error", err);
                }
                pagination.page = pagination.page + 1;
                orderRequest.doExpires(pagination);
            });
        });
    },

    getOrderCode: function (callback) {
        RedisClient.incr(RKG.generateOrderCodeNumber(), function (err, result) {
            if (err) {
                console.error("getOrderCodeNumber error", err);
            }
            var curDate = new Date();
            return callback(null, (curDate.getYear() + 1900) + "" + curDate.getMonth() + "" + curDate.getDay() + ""
                + curDate.getHours() + "" + curDate.getMinutes() + "" + curDate.getSeconds() + "" + result);
        });
    },

    addDepositOrder: function (req, callback) {
        var goodsId = req.body.goodsid;
        Async.waterfall([
            function (callback) {
                orderRequest.getOrderCode(function (err, orderCode) {
                    callback(null, orderCode);
                });
            },
            function (orderCode, callback) {
                Goods.get(goodsId, function (err, goods) {
                    if (err) {
                        return callback(new ApplicationError(err && err.message || "获取商品失败", 500, 1));
                    }
                    if (goods.status == 1) {//已经结束了
                        return callback(new ApplicationError("拍卖已经结束, 创建订单失败.", 500, 2));
                    }
                    callback(null, {
                        orderCode: orderCode,
                        goods: goods
                    });
                });
            },
            function (result, callback) {
                var orderCode = result.orderCode;
                var goods = result.goods;
                var userOrder = {
                    ordercode: orderCode,
                    ordercomment: req.body.ordercomment,
                    userid: req.session.user.userid,
                    addressid: parseInt(req.body.addressid),
                    status: 0,
                    totalprice: goods.deposit * 1,
                    paymenttypeid: parseInt(req.body.paymenttypeid)
                };
                Order.insertUserOrder(userOrder, function (err, effects) {
                    if (err) {
                        console.error("create parent order error", err);
                        return callback(new ApplicationError(err && err.message || "创建父订单失败", 500, 3));
                    }
                    callback(null, {
                        userOrder: userOrder,
                        goods: goods
                    });
                });
            },
            function (result, callback) {
                var userOrder = result.userOrder;
                Order.getByOrderCode(userOrder.ordercode, function (err, userOrder) {
                    if (err) {
                        return callback(new ApplicationError(err && err.message || "查询父订单失败", 500, 4));
                    }
                    result.userOrder = userOrder;
                    callback(null, result);
                });
            },
            function (result, callback) {
                var userOrder = result.userOrder;
                var goods = result.goods;
                var newUserSubOrder = {
                    orderid: userOrder.id,
                    ordertype: 1,//保证金类型
                    goodsid: goods.id,
                    amount: 1,
                    status: 0,
                    subtotalprice: goods.deposit * 1,
                    deliverywayid: req.body.deliverywayid
                };
                orderRequest.validateSubOrder(newUserSubOrder, function (err, newUserSubOrder) {
                    if (err) {
                        return callback(err);
                    }
                    Order.insertUserSubOrder(newUserSubOrder, function (err, effects) {
                        if (err) {
                            return callback(new ApplicationError(err.message || err, 500, 5));
                        }
                        callback(null, {
                            goods: goods,
                            userOrder: userOrder,
                            userSubOrder: newUserSubOrder
                        });
                    });
                });
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result.userOrder.id);
        });
    },

    addOrderFromDeposit: function (req, callback) {
        var goodsId = req.body.goodsid;
        Async.waterfall([
            function (callback) {
                Goods.get(goodsId, function (err, goods) {
                    if (err) {
                        return callback(new ApplicationError(err && err.message || "获取商品失败", 500, 1));
                    }
                    callback(null, goods);
                });
            }
        ], function (err, goods) {
            if (err) {
                return callback(err);
            }
            //判断是否已经创建了没过期的订单, 如果有直接返回, 如果没有 则创建一个新的
            var userId = req.session.user.userid;
            Order.getOrdersByUserIdAndGoodsId(userId, goods.id, function (err, userSubOrderList) {
                if (err) {
                    return callback(new ApplicationError("不存在保证金订单", 500, 2));
                }
                var order = null;
                for (var i = 0; i < userSubOrderList.length; ++i) {
                    var userSubOrderItem = userSubOrderList[i];
                    if (userSubOrderItem.status != 0) {//已经结束
                        if (userSubOrderItem.ordertype = 1) {//保证金
                            order = userSubOrderItem;
                            break;
                        } else {//已经下单 且没过期, 则直接返回
                            if (!orderRequest.isEnded(userSubOrderItem)) {
                                return callback(null, userSubOrderItem);
                            }
                        }
                    }
                }
                if (order == null) {
                    return callback(new ApplicationError("用户未交保证金", 400, 3));
                }
                Async.waterfall([
                    function (callback) {
                        orderRequest.getOrderCode(function (err, orderCode) {
                            callback(null, orderCode);
                        });
                    },
                    function (orderCode, callback) {
                        var newUserOrder = {
                            ordercode: orderCode,
                            ordercomment: goods.goodsname + "(" + goods.id + ")付款",
                            userid: userId,
                            addressid: order.addressid,
                            status: 0,
                            totalprice: goods.price - order.totalprice,
                            paymenttypeid: order.paymenttypeid
                        };
                        orderRequest.validateOrder(newUserOrder, function (err, newUserOrder) {
                            if (err) {
                                return callback(err);
                            }
                            Order.insertUserOrder(newUserOrder, function (err, effects) {
                                if (err) {
                                    return callback(new ApplicationError(err && err.message || "创建父订单失败", 500, 4));
                                }
                                callback(null, newUserOrder);
                            });
                        });
                    },
                    function (newUserOrder, callback) {
                        Order.getByOrderCode(newUserOrder.ordercode, function (err, userOrder) {
                            if (err) {
                                return callback(new ApplicationError(err && err.message || "查询父订单失败", 500, 6));
                            }
                            callback(null, userOrder);
                        });
                    },
                    function (userOrder, callback) {
                        var newUserSubOrder = {
                            orderid: userOrder.id,
                            ordertype: 0,//类型
                            goodsid: goods.id,
                            amount: 1,
                            status: 0,
                            subtotalprice: goods.price - order.totalprice,
                            deliverywayid: order.deliverywayid
                        };
                        orderRequest.validateSubOrder(newUserSubOrder, function (err, newUserSubOrder) {
                            if (err) {
                                return callback(err);
                            }
                            Order.insertUserSubOrder(newUserSubOrder, function (err, effects) {
                                if (err) {
                                    return callback(new ApplicationError(err.message || err, 500, 6));
                                }
                                callback(null, userOrder);
                            });
                        });
                    }
                ], function (err, result) {
                    callback(err, result);
                });
            });
        });
    },

    addOrder: function (req, callback) {
        var goodsId = req.body.goodsid;
        Async.waterfall([
            function (callback) {
                orderRequest.getOrderCode(function (err, orderCode) {
                    callback(null, orderCode);
                });
            },
            function (orderCode, callback) {
                var newUserOrder = {
                    ordercode: orderCode,
                    ordercomment: req.body.ordercomment,
                    userid: req.session.user.userid,
                    addressid: parseInt(req.body.addressid),
                    status: 0,
                    totalprice: 0,
                    paymenttypeid: parseInt(req.body.paymenttypeid)
                };
                orderRequest.validateOrder(newUserOrder, function (err, newUserOrder) {
                    if (err) {
                        return callback(err);
                    }
                    Order.insertUserSubOrder(newUserOrder, function (err, effects) {
                        if (err) {
                            return callback(new ApplicationError(err && err.message || "创建父订单失败", 500, 1));
                        }
                        callback(null, newUserOrder);
                    });
                });
            },
            function (newUserOrder, callback) {
                Order.getByOrderCode(newUserOrder.ordercode, function (err, userOrder) {
                    if (err) {
                        return callback(new ApplicationError(err && err.message || "查询父订单失败", 500, 2));
                    }
                    callback(null, userOrder);
                });
            },
            function (userOrder, callback) {
                Goods.get(goodsId, function (err, goods) {
                    if (err) {
                        return callback(new ApplicationError(err && err.message || "获取商品失败", 500, 3));
                    }
                    callback(null, {
                        goods: goods,
                        userOrder: userOrder
                    });
                });
            },
            function (result, callback) {
                var userOrder = result.userOrder;
                var goods = result.goods;
                var newUserSubOrder = {
                    orderid: userOrder.id,
                    ordertype: 0,//类型
                    goodsid: goods.id,
                    amount: 1,
                    status: 0,
                    subtotalprice: goods.price * 1,
                    deliverywayid: req.body.deliverywayid
                };
                orderRequest.validateSubOrder(newUserSubOrder, function (err, newUserSubOrder) {
                    if (err) {
                        return callback(err);
                    }
                    Order.insertUserSubOrder(newUserSubOrder, function (err, effects) {
                        if (err) {
                            return callback(new ApplicationError(err.message || err, 500, 3));
                        }
                        callback(null, {
                            goods: goods,
                            userOrder: userOrder,
                            userSubOrder: newUserSubOrder
                        });
                    });
                });
            }
        ], function (err, newOrder) {
            if (err) {
                return callback(err);
            }
            callback(null, newOrder);
        });
    },

    deleteOrder: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Order.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    validateSubOrder: function (subOrder, callback) {
        if (!orderRequest.validateType(subOrder.ordertype) || !orderRequest.validateType(subOrder.goodsid)
            || !orderRequest.validateType(subOrder.amount) || !orderRequest.validateType(subOrder.subtotalprice)
            || !orderRequest.validateType(subOrder.deliverywayid)) {
            return callback(new ApplicationError("参数不合法", 400, 1))
        }
        callback(null, subOrder);
    },

    validateOrder: function (newOrder, callback) {
        if (!orderRequest.validateType(newOrder.addressid) || !orderRequest.validateType(newOrder.paymenttypeid)) {
            return callback(new ApplicationError("参数不合法", 400, 1))
        }
        callback(null, newOrder);
    },

    validateType: function (type) {
        return !(type == null || type == undefined);
    },

    updateOrder: function (req, callback) {
        var newOrder = {
            id: req.body.id,
            ordercode: req.body.ordercode,
            ordercomment: req.body.ordercomment,
            userid: req.session.user.userid,
            addressid: req.body.addressid,
            status: req.body.status,
            paymenttypeid: req.body.paymenttypeid,
            deliverywayid: req.body.deliverywayid,
            deliverytime: req.body.deliverytime,
            deliveredtime: req.body.deliveredtime,
            finishtime: req.body.finishtime
        };
        if (!newOrder.id) {
            return callback(new ApplicationError("参数不合法", 400, 1));
        }
        orderRequest.validateOrder(newOrder, function (err, newOrder) {
            if (err) {
                return callback(err);
            }
            Order.update(newOrder, function (err, effects) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 2));
                }
                callback(null, newOrder);
            });
        });
    },

    getOrder: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Order.getOrder(params.id, function (err, order) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            orderRequest.populateOrder(order);
            callback(null, order);
        });
    },

    getOrderList: function (req, callback) {
        var userId = req.session.user.userid;
        Order.list(userId, function (err, orderList) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 1));
            }
            for (var i = 0; i < orderList.length; i++) {
                orderRequest.populateOrder(orderList[i]);
            }
            return callback(null, orderList);
        });
    },

    populateOrder: function (order) {
        //修改地址
        var userSubOrderList = order.userSubOrderList;
        if (!userSubOrderList) {
            return;
        }
        for (var i = 0; i < userSubOrderList.length; ++i) {
            var userSubOrder = userSubOrderList[i];
            if (!userSubOrder) {
                continue;
            }
            var goods = userSubOrder.goods;
            if (!goods) {
                continue;
            }
            var images = goods['images'];
            if (images) {
                var imageUrls = [];
                for (var j = 0; j < images.length; ++j) {
                    imageUrls.push(ObjConfig.url + "?id=" + images[j]);
                }
                goods['images'] = imageUrls;
            }
        }
    },

    createRequestXml: function (tradeType, ip, order) {
        var options1 = {};
        var requestParams = [
            {
                xml: [
                    {
                        appid: OrderConfig.appid
                    },
                    {
                        mch_id: OrderConfig.mch_id
                    },
                    {
                        nonce_str: SignUtils.randomStr(false, 32)
                    },
                    {
                        body: order.ordercomment
                    },
                    {
                        out_trade_no: order.ordercode
                    },
                    {
                        total_fee: Math.round(order.totalprice * 100)//单位是分
                    },
                    {
                        spbill_create_ip: ip
                    },
                    {
                        notify_url: LoginConfig.homePage + "/v1/wxpay/callback"
                    },
                    {
                        trade_type: tradeType ? tradeType : "NATIVE"//默认扫码支付
                    },
                    {
                        product_id: order.id
                    }
                ]
            }
        ];
        var paramsArrays = requestParams[0].xml;
        var sign = SignUtils.signRequest(OrderConfig.apikey, paramsArrays);
        paramsArrays.push({
            sign: sign
        });
        return xml(requestParams, options1);
    },

    isEnded: function (order) {
        if (order.status == -1) {
            return true;
        }
        var createTime = order.createtime;
        var expired = (createTime.getTime() + (OrderConfig.expires * 60 * 60 * 1000)) < Date.now();
        if (expired) {
            //设置过期状态
            Order.updateUserOrderStatus(order.id, -1, function (err, effects) {
                if (err) {
                    return console.error("update user order error", err);
                }
                console.log("update user order success effects", effects);
            });
        }
        return expired;
    },

    /**
     * 余额支付接口
     * @param req
     * @param callback
     */
    balancePay: function (req, callback) {
        var params = req.body;
        if (!params) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        var orderId = params.id;
        var password = params.password;
        var userId = req.session.user.userid;
        Async.waterfall([
            function (callback) {
                User.getByUserId(userId, function (err, user) {
                    callback(err, user);
                });
            },
            function (user, callback) {
                hash(password, user.salt, function (err, hash) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    if (hash != user.hash) {
                        return callback(new ApplicationError('用户名或者密码错误', 403, 3));
                    }
                    callback(null, user);
                });
            },
            function (user, callback) {
                Order.getOrder(orderId, function (err, order) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    if (orderRequest.isEnded(order)) {
                        return callback(new ApplicationError("订单过期", 400, 3))
                    }
                    ApiRequest.payments(user.address, user.secret, AuctionConfig.coinsAccount,
                        "0.01"/*order.totalprice*/, "SWT"/*AuctionConfig.coinsCurrency*/, ""/*AuctionConfig.issuer*/, [], true,
                        function (err, response) {
                            if (err) {
                                return callback(err);
                            }
                            orderRequest.orderCallback(order.ordercode, callback);
                        }
                    );
                });
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    wxpayPay: function (id, ip, price, callback) {
        var xmlStr = orderRequest.createRequestXml("NATIVE", ip, id);
        var url = OrderConfig.weixinUrl + "pay/unifiedorder";
        var options = {
            method: 'POST',
            url: url,
            headers: {'Connection': 'close'},
            json: true,
            body: xmlStr
        };
        console.log("request", options);
        var timestamp = Date.now();
        request(options, function (err, res, data) {
            console.log(url, "elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode !== HTTP_SUCCESS_CODE) {
                return callback(new ApplicationError("请求微信服务器失败", 400, 4));
            }
            if (!data) {
                return callback(new ApplicationError("请求微信服务器没响应数据", 500, 5))
            }
            parseString(data, function (err, result) {
                var responseData = result.xml;
                if (!orderRequest.weixinRetIsX(responseData.return_code, 'SUCCESS')) {
                    return callback(new ApplicationError(responseData.return_msg, 500, 6));
                }
                if (!orderRequest.weixinRetIsX(responseData.return_msg, 'OK')) {
                    return callback(new ApplicationError(responseData.err_code, 500, 7));
                }
                console.log(responseData.prepay_id);
                console.log(responseData.code_url[0]);
                return callback(null, responseData.code_url[0]);
            });
        });
    },

    /**
     * 微信支付接口
     * @param req
     * @param callback
     */
    wxpayPay: function (req, callback) {
        var params = req.query;
        if (!params) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        var orderId = params.id;
        Order.getOrder(orderId, function (err, order) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            if (orderRequest.isEnded(order)) {
                return callback(new ApplicationError("订单过期", 400, 3))
            }
            var xmlStr = orderRequest.createRequestXml(req.tradetype, req.ip, order);
            var url = OrderConfig.weixinUrl + "pay/unifiedorder";
            var options = {
                method: 'POST',
                url: url,
                headers: {'Connection': 'close'},
                json: true,
                body: xmlStr
            };
            console.log("request", options);
            var timestamp = Date.now();
            request(options, function (err, res, data) {
                console.log(url, "elapsed", Date.now() - timestamp, "mills");
                if (err) {
                    return callback(new Error(err), null);
                }
                if (res.statusCode !== HTTP_SUCCESS_CODE) {
                    return callback(new ApplicationError("请求微信服务器失败", 400, 4));
                }
                if (!data) {
                    return callback(new ApplicationError("请求微信服务器没响应数据", 500, 5))
                }
                parseString(data, function (err, result) {
                    var responseData = result.xml;
                    if (!orderRequest.weixinRetIsX(responseData.return_code, 'SUCCESS')) {
                        return callback(new ApplicationError(responseData.return_msg, 500, 6));
                    }
                    if (!orderRequest.weixinRetIsX(responseData.return_msg, 'OK')) {
                        return callback(new ApplicationError(responseData.err_code, 500, 7));
                    }
                    console.log(responseData.prepay_id);
                    console.log(responseData.code_url[0]);
                    return callback(null, responseData.code_url[0]);
                });
            });
        });
    },

    weixinRetIsX: function (returnCodeArray, message) {
        if (!returnCodeArray) {
            return false;
        }
        for (var i = 0; i < returnCodeArray.length; i++) {
            if (returnCodeArray[i] === message) {
                return true;
            }
        }
        return false;
    },

    createRet: function (code, msg) {
        var options = {};
        return xml([
            {
                xml: [
                    {
                        return_code: code
                    },
                    {
                        return_msg: msg
                    }
                ]
            }
        ], options);
    },

    /**
     * 用户提现
     * @param req
     * @param callback
     */
    withdrawals1: function (req, callback) {
        var params = req.body;
        if (!params) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        var userId = params.userid;
        User.getByUserId(userId, function (err, user) {
            if (err) {
                return callback(err, null);
            }
            var openId = user.openid;
            var desc = "这是区块链杂货铺支付给您最近在平台上的收入.";
            orderRequest.enterprisePayment(openId, amount, desc, callback);
        });
    },

    /**
     * 用户提现
     * @param userId
     * @param amount
     * @param callback
     */
    withdrawals: function (userId, amount, callback) {
        User.getByUserId(userId, function (err, user) {
            if (err) {
                return callback(err, null);
            }
            var openId = user.openid;
            var desc = "这是区块链杂货铺支付给你您的收入.";
            orderRequest.enterprisePayment(openId, amount, desc, callback);
        });
    },

    createEnterprisePaymentRequestXml: function (orderCode, openId, amount, desc) {
        var options1 = {};
        var requestParams = [
            {
                xml: [
                    {
                        mch_appid: OrderConfig.appid
                    },
                    {
                        mchid: OrderConfig.mch_id
                    },
                    {
                        nonce_str: SignUtils.randomStr(false, 32)
                    },
                    {
                        partner_trade_no: orderCode
                    },
                    {
                        openid: openId
                    },
                    {
                        check_name: "NO_CHECK"//"OPTION_CHECK"
                    },
                    {
                        amount: Math.round(amount * 100)//单位是分
                    },
                    {
                        desc: desc
                    },
                    {
                        notify_url: LoginConfig.homePage + "/v1/wxpay/callback"
                    },
                    {
                        spbill_create_ip: OrderConfig.globalIp
                    }
                ]
            }
        ];
        var paramsArrays = requestParams[0].xml;
        var sign = SignUtils.signRequest(OrderConfig.apikey, paramsArrays);
        paramsArrays.push({
            sign: sign
        });
        return xml(requestParams, options1);
    },

    /**
     * 企业支付
     * @param openId
     * @param amount
     * @param desc
     * @param callback
     */
    enterprisePayment: function (openId, amount, desc, callback) {
        orderRequest.getOrderCode(function (err, orderCode) {
            var xmlStr = orderRequest.createEnterprisePaymentRequestXml(orderCode, openId, amount, desc);
            var url = OrderConfig.weixinUrl + "mmpaymkttransfers/promotion/transfers";
            var fs = require('fs');
            var path = require('path');
            var p12File = path.resolve(__dirname, 'bin/ssl/apiclient_cert.p12');
            var certFile = path.resolve(__dirname, 'bin/ssl/apiclient_cert.pem');
            var keyFile = path.resolve(__dirname, 'bin/ssl/apiclient_key.pem');
            var caFile = path.resolve(__dirname, 'bin/ssl/rootca.pem');

            var options = {
                method: 'POST',
                url: url,
                headers: {'Connection': 'close'},
                agentOptions: {
                    pfx: fs.readFileSync(p12File),
                    passphrase: OrderConfig.mch_id
                },
                json: true,
                body: xmlStr
            };
            console.log("request", options);
            var timestamp = Date.now();
            request(options, function (err, res, data) {
                console.log(url, "elapsed", Date.now() - timestamp, "mills");
                if (err) {
                    return callback(new Error(err), null);
                }
                if (res.statusCode !== HTTP_SUCCESS_CODE) {
                    return callback(new ApplicationError("请求微信服务器失败", 400, 4));
                }
                if (!data) {
                    return callback(new ApplicationError("请求微信服务器没响应数据", 500, 5))
                }
                parseString(data, function (err, result) {
                    var responseData = result.xml;
                    if (!orderRequest.weixinRetIsX(responseData.return_code, 'SUCCESS')) {
                        console.log("企业支付返回出错" + data);
                        return callback(new ApplicationError(responseData.return_msg, 500, 6));
                    }
                    if (!orderRequest.weixinRetIsX(responseData.result_code, 'SUCCESS')) {
                        console.log("企业支付结果出错" + data);
                        return callback(new ApplicationError(responseData.err_code, 500, 7));
                    }
                    console.log(responseData.partner_trade_no);
                    console.log(responseData.payment_no);
                    console.log(responseData.payment_time);
                    return callback(null, responseData);
                });
            });
        });
    },
    /**
     *
     * 微信支付回调请求
     * @param req
     * @param callback
     */
    wxpayCallback: function (req, callback) {
        var result = req.body;
        console.log(result);
        if (!result.xml) {
            return callback(null, orderRequest.createRet('FAIL', '参数格式不对'));
        }
        var data = result.xml;
        var sign = SignUtils.signWeixinCallback(OrderConfig.apikey, data);
        if (sign != data.sign[0]) {
            console.error("订单的签名不正确", data.sign, "!=", sign);
            return callback(null, orderRequest.createRet('FAIL', "签名不对"));
        }
        if (!orderRequest.weixinRetIsX(data.return_code, 'SUCCESS')) {
            console.error("订单状态不正确", data.return_code, data.return_msg);
            return callback(null, orderRequest.createRet('FAIL', data.return_msg));
        }
        var outTradeNo = data.out_trade_no[0];
        orderRequest.orderCallback(outTradeNo, callback);
    },

    orderCallback: function (outTradeNo, callback) {
        Order.getOrderByOrderCode(outTradeNo, function (err, userOrder) {
            if (err) {
                console.error("获取订单", outTradeNo, "失败", err);
                return callback(null, orderRequest.createRet('FAIL', "获取订单" + outTradeNo + "失败"));
            }
            if (!userOrder) {
                console.error("用户订单" + outTradeNo + "不存在");
                return callback(null, orderRequest.createRet('FAIL', "用户订单" + outTradeNo + "不存在"));
            }
            if (userOrder.status > 0) {
                console.warn("用户订单" + outTradeNo + "已经支付");
                return callback(null, orderRequest.createRet('SUCCESS', 'OK'));
            }
            var userSubOrder = userOrder.userSubOrderList[0];
            if (userSubOrder.ordertype == 1) {//如果是保证金订单 异步处理
                AuctionRequest.payTheDeposit(userOrder.userid, userSubOrder.goodsid, userSubOrder.subtotalprice,
                    function (err, result) {
                        if (err) {
                            return console.error("用户交保证金记录区块链逻辑失败", err, result);
                        }
                        console.log("用户交保证金记录区块链逻辑成功", result);
                    });
            }
            Order.updateUserOrderStatus(userOrder.id, 1, function (err, result) {//更新订单的状态为支付完成
                if (err) {
                    return console.error("update user sub order finish time error", err);
                }
                console.log("update userOrder ", userOrder.id, "success, effects", result);
                callback(null, orderRequest.createRet('SUCCESS', 'OK'));
            });
        });
    }
};

module.exports = orderRequest;
