/**
 * Created by heipacker on 16-12-18.
 */
var Async = require('async');

var ApiRequest = require('../jingtum-api/ApiRequest');
var ApplicationError = require('../error/ApplicationError');

var AuctionConfig = require('./AuctionConfig');
var AuctionRequest = require('./AuctionRequest');
var Goods = require('./Goods');
var RedisClient = require('../common/RedisClient');

/**
 * 竞标出价过滤
 * @param transaction
 * @param transType
 * @returns {boolean}
 */
function auctionPredicate(transaction, transType) {
    if (transaction.memos && transaction.memos.length == 1) {
        var memo = transaction.memos[0];
        if (memo.MemoType == 'string') {
            var memoDataJson = memo.MemoData;
            if (memoDataJson) {
                try {
                    var memoData = JSON.parse(memoDataJson);
                    if (memoData && memoData.trans_type == transType) {
                        return true;
                    }
                } catch (ex) {
                    console.error("parse json error", memoDataJson);
                }
            }
        }
    }
    return false;
}

var blockChainRequest = {

    /**
     * 获取商品到辅助帐号的交易信息
     * @param goods
     * @param memoType
     * @param callback
     */
    getGoodsTransactionList: function (goods, memoType, callback) {
        var goodsAssistAccount = AuctionRequest.getGoodsAssistAccount();
        var destinationAccount = goodsAssistAccount.address;
        var params = {
            address: goods.address,
            destination_account: destinationAccount,
            results_per_page: 10,
            page: 1
        };
        var result = [];
        var selfCallback = function (err, data, result) {
            if (err || !data || !data.length) {
                return callback(err, result);
            }
            for (var i = 0; i < data.length; i++) {
                var transaction = data[i];
                if (transaction.type == 'sent') {
                    if (auctionPredicate(transaction, memoType)) {
                        result.push(transaction)
                    }
                }
            }
            params.address = goods.address;
            //继续查询下一个分页信息
            params.page = params.page + 1;
            ApiRequest.getTransactionList(params, function (err, data) {
                selfCallback(err, data, result);
            });
        };
        ApiRequest.getTransactionList(params, function (err, data) {
            selfCallback(err, data, result);
        });
    },

    /**
     * 获取商品的计算脚本
     * @param req
     * @param callback
     */
    getComputeScript: function (req, callback) {
        if (!req.query || !req.query.id) {
            return callback(new ApplicationError("params missing", 400, 1));
        }
        Goods.get(req.query.id, function (err, goods) {
            Async.waterfall([
                function (callback) {
                    blockChainRequest.getGoodsTransactionList(goods, AuctionConfig.computeScriptTransType, function (err, transactions) {
                        return callback(null, transactions);
                    });
                }, function (transactions, callback) {
                    Async.map(transactions, function (transaction, callback) {
                        callback(null, JSON.parse(transaction.memos[0]['MemoData']));
                    }, function (err, memoDataList) {
                        Async.sortBy(memoDataList, function (memoData, callback) {
                            callback(null, memoData.index);
                        }, function (err, memoDataList) {
                            Async.map(memoDataList, function (memoData, callback) {
                                callback(null, memoData['function']);
                            }, function (err, results) {
                                if (err) {
                                    return callback(err, null);
                                }
                                var computeScript = results.join('\n\n');
                                callback(null, computeScript);
                            });
                        });
                    });
                }
            ], function (err, result) {
                callback(err, result);
            });
        });
    },

    /**
     * 获取商品信息
     * @param req
     * @param callback
     */
    getGoodsBlockChain: function (req, callback) {
        var goodsId = req.query.id;
        Goods.get(goodsId, function (err, goods) {
            if (err) {
                return callback(new ApplicationError("商品不存在", 400));
            }
            blockChainRequest.getGoodsTransactionList(goods, AuctionConfig.transType, function (err, transactions) {
                return callback(err, transactions);
            });
        });
    },

    /**
     * 获取商品的出价列表信息
     * @param req
     * @param callback
     */
    getGoodsBidInfoBlockChainList: function (req, callback) {
        if (!req.query || !req.query.id) {
            return callback(new ApplicationError("参数异常", 400))
        }
        var params = {
            id: req.query.id,
            page: req.query.page ? req.query.page : 1,
            pageSize: req.query.pageSize ? req.query.pageSize : 8
        };
        if (!params.id) {
            return callback(new ApplicationError("商品代码为空", 400));
        }
        Goods.get(params.id, function (err, goods) {
            if (!goods) {
                return callback(new ApplicationError("商品不存在", 400, 2));
            }
            var result = [];
            var loopCallback = function (err, transactions) {
                if (!transactions || transactions.length == 0) {
                    return callback(null, result);
                }
                for (var i = 0; i < transactions.length; ++i) {
                    result.push(transactions[i]);
                }
                blockChainRequest.goodsBidInfoBlockChainList(params, goods, loopCallback);
            };
            blockChainRequest.goodsBidInfoBlockChainList(params, goods, loopCallback);
        });
    },

    /**
     * 竞标历史信息
     * @param params
     * @param goods
     * @param callback
     */
    goodsBidInfoBlockChainList: function (params, goods, callback) {
        var params1 = {
            address: goods.address,
            exclude_failed: params.exclude_failed === undefined || params.exclude_failed === null ? true : params.exclude_failed,
            direction: "incoming",
            results_per_page: params.pageSize,
            page: params.page
        };
        ApiRequest.getTransactionList(params1, function (err, data) {
            if (err) {
                console.error("get", goods.code, "params", params1, "transaction list error", err);
                return callback(err, data);
            }
            if (!data || data.length == 0) {
                return callback(null, data);
            }
            Async.filter(data, function (transaction, callback) {
                if (transaction.type != 'received') {
                    return callback(null, false);
                }
                callback(null, auctionPredicate(transaction, AuctionConfig.transType));
            }, function (err, transactions) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, transactions);
            });
        });
    }
};

module.exports = blockChainRequest;