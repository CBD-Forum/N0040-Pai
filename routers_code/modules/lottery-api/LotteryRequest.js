/**
 * Created by weijia on 16-11-20.
 */
var ApiRequest = require('../jingtum-api/ApiRequest');
var moment = require('moment');

var LotteryConfig = require('./LotteryConfig');

/**
 * 过滤出指定类型活动
 * @param data
 * @returns {Array}
 */
function filter_list(data) {
    if (data && data.length > 0) {
        var list = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (item.memos && item.memos.length == 1) {
                var memo = item.memos[0];
                console.log(i, memo);
                if (memo.MemoType == 'string') {
                    var jsonString = memo.MemoData;
                    if (jsonString) {
                        try {
                            var obj = JSON.parse(jsonString);
                            if (obj && obj.activity == LotteryConfig.activity) {
                                list.push(item);
                            }
                        } catch (ex) {
                            //console.log(ex);
                        }
                    }
                }
            }
        }
        return list;
    } else {
        return [];
    }
}

var lotteryRequest = {
    createWallet: function (callback) {
        ApiRequest.createWallet(function (err, wallet) {
            console.log('wallet', wallet);

            if (wallet && wallet.address) {
                ApiRequest.sendGift(wallet.address, true, function (err, data) {
                    console.log(err, data);
                    if (data) {
                        callback(err, wallet);
                    }
                });
            }
        });
    },
    doLottery: function (masterUser, user, callback) {
        ApiRequest.payments(user.wallet.address, user.wallet.secret, masterUser.wallet.address, "0.01", 'SWT', '', [
            {"memo_type": "string", "memo_data": JSON.stringify(LotteryConfig)}
        ], true, callback);
    },
    doLucky: function (masterUser, user, callback) {
        ApiRequest.payments(masterUser.wallet.address, masterUser.wallet.secret, user.wallet.address, "0.01", 'SWT', '', [
            {"memo_type": "string", "memo_data": JSON.stringify({activity: LotteryConfig.activity})}
        ], true, callback);
    },
    lotteryList: function (masterUser, user, callback) {
        ApiRequest.getTransactionList({address: masterUser.wallet.address}, function (err, data) {
            if (data) {
                console.log('list', data);
                var transactions = filter_list(data);
                var list = [];
                var luckyMap = {};
                var userMap = {};
                for (var i = 0; i < transactions.length; i++) {
                    var item = transactions[i];
                    if (item && item.memos && item.memos.length > 0) {
                        if (item.type == 'sent') {
                            var address = item.counterparty;
                            luckyMap[address] = address;
                        }
                        if (item.type == 'received') {
                            var address = item.counterparty;
                            userMap[address] = address;
                        }
                    }
                }
                for (var i = 0; i < transactions.length; i++) {
                    var item = transactions[i];
                    if (item && item.type == 'received' && item.memos && item.memos.length > 0) {
                        var address = item.counterparty;
                        var date = moment.unix(item.date).format('YYYY-MM-DD HH:mm:ss Z');
                        list.push({
                            user: address,
                            date: date,
                            current: (user != null && user.wallet.address == address),
                            lucky: (luckyMap[address] != null)
                        });
                    }
                }
                callback(err, {
                    list: list,
                    lotteried: (user != null && userMap[user.wallet.address] != null)
                });
            } else {
                callback(err, null);
            }
        });
    }
};

module.exports = lotteryRequest;