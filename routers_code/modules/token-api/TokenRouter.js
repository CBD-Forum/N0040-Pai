var TokenRequest = require('./TokenRequest');

TokenRequest.init();

module.exports = function (app) {

    /**
     * 刷新token
     */
    app.put('/v1/token/refresh', function (req, res, next) {
        TokenRequest.updateOrder(req, function (err, address) {
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
     * 获取token
     */
    app.get('/v1/token', function (req, res, next) {
        TokenRequest.getOrder(req, function (err, order) {
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
};