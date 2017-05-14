var BlockChainRequest = require('./BlockChainRequest');

module.exports = function (app) {

    /**
     * 获取商品的区块链信息
     */
    app.get("/v1/block-chain/bid-info", function (req, res, next) {
        if (1) {
            return res.send({
                code: 0,
                data: []
            });
        }
        BlockChainRequest.getGoodsBidInfoBlockChainList(req, function (err, data) {
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
     * 获取商品的计算脚本区块链信息
     */
    app.get("/v1/block-chain/compute-script", function (req, res, next) {
        if (1) {
            return res.send({
                code: 0,
                data: ""
            });
        }
        BlockChainRequest.getComputeScript(req, function (err, data) {
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
     * 获取商品的区块链信息
     */
    app.get("/v1/block-chain/goods", function (req, res, next) {
        if (1) {
            return res.send({
                code: 0,
                data: []
            });
        }
        BlockChainRequest.getGoodsBlockChain(req, function (err, data) {
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