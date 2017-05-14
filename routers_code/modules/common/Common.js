var User = require('../login-api/User');
var hash = require('../../pass').hash;
var uuid = require('uuid');

var ApiRequest = require('../jingtum-api/ApiRequest');
var ApplicationError = require('../error/ApplicationError');

var globalConfig = require('config');

var common = {
    init: function (callback) {
        var goodsAssistAccountName = globalConfig.get("auction.goodsAssistAccountName");
        var goodsAssistAccountPhone = globalConfig.get("auction.goodsAssistAccountPhone");
        var goodsAssistAccountEmail = globalConfig.get("auction.goodsAssistAccountEmail");
        User.get(goodsAssistAccountName, function (err, user) {
            if (err) {
                return callback(new ApplicationError(err.message));
            }
            if (user) {//用户已经存在
                console.log("goods assist account", user.username, "already exists");
                common.goodsAssistAccount = user;
                callback(null, user);
            } else {
                hash(globalConfig.get("auction.goodsAssistAccountPassword"), function (err, salt, hash) {
                    if (err) {
                        console.error("hash password error", err);
                        throw err;
                    }
                    var user = {
                        unionid: uuid.v1(),
                        username: goodsAssistAccountName,
                        nickname: goodsAssistAccountName,
                        salt: salt,
                        hash: hash,
                        phone: goodsAssistAccountPhone,
                        email: goodsAssistAccountEmail,
                        userref: 0,
                        userroleid: 1
                    };
                    console.log("begin create wallet for ", user.username);
                    common.createWallet(function (err, wallet) {
                        user.address = wallet.address;
                        user.secret = wallet.secret;
                        console.log("user", user, "created");
                        User.insert(user, function (err, result) {
                            if (err) {
                                throw new ApplicationError(err.message || '')
                            }
                            common.goodsAssistAccount = user;
                            callback(null, user);
                        });
                    });
                });
            }
        });
    },

    /**
     * 创建钱包
     * @param callback
     */
    createWallet: function (callback) {
        ApiRequest.createWallet(function (err, wallet) {
            if (err) {
                console.error("create wallet error", err);
                return callback(err, null);
            }
            if (wallet && wallet.address) {
                ApiRequest.sendGift(wallet.address, true, function (err, data) {
                    if (err) {
                        console.log("sendGift error", err, data);//发送奖励失败不影响创建钱包
                    }
                    if (data) {
                        callback(err, wallet);
                    }
                });
            } else {
                callback(err, null);
            }
        });
    },

    getGoodsAssistAccount: function (callback) {
        if (!common.goodsAssistAccount) {
            return common.init(function (err, goodsAssistAccount) {
                callback(err, goodsAssistAccount);
            });
        }
        callback(null, common.goodsAssistAccount);
    }
};

module.exports = common;