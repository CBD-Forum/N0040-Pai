var AuctionRequest = require('./AuctionRequest');
var Auth = require('../common/SessionAuth');

AuctionRequest.init();

module.exports = function (app) {

    /**
     * 获取拍卖商品
     */
    app.get('/v1/goods', function (req, res, next) {
        AuctionRequest.getGoods(req, function (err, goods) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: goods,
                    timestamp: Date.now()
                });
            }
        });
    });

    /**
     * 删除商品
     */
    app.delete("/v1/goods", function (req, res, next) {
        AuctionRequest.deleteGoods(req.query, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: data
                });
            }
        });
    });

    /**
     * 添加拍卖商品
     */
    app.post('/v1/goods', function (req, res, next) {
        AuctionRequest.addGoods(req.body, function (err, goods) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: goods
                });
            }
        });
    });

    /**
     * 获取拍卖商品
     */
    app.get('/v1/goods/list', function (req, res, next) {
        AuctionRequest.listGoods(req, function (err, goods) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: goods,
                    timestamp: Date.now()
                });
            }
        });
    });

    /**
     * 结束商品的拍卖
     */
    app.post("/v1/end-auction", Auth.authorize, function (req, res, next) {
        AuctionRequest.endAuction(req, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: data
                });
            }
        });
    });

    /**
     * 获取出价列表
     */
    app.get("/v1/auction-list", function (req, res, next) {
        AuctionRequest.getAuctionList(req, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: data
                });
            }
        });
    });

    /**
     * 参加拍卖商品
     */
    app.post('/v1/do-auction', Auth.authorize, function (req, res, next) {
        AuctionRequest.doAuction(req, function (err, auction) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: auction
                });
            }
        });
    });

    /**
     *
     */
    app.get("/v1/do-compute", function (req, res, next) {
        AuctionRequest.makeCompute(req, function (err, data) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: data
                });
            }
        });
    });
};