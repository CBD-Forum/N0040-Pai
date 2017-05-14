var ApiRequest = require('../jingtum-api/ApiRequest');
var AuctionConfig = require('./AuctionConfig');

var auctionComputerScript = {
    transactionType: function (item) {
        if (!item || !item.memos || item.memos.length < 1 || item.type != 'received') {
            return null;
        }
        var memo = item.memos[0];
        if (memo.MemoType != 'string') {
            return null;
        }
        return JSON.parse(memo.MemoData).trans_type;
    },

    processTransaction: function (result, ts) {
        var memoData = JSON.parse(ts.memos[0].MemoData);
        if (result.maxbidindex < memoData.bid_index) {//最大的出价轮次
            result.maxbidindex = memoData.bid_index;
            result.mbuindex = memoData.bid_user_index;
            result.counterparty = ts.counterparty;
            result.cplist = [ts.counterparty];
        } else if (result.maxbidindex == memoData.bid_index) {
            if (result.mbuindex > memoData.bid_user_index) {
                result.mbuindex = memoData.bid_user_index;
                result.counterparty = ts.counterparty;
            }
            result.cplist.push(ts.counterparty);
        }
    },

    sendBackDeposit: function (rs) {
        var winner = rs.counterparty;
        var list = rs.depositlist;
        for (var i = 0; i < list.length; ++i) {
            var ts = list[i];
            console.log(winner, ts.counterparty);
            if (winner != ts.counterparty) {
                ApiRequest.payments(AuctionConfig.coinsAccount, AuctionConfig.coinsSecret, ts.counterparty,
                    JSON.parse(ts.memos[0].MemoData).deposit_price, AuctionConfig.coinsCurrency, AuctionConfig.issuer, [
                        {"memo_type": "string", "memo_data": JSON.stringify({trans_type: 'auction_deposit_back'})}
                    ], true, function (err, response) {
                        console.log("send back deposit", response, err ? err : '');
                    });
            }
        }
    },

    computeResult: function (rs, transactions) {
        if (!transactions) {
            return;
        }
        for (var i = 0; i < transactions.length; ++i) {
            var ts = transactions[i];
            var type = auctionComputerScript.transactionType(ts);
            if (type == 'do_auction') {
                auctionComputerScript.processTransaction(rs, ts);
            }
            if (type == 'auction_deposit') {
                rs.depositlist.push(ts);
            }
        }
        return rs;
    },

    processResult: function (result, callback) {
        var goods = result.goods;
        if (result.counterparty) {
            auctionComputerScript.sendBackDeposit(result);
            ApiRequest.payments(goods.address, goods.secret, result.counterparty,
                AuctionConfig.attendAuctionAmount, 'SWT', '', [
                    {
                        "memo_type": "string", "memo_data": JSON.stringify({
                        trans_type: 'auction_bid',
                        bid_index: result.maxbidindex,
                        bid_user_index: result.mbuindex
                    })
                    }
                ], true, function (err, response) {
                    if (err) {
                        result.response = response;
                    }
                    callback(err, result);
                });
        } else {
            callback(null, result);
        }
    },

    main: function (goods, callback) {
        var result = {
            goods: goods,
            callback: callback,
            maxbidindex: 0,
            mbuindex: 1000000,
            depositlist: [],
            counterparty: null,
            cplist: []
        };

        var params = {
            address: goods.address,
            results_per_page: 20,
            page: 1
        };
        var selfCallback = function (err, data) {
            if (!data || data.length == 0) {
                auctionComputerScript.processResult(result, result.callback);
                return;
            }
            result = auctionComputerScript.computeResult(result, data);

            params.address = goods.address;
            params.page = params.page + 1;
            ApiRequest.getTransactionList(params, function (err, data) {
                selfCallback(err, data);
            });
        };
        ApiRequest.getTransactionList(params, function (err, data) {
            selfCallback(err, data);
        });
    }
};

module.exports = auctionComputerScript;