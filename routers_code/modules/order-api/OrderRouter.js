var OrderRequest = require('./OrderRequest');
var Auth = require('../common/SessionAuth');

OrderRequest.init();

module.exports = function (app) {

    /**
     * 新增保证金订单
     */
    app.post('/v1/order/deposit', Auth.authorize, function (req, res, next) {
        OrderRequest.addDepositOrder(req, function (err, id) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: id
                });
            }
        });
    });

    /**
     * 新增订单接口1
     */
    app.post('/v1/order/fromdeposit', Auth.authorize, function (req, res, next) {
        OrderRequest.addOrderFromDeposit(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 新增订单
     */
    app.post('/v1/order', Auth.authorize, function (req, res, next) {
        OrderRequest.addOrder(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 删除订单
     */
    app.delete('/v1/order', Auth.authorize, function (req, res, next) {
        OrderRequest.deleteOrder(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    /**
     * 修改订单信息
     */
    app.put('/v1/order', Auth.authorize, function (req, res, next) {
        OrderRequest.updateOrder(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 查看订单
     */
    app.get('/v1/order', Auth.authorize, function (req, res, next) {
        OrderRequest.getOrder(req, function (err, order) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: order
                });
            }
        });
    });

    /**
     * 获取订单列表
     */
    app.get('/v1/orders', Auth.authorize, function (req, res, next) {
        OrderRequest.getOrderList(req, function (err, orderList) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: orderList
                });
            }
        });
    });

    /**
     * 余额支付
     */
    app.post('/v1/balance/pay', Auth.authorize, function (req, res, next) {
        OrderRequest.balancePay(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    /**
     * 微信支付
     */
    app.get('/v1/wxpay/pay', Auth.authorize, function (req, res, next) {
        OrderRequest.wxpayPay(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    /**
     * 微信企业支付
     */
    app.get('/v1/withdrawals', function (req, res, next) {
        OrderRequest.withdrawals1(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    /**
     * 微信支付回调地址
     */
    app.post('/v1/wxpay/callback', function (req, res, next) {
        OrderRequest.wxpayCallback(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.set('Content-Type', 'text/xml');
                res.send(result);
            }
        });
    });
};