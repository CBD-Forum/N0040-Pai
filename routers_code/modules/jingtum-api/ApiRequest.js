const request = require('request');
const stringformat = require('stringformat');
var uuid = require('uuid');

const CONNECTED_PATH = '/server/connected';
const CREATE_WALLET_PATH = '/wallet/new';
const BALANCE_PATH = '/accounts/{0}/balances';
const PAYMENT_PATHS_PATH = '/accounts/{0}/payments/paths/{1}/{2}';
const PAYMENT_PATH = '/accounts/{0}/payments?validated={1}';
const PAYMENT_INFO_PATH = '/accounts/{0}/payments/{1}';
const PAYMENT_HISTORY_PATH = '/accounts/{0}/payments';
const TRANSACTION_INFO_PATH = '/accounts/{0}/transactions/{1}';
const TRANSACTION_LIST_PATH = '/accounts/{0}/transactions';

const ORDERS_PATH = '/accounts/{0}/orders?validated={1}';
const ORDERS_QUIT_PATH = '/accounts/{0}/orders/{1}?validated=true';
const ORDERS_GET_PATH = '/accounts/{0}/orders';
const ORDERS_GET_USER_PATH = '/accounts/{0}/orders/{1}';
const ORDERS_BOOK_PATH = '/accounts/{0}/order_book/{1}/{2}';

const HTTP_SUCCESS_CODE = 200;

var Utils = require('../common/Utils');
var config = require('./env/development');

var apiRequest = {
    /**============================================状态接口===================================================**/
    /**
     * 查看服务器状态
     * @param callback
     */
    connected: function (callback) {
        var url = config.api.url + config.api.version + CONNECTED_PATH;
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("connected elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data.connected);
                } else {
                    callback(new Error(res.body), null);
                }
            } else {
                callback(new Error(res.body));
            }
        })
    },

    /**============================================帐号接口===================================================**/
    /**
     * 创建钱包
     * @param callback
     */
    createWallet: function (callback) {
        var url = config.api.url + config.api.version + CREATE_WALLET_PATH;
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("createWallet elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    console.log('wallet', _data.wallet.address, "created");
                    callback(null, _data.wallet);
                } else {
                    console.log("create wallet error", res.body);
                    callback(new Error(res.body), null);
                }
            } else {
                callback(new Error(res.body));
            }
        });
    },
    /**
     * 获取账户余额
     * @param address
     * @param callback
     */
    getBalances: function (address, callback) {
        if (!address) {
            return callback(new Error("address is invalid"));
        }
        var url = config.api.url + config.api.version + stringformat(BALANCE_PATH, address);
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("getBalances elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data.balances);
                } else {
                    callback(new Error(JSON.stringify(res.body)), null);
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },

    /**============================================支付接口===================================================**/
    /**
     * 给制定帐号赠送井通币
     * @param destAddress
     * @param validated
     * @param callback
     */
    sendGift: function (destAddress, validated, callback) {
        var sourceAddress = config.api.gift_account;
        var sourceSecret = config.api.gift_secret;
        var amount = config.api.gift_amount;
        if (validated == undefined) {
            validated = false;
        }
        console.log('send gift to', destAddress);
        this.payments(sourceAddress, sourceSecret, destAddress, amount, 'SWT', '', [], validated, callback);
    },
    /**
     * 获取支付路径
     * @param sourceAddress
     * @param destAddress
     * @param amount
     * @param options
     * @param callback
     */
    getPaymentsPaths: function (sourceAddress, destAddress, amount, options, callback) {
        var url = config.api.url + config.api.version + stringformat(PAYMENT_PATHS_PATH, sourceAddress, destAddress, amount);
        url = Utils.queryAppend(url, options);
        request(url, function (err, res, data) {
            if (err) {
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data.payments);
                } else {
                    callback(new Error(JSON.stringify(res.body)), null);
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },
    /**
     * 对指定账户做支付
     * @param sourceAddress
     * @param sourceSecret
     * @param destAddress
     * @param amount
     * @param currency
     * @param issuer
     * @param memos
     * @param validated
     * @param callback
     */
    payments: function (sourceAddress, sourceSecret, destAddress, amount, currency, issuer, memos, validated, callback) {
        var payment = {
            source_account: sourceAddress,
            destination_account: destAddress,
            destination_amount: {
                value: amount,
                currency: currency ? currency : 'SWT',
                issuer: issuer ? issuer : ''
            }
        };
        if (memos && memos.length > 0) {
            payment.memos = memos;
        }
        var wallet = {
            address: sourceAddress,
            secret: sourceSecret
        };
        console.log('payments', amount, currency ? currency : 'SWT', 'from', sourceAddress, 'to', destAddress);
        var url = config.api.url + config.api.version + stringformat(PAYMENT_PATH, wallet.address, validated);
        var payment_item = {
            secret: wallet.secret,
            client_resource_id: uuid.v1(),
            payment: payment
        };
        var options = {
            method: 'POST',
            url: url,
            headers: {'Connection': 'close'},
            json: true,
            body: payment_item
        };
        var timestamp = Date.now();
        console.log(JSON.stringify(options));
        request(options, function (err, res, data) {
            console.log("payment elapsed", Date.now() - timestamp, "mills");
            if (err) {
                console.log("payment error", err);
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                if (data.success) {
                    data.client_id = data.client_resource_id;
                    delete data.client_resource_id;
                    callback(null, data);
                } else {
                    console.log("payment error data", data);
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },
    /**
     * 获取支付信息
     * @param options
     * @param callback
     */
    getPaymentsInfo: function (options, callback) {
        if (!options.address) {
            return callback(new Error("address is invalid"));
        } else if (!options.id) {
            return callback(new Error("id is invalid"));
        }
        var url = config.api.url + config.api.version + stringformat(PAYMENT_INFO_PATH, options.address, options.id);
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("getPaymentsInfo elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)), null);
            }
        });
    },
    /**
     * 获取支付历史
     * @param address
     * @param options
     * @param callback
     */
    getPaymentsList: function (options, callback) {
        if (!options['address']) {
            return callback(new Error("address is invalid"));
        }
        var url = config.api.url + config.api.version + stringformat(PAYMENT_HISTORY_PATH, options['address']);
        url = Utils.queryAppend(url, options);
        var timestamp = Date.now();
        // console.log("request", url);
        request(url, function (err, res, data) {
            console.log("getPaymentsList elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data.payments);
                } else {
                    callback(new Error(JSON.stringify(res.body)))
                }
            } else {
                callback(new Error(JSON.stringify(res.body)), null);
            }
        });
    },

    /**============================================交易记录接口===================================================**/
    /**
     * 获取交易信息
     * @param options
     * @param callback
     */
    getTransaction: function (options, callback) {
        if (!options['address']) {
            return callback(new Error("address is invalid"));
        } else if (!options['id']) {
            return callback(new Error("id is invalid"));
        }
        var url = config.api.url + config.api.version + stringformat(TRANSACTION_INFO_PATH, options['address'], options['id']);
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("getTransaction elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err));
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data.transaction);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },
    /**
     * 获取交易记录
     * @param options
     * @param callback
     */
    getTransactionList: function (options, callback) {
        if (!options['address']) {
            callback(new Error("address is invalid"));
        } else {
            var url = stringformat(TRANSACTION_LIST_PATH, options['address']);
            delete options.address;
            url = config.api.url + config.api.version + url;
            url = Utils.queryAppend(url, options);
            var timestamp = Date.now();
            request(url, function (err, res, data) {
                console.log("getTransactionList elapsed", Date.now() - timestamp, "mills");
                if (err) {
                    return callback(new Error(err), null);
                }
                if (res.statusCode === HTTP_SUCCESS_CODE) {
                    var _data = JSON.parse(data);
                    if (_data.success) {
                        callback(null, _data.transactions);
                    } else {
                        callback(new Error(JSON.stringify(res.body)));
                    }
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            });
        }
    },

    /**============================================挂单接口===================================================**/

    /**
     * 提交挂单
     * @param address
     * @param secret
     * @param type sell buy
     * @param paysCurrency
     * @param paysCounterparty
     * @param paysValue
     * @param getsCurrency
     * @param getsValue
     * @param validated
     * @param callback
     */
    submitOrders: function (address, secret, type, paysCurrency, paysCounterparty, paysValue, getsCurrency, getsValue, validated, callback) {
        var url = config.api.url + config.api.version + stringformat(ORDERS_PATH, address, validated);
        var order_item = {
            secret: secret,
            oder: {
                type: type,
                taker_pays: {
                    currency: paysCurrency,
                    counterparty: paysCounterparty,
                    value: paysValue
                },
                taker_gets: {
                    currency: getsCurrency,
                    value: getsValue
                }
            }
        };
        var options = {
            method: 'POST',
            url: url,
            headers: {'Connection': 'close'},
            json: true,
            body: order_item
        };
        var timestamp = Date.now();
        request(options, function (err, res, data) {
            console.log("submitOrders elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },

    /**
     * 取消挂单
     * @param address
     * @param order
     * @param secret
     * @param callback
     */
    quitOrders: function (address, order, secret, callback) {
        var url = config.api.url + config.api.version + stringformat(ORDERS_QUIT_PATH, address, order);
        var order_item = {
            secret: secret
        };
        var options = {
            method: 'POST',
            url: url,
            headers: {'Connection': 'close'},
            json: true,
            body: order_item
        };
        var timestamp = Date.now();
        request(options, function (err, res, data) {
            console.log("quitOrders elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },

    /**
     * 获取用户挂单信息
     * @param address
     * @param callback
     */
    getUserOrders: function (address, callback) {
        var url = config.api.url + config.api.version + stringformat(ORDERS_GET_USER_PATH, address);
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("getUserOrders elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data.orders);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },

    /**
     * 获取挂单信息
     * @param address
     * @param hash
     * @param callback
     */
    getOrders: function (address, hash, callback) {
        var url = config.api.url + config.api.version + stringformat(ORDERS_GET_PATH, address, hash);
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("getOrders elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },

    /**
     * 获取货币对挂单列表
     * @param address
     * @param base
     * @param counter
     * @param callback
     */
    getOrderBook: function (address, base, counter, callback) {
        var url = config.api.url + config.api.version + stringformat(ORDERS_BOOK_PATH, address, base, counter);
        var timestamp = Date.now();
        request(url, function (err, res, data) {
            console.log("getOrderBook elapsed", Date.now() - timestamp, "mills");
            if (err) {
                return callback(new Error(err), null);
            }
            if (res.statusCode === HTTP_SUCCESS_CODE) {
                var _data = JSON.parse(data);
                if (_data.success) {
                    callback(null, _data);
                } else {
                    callback(new Error(JSON.stringify(res.body)));
                }
            } else {
                callback(new Error(JSON.stringify(res.body)));
            }
        });
    },

    /**============================================订阅接口===================================================**/
    /**
     * 订阅交易信息
     * @param address
     * @param secret
     */
    getWebsocket: function (address, secret, callback) {
        var WebSocket = require('ws');
        callback(null, new WebSocket(config.api.wss_url));
    }
};

module.exports = apiRequest;