/**
 * Created by heipacker on 16-12-18.
 */
var util = require('util');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
var process = require("process");
var Promise = require("bluebird");
var Async = require('async');
var Schedule = require('node-schedule');
var moment = require('moment');

var ApiRequest = require('../jingtum-api/ApiRequest');
var JingtumUtils = require('../jingtum-api/JingtumUtils');
var Neo4jApiRequest = require('../neo4j-api/Neo4jApiRequest');
var LocalTime = require('../common/Time');
var pushRequest = require('../common/PushRequest');

var ApplicationError = require('../error/ApplicationError');
var AuctionConfig = require('./AuctionConfig');
var ObjConfig = require('../object-api/ObjConfig');
var ObjRequest = require('../object-api/ObjRequest');
var LoginRequest = require('../login-api/LoginRequest');

var AuctionComputeScript = require("./AuctionComputeScript");
var SensitiveUtils = require("../common/SensitiveUtils");
var hash = require('../../pass').hash;
var User = require('../login-api/User');
var Goods = require('./Goods');
var Order = require('../order-api/Order');

var Common = require('../common/Common');
var RedisClient = require('../common/RedisClient');
var RKG = require('../common/RedisKeyGenerator');

/**
 * 竞标出价过滤
 * @param transaction
 * @param transType
 * @returns {boolean}
 */
function auctionTransactionPredicate(transaction, transType) {
    if (transaction.memos && transaction.memos.length == 1) {
        var memo = transaction.memos[0];
        var memoType = JingtumUtils.getMemoType(memo);
        if (memoType != 'string') {
            return false;
        }
        var memoDataJson = JingtumUtils.getMemoData(memo);
        if (!memoDataJson) {
            return false;
        }
        try {
            var memoData = JSON.parse(memoDataJson);
            if (!memoData || memoData.trans_type != transType) {
                return false;
            }
        } catch (ex) {
            console.debug(ex);
            return false;
        }
        return true;
    }
    return false;
}

/**
 * 过滤出指定类型交易
 * @param transactions
 * @param predicate
 * @param transType
 * @returns {Array}
 */
function filterTransaction(transactions, predicate, transType) {
    var list = [];
    if (!transactions || transactions.length <= 0) {
        return list;
    }
    var len = transactions.length;
    for (var i = 0; i < len; i++) {
        var transaction = transactions[i];
        if (!predicate(transaction, transType)) {
            continue;
        }
        list.push(transaction);
    }
    return list;
}

var auctionRequest = {
    /**
     * 初始化:
     * 1.先判断辅助帐号是否存在, 如果存在直接返回, 否则创建一个拍卖辅助帐号
     * 2.创建一个定时任务, 定时执行计算脚本
     */
    init: function () {
        Common.getGoodsAssistAccount(function (err, user) {
            auctionRequest.goodsAssistAccount = user;
            var jingtumStatusJob = Schedule.scheduleJob(AuctionConfig.jingtumStatusJobCron, function () {
                ApiRequest.connected(function (err, connected) {
                    if (err || !connected) {
                        console.error("jingtum api is not available.", err || '');
                    }
                });
            });
            var job = Schedule.scheduleJob(AuctionConfig.scheduleJobCron, function () {
                console.log("global goods job start", LocalTime.localDateFormatter(Date.now()).format());
                var pagination = {
                    page: 1,
                    pageSize: 100
                };
                auctionRequest.doEndAuction(pagination);
            });
        });
    },

    doEndAuction: function (pagination) {
        Goods.list({
            status: 0
        }, pagination, function (err, goodsList) {
            if (err) {
                return console.error("get goods list error", err);
            }
            if (!goodsList || goodsList.length == 0) {
                return;
            }
            Async.filter(goodsList, function (goods, callback) {
                if ((goods.starttime * 1000) < Date.now()) {//商品拍卖已经开始
                    if (goods.starttime + goods.totalauction < Date.now() / 1000) {//拍卖时间到　准备结束拍卖
                        console.log("goods", goods.code, "ended normally.");
                        return callback(null, true);
                    }
                    return auctionRequest.getGoodsBidIndex(goods, function (err, bidIndex) {
                        auctionRequest.checkIsEnded(goods, bidIndex, 3, function (result) {
                            if (result) {
                                console.log("商品", goods.code, "拍卖还没到结束时间但是连续3轮没有用户参加, 准备提前结束.");
                                return callback(null, true);
                            }
                            callback(null, false);
                        });
                    });
                }
                callback(null, false);
            }, function (err, goodsList) {
                if (err) {
                    return console.log("filter error", err);
                }
                Async.each(goodsList, function (goods, callback) {
                    try {
                        auctionRequest.doCompute(goods, function (err, data) {
                            //do nothing
                        });
                    } catch (err) {
                        console.log("goods ", goods, "compute error", err);
                        callback(err);
                    }
                }, function (err) {
                    //
                });
            });
            //下一页
            pagination.page = pagination.page + 1;
            auctionRequest.doEndAuction(pagination);
        });
    },

    /**
     * 判断拍卖是否结束
     * @param goods
     * @param bidIndex current index
     * @param times check times default 3
     * @param callback
     */
    checkIsEnded: function (goods, bidIndex, times, callback) {
        RedisClient.get(RKG.generateGoodsNewestIndex(goods.code), function (err, result) {
            if (bidIndex - parseInt(result) > times) {
                return callback(true);
            }
            callback(false);
        });
    },

    /**
     * 获取辅助帐号
     * @returns {{name: string, createtime: number, salt: *, hash: *, phone: string, email: string}|*}
     */
    getGoodsAssistAccount: function () {
        if (this.goodsAssistAccount) {
            return this.goodsAssistAccount;
        } else {
            throw new Error("account not exists.");
        }
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

    /**
     * 获取商品拍卖的memos信息:
     * trans_type, description, status_time, base_price, fix_inc_price, bid_interval, total_auction
     *
     * @param goods
     * @param callback
     */
    getGoodsAuctionMemos: function (goods, callback) {
        var memos = [];
        memos.push({
            "memo_type": "string",
            "memo_data": JSON.stringify({
                trans_type: AuctionConfig.auctionTransType,
                description: goods.description,
                start_time: goods.starttime,
                base_price: goods.baseprice,
                fix_inc_price: goods.fixincprice,
                bid_interval: goods.bidinterval,
                total_auction: goods.totalauction
            })
        });
        // add other memo info
        callback(memos);
    },

    /**
     * 获取商品到辅助帐号的交易的memo数据
     * @param goods
     * @param callback
     */
    getGoodsTransactionMemosList: function (goods, callback) {
        var goodsAssistAccount = auctionRequest.getGoodsAssistAccount();
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
            var transactions = filterTransaction(data, auctionTransactionPredicate, AuctionConfig.computeScriptTransType);
            for (var i = 0; i < transactions.length; i++) {
                var item = transactions[i];
                if (item && item.memos && item.memos.length > 0) {
                    if (item.type == 'sent') {
                        result.push(item.memos);
                    }
                }
            }
            //继续查询下一个分页信息
            params.address = goods.address;
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
     * 计算拍卖结果
     * @param goods
     * @param memoData
     * @param callback
     */
    computeGoodsTransaction: function (goods, memoData, callback) {
        var sandbox = {
            console: console,
            ApiRequest: ApiRequest,
            AuctionConfig: AuctionConfig,
            goods: goods,
            memoData: memoData,
            callback: function (err, result) {
                if (err) {
                    console.error("compute goods", goods.code, "script error", err);
                    goods.counterparty = '';
                    goods.status = 0;//未结束
                    goods.price = 0;
                } else {
                    goods.counterparty = result.counterparty ? result.counterparty : '';
                    goods.status = 1;//设置商品竞拍结束
                    goods.price = goods.baseprice + goods.fixincprice * ((goods.bidindex > 0 ? goods.bidindex : 1) - 1);
                }
                Goods.update(goods, function (err, effects) {
                    if (err) {
                        console.log("update goods", goods.code, "error", err, "result", result, "effects", effects);
                    } else {
                        console.log('compute goods', goods.code, 'success user', result.counterparty, 'bid this auction');
                    }
                    auctionRequest.pushBidResult(goods, function (err, result) {
                        callback(err, sandbox);
                    });
                });
            }
        };
        if (memoData && memoData.computeScript) {
            const script = new vm.Script(memoData.computeScript);
            const context = new vm.createContext(sandbox);
            script.runInContext(context, {
                displayErrors: true,
                timeout: 5 * 60//五分钟超时
            });
        } else {
            callback(null, sandbox);
        }
    },

    pushBidResult: function (goods, callback) {
        if (goods.counterparty == null || goods.counterparty == '') {
            return callback(null, null);
        }
        User.getByAddress(goods.counterparty, function (err, user) {
            if (err) {
                return callback(err);
            }
            var pushEntity = {//推送
                type: 1,//中标类型消息

                userid: user.id,
                bidindex: goods.bidindex,
                goodsid: goods.id,
                address: user.address
            };
            pushRequest.pushRoom(goods.id, JSON.stringify(pushEntity), function (err, result) {
                callback(err, result);
            });
        });
    },

    makeCompute: function (req, callback) {
        var goodsCode = req.query.goodscode;
        Goods.getByCode(goodsCode, function (err, goods) {
            AuctionComputeScript.main(goods, function (err, result) {

            })
        });
    },
    /**
     * 对拍卖商品做结果计算
     * @param goods
     * @param callback
     */
    doCompute: function (goods, callback) {
        if (goods['locked'] && (Math.floor(Date.now() / 1000) - goods['locked']) < AuctionConfig.lockedExpires) {
            console.log("goods", goods.code, "locked");
            return callback(null, goods);
        }
        Async.waterfall([
            function (callback) {
                goods['locked'] = Math.floor(Date.now() / 1000);
                Goods.updateLocked(goods, function (err, result) {
                    callback(err, result);
                });
            },
            function (result, callback) {
                auctionRequest.getGoodsTransactionMemosList(goods, function (err, memosList) {
                    if (!memosList || memosList.length == 0) {
                        return callback(new Error("can not get goods", goods.code, " transaction memos"), null);
                    }
                    callback(null, memosList);
                });
            },
            function (memosList, callback) {
                Async.map(memosList, function (memos, callback) {
                    callback(null, JSON.parse(JingtumUtils.getMemoData(memos[0])));
                }, function (err, memoDataList) {
                    Async.filter(memoDataList, function (memoData, callback) {
                        callback(null, memoData && memoData.trans_type == AuctionConfig.computeScriptTransType);//不是计算脚本
                    }, function (err, memoDataList) {
                        Async.sortBy(memoDataList, function (memoData, callback) {
                            callback(null, memoData.index);
                        }, function (err, sortedMemoDataList) {
                            Async.map(sortedMemoDataList, function (item, callback) {
                                callback(null, item['function']);
                            }, function (err, results) {
                                if (err) {
                                    console.error("get function from script error", err);
                                    return callback(err, goods);
                                }
                                auctionRequest.computeGoodsTransaction(goods, {
                                    computeScript: results.join('')
                                }, function (err, sandbox) {
                                    callback(err, goods);
                                });
                            });
                        });
                    });
                });
            }
        ], function (err, result) {
            if (err) {
                goods["locked"] = 0;
                return Goods.updateLocked(goods, function (err1, effects) {
                    if (err1) {
                        return callback(err1);
                    }
                    callback(err, result);
                });
            }
            callback(err, result);
        });
    },

    /**
     * 验证添加的商品的信息
     * @param data
     * @param callback
     */
    validateGoods: function (data, callback) {
        if (!data.goodsname) {
            return callback(new ApplicationError("goods name invalid"));
        }
        if (!data.code) {
            return callback(new ApplicationError("goods code invalid"));
        }
        var newVar = data.starttime + data.totalauction;
        var nowValue = Math.floor(Date.now() / 1000);
        if ((newVar) <= nowValue) {
            return callback(new ApplicationError("goods starttime + totalauction " + newVar + " is lower than now " + nowValue + " invalid"));
        }
        if (data.baseprice < 0) {
            return callback(new ApplicationError("goods baseprice invalid"));
        }
        if (data.fixincprice < 0) {
            return callback(new ApplicationError("goods fixincprice invalid"));
        }
        if (data.bidinterval < 0) {
            return callback(new ApplicationError("goods bidinterval invalid"));
        }
        if (data.totalauction <= 0) {
            return callback(new ApplicationError("goods totalauction invalid"));
        }
        callback(null);
    },

    /**
     * 去除商品的敏感信息
     * @param goods
     */
    removeSensitive: function (goods) {
        delete goods.secret;
        delete goods.salt;
        delete goods.hash;
        return goods;
    },

    /**
     * 填充处理商品信息
     * @param goods
     */
    populateGoods: function (goods) {
        auctionRequest.removeSensitive(goods);
        var timestamp = Date.now();
        goods.started = goods.starttime * 1000 < timestamp;
        if (goods.status == 0 && (goods.starttime + goods.totalauction) * 1000 > timestamp) {//添加剩余时间
            goods.lefttime = Math.floor(((goods.starttime + goods.totalauction) * 1000 - timestamp) / 1000);
        } else {
            goods.lefttime = 0;
        }
        //修改地址
        var images = goods['images'];
        if (images) {
            var imageUrls = [];
            for (var j = 0; j < images.length; ++j) {
                imageUrls.push(ObjConfig.url + "?id=" + images[j]);
            }
            goods['images'] = imageUrls;
        }
    },
    /**
     * 获取计算脚本列表, 从目标目录获取所有文件, 一个文件内容就是一个函数, 计算脚本的入口main_*.js文件
     * @param goods
     * @param callback
     */
    getComputeScriptList: function (goods, callback) {
        var dirName = path.join(__dirname, AuctionConfig.computeScriptDirectory);
        fs.readdir(dirName, function (err, files) {
            if (err) {
                return callback(err, null);
            }
            var promises = [];
            var len = files.length;
            var computeScriptList = new Array(len);
            for (var i = 0; i < len; ++i) {
                function pushFn(fileName) {
                    var indexOf = fileName.indexOf("_");
                    var funcName = fileName.substring(0, indexOf);
                    var index = fileName.substring(indexOf + 1, fileName.length - 3);
                    promises.push(new Promise(function (resolve) {
                        // 异步读取
                        fs.readFile(dirName + "/" + fileName, function (err, data) {
                            if (err) {
                                return console.error(err);
                            }
                            computeScriptList[index] = {
                                func_name: funcName,
                                function: data.toString()
                            };
                            resolve();
                        });
                    }));
                }

                pushFn(files[i]);
            }
            Promise.all(promises).then(function () {
                callback(null, computeScriptList);
            });
        });
    },

    /**
     * 添加一个商品拍卖,
     * 1. 判断商品信息是否正确;
     * 2. 判断商品是否已经存在;
     * 3. 创建商品对应的钱包;
     * 4. 创建商品;
     * @param data
     * @param callback
     */
    addGoods: function (data, callback) {
        Async.waterfall([
            function (callback) {//验证商品信息
                auctionRequest.validateGoods(data, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, data);
                });
            },
            function (data, callback) {//创建password hash
                hash(AuctionConfig.goodsPassword, function (err, salt, hash) {
                    if (err) {
                        return callback(err, null);
                    }
                    data.salt = salt;
                    data.hash = hash;
                    callback(null, data);
                });
            },
            function (data, callback) {//判断商品是否存在
                var goods = {
                    goodsname: data.goodsname,
                    code: data.code,
                    images: data.images,
                    description: data.description,
                    starttime: parseInt(data.starttime, 10),
                    baseprice: parseInt(data.baseprice, 10),
                    fixincprice: parseInt(data.fixincprice, 10),
                    bidinterval: parseInt(data.bidinterval, 10),
                    totalauction: parseInt(data.totalauction, 10),
                    marketvalue: parseInt(data.marketvalue, 10),
                    deposit: parseFloat(data.deposit),
                    salt: data.salt,
                    hash: data.hash
                };
                Goods.getByCode(goods.code, function (err, oldGoods) {
                    if (err) {
                        return callback(new ApplicationError("get goods error", 500))
                    }
                    if (oldGoods) {//商品已经存在
                        console.error("goods", goods.code, "is already exists");
                        return callback(new ApplicationError("goods " + goods.code + " is already exists"), null);
                    }
                    callback(null, goods);
                });
            },
            function (goods, callback) {//创建钱包
                console.log("begin to create wallet for", goods);
                auctionRequest.createWallet(function (err, wallet) {
                    if (err) {
                        return callback(err, null);
                    }
                    goods.address = wallet.address;
                    goods.secret = wallet.secret;
                    callback(null, goods);
                });
            },
            function (goods, callback) {//初始化计算脚本
                auctionRequest.getComputeScriptList(goods, function (err, computeScriptList) {
                    if (err || !computeScriptList || computeScriptList.length == 0) {
                        return callback(err, computeScriptList);
                    }
                    var goodsAssistAccount = auctionRequest.getGoodsAssistAccount();
                    var promises = [];
                    var len = computeScriptList.length;
                    for (var i = 0; i < len; ++i) {
                        var computeScript = computeScriptList[i];
                        var computeScriptMemos = [
                            {
                                "memo_type": "string", "memo_data": JSON.stringify({
                                trans_type: AuctionConfig.computeScriptTransType,
                                index: i,
                                func_name: computeScript.func_name,
                                function: computeScript.function
                            })
                            }
                        ];

                        function fn(computeMemos) {
                            promises.push(new Promise(function (resolve, reject) {
                                var sourceAddress = goods.address;
                                var sourceSecret = goods.secret;
                                var destAddress = goodsAssistAccount.address;
                                var amount = AuctionConfig.goodsAuctionInitAmount;
                                var validated = true;
                                ApiRequest.payments(sourceAddress, sourceSecret, destAddress, amount, 'SWT', '', computeMemos, validated, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            }));
                        }

                        fn(computeScriptMemos);
                    }

                    Promise.all(promises).then(function () {
                        auctionRequest.getGoodsAuctionMemos(goods, function (memoData) {
                            callback(null, {
                                goods: goods,
                                memoData: memoData
                            });
                        });
                    }).catch(function (err) {
                        callback(err, null);
                    });
                });
            },
            function (data, callback) {//完成商品帐号在区块链上的初始化
                var goods = data.goods;
                var memoData = data.memoData;
                var goodsAssistAccount = auctionRequest.getGoodsAssistAccount();
                var sourceAddress = goods.address;
                var sourceSecret = goods.secret;
                var destAddress = goodsAssistAccount.address;
                var amount = AuctionConfig.goodsAuctionInitAmount;
                var validated = true;
                ApiRequest.payments(sourceAddress, sourceSecret, destAddress, amount, 'SWT', '', memoData, validated, function (err, data) {
                    if (err) {
                        console.error("区块链上初始化商品信息出错", err);
                        return callback(err, null);
                    }
                    console.log("区块链上初始化商品信息成功", data);
                    callback(null, goods);
                });
            },
            function (goods, callback) {//保存商品到数据库
                Goods.insert(goods, function (err, result) {//保存商品, 开启定时任务
                    if (err) {
                        return callback(new ApplicationError("save goods error " + err.message, 500));
                    }
                    console.log("add goods success, effects", result);
                    callback(null, goods);
                });
            },
            function (goods, callback) {
                Neo4jApiRequest.createWallet(goods.address, goods, function (err, result) {
                    callback(err, goods);
                });
            }
        ], function (err, result) {
            callback(err, result);
        });
    },

    /**
     * 获取拍卖出价的序号
     * @param goods
     * @param bidIndex
     * @param callback
     * @returns {*}
     */
    getBidUserIndex: function (goods, bidIndex, callback) {
        var goodsBidUserIndexRedisKey = RKG.generateGoodsBidUserIndexKey(goods.code, bidIndex);
        RedisClient.incr(goodsBidUserIndexRedisKey, function (err, result) {
            RedisClient.expire(goodsBidUserIndexRedisKey, goods.totalauction);
            callback(err, result);
        });
    },

    /**
     * 获取当前用户出价的memo信息
     * @param goods
     * @param callback
     */
    getUserBidMemo: function (goods, callback) {
        auctionRequest.getGoodsBidIndex(goods, function (err, bidIndex) {
            auctionRequest.getBidUserIndex(goods, bidIndex, function (err, bidUserIndex) {
                callback({
                    trans_type: AuctionConfig.transType,
                    bid_index: bidIndex,
                    bid_price: goods.baseprice + (bidIndex - 1) * goods.fixincprice,
                    bid_user_index: bidUserIndex,
                    bid_timestamp: Date.now()
                });
            });
        });
    },

    getGoodsBidIndex: function (goods, callback) {
        callback(null, Math.floor((Math.floor(Date.now() / 1000) - goods.starttime) / goods.bidinterval + 1));
    },

    /**
     * 获取拍卖商品列表
     * @param req
     * @param callback
     */
    listGoods: function (req, callback) {
        var params = req.query;
        Goods.list(null, {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 16
        }, function (err, data) {
            if (!err && data) {//屏蔽部分数据
                for (var i = 0; i < data.length; ++i) {
                    auctionRequest.populateGoods(data[i]);
                }
                return Async.sortBy(data, function (goods, callback) {
                    callback(null, -goods.starttime);
                }, function (err, data) {
                    callback(null, data);
                });
            }
            if (err) {
                console.error("get goods list error", err);
            }
            callback(null, []);
        });
    },

    /**
     * 删除商品
     * @param data
     * @param callback
     */
    deleteGoods: function (data, callback) {
        Async.waterfall([
                function (callback) {
                    Goods.get(data.id, function (err, goods) {
                        if (err || !goods) {
                            return callback(new ApplicationError(err || "goods not exists", 400));
                        }
                        callback(null, goods);
                    });
                },
                function (goods, callback) {
                    Goods.remove(data.id, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        var images = goods.images;
                        for (var i = 0; i < images.length; ++i) {
                            /*ObjRequest.deleteObjInternal(images[i], function (err) {
                             //todo add logs
                             });*/
                        }
                        callback(err, result);
                    });
                }
            ], function (err, result) {
                callback(err, result);
            }
        );
    },

    /**
     * 推送其他信息
     * @param result
     * @param callback
     */
    pushOtherEntity: function (result, callback) {
        var pushEntity = {//推送
            type: 2,//出价信息
            userid: result.userid,
            goodsid: result.goodsid,

            visitcount: result.visitcount,

            timestamp: Date.now()
        };
        pushRequest.pushRoom(result.goodsid, JSON.stringify(pushEntity), function (err, result) {
            if (callback) {
                callback(err, result);
            }
        });
    },

    /**
     * 获取商品详情
     * @param req
     * @param callback
     */
    getGoods: function (req, callback) {
        if (!req.query) {
            return callback(new ApplicationError("缺少参数", 400, 1));
        }
        var goodsId = req.query.id;
        var userSession = req.session.user;
        if (!userSession || !userSession.name) {//如果用户未登录 直接返回
            return auctionRequest.getGoodsInternal(null, goodsId, function (err, goods) {
                auctionRequest.pushOtherEntity({
                    userid: 0,
                    goodsid: goodsId,
                    visitcount: goods.visitcount
                });
                callback(err, goods);
            });
        }
        auctionRequest.getGoodsInternal(userSession.name, goodsId, function (err, goods) {
            auctionRequest.pushOtherEntity({
                userid: userSession.userid,
                goodsid: goodsId,
                visitcount: goods.visitcount
            });
            callback(err, goods);
        });
    },

    getGoodsInternal: function (username, goodsId, callback) {
        Async.waterfall([
            function (callback) {
                Goods.get(goodsId, function (err, goods) {
                    if (!goods) {
                        return callback(new ApplicationError("商品不存在", 400, 2), goods);
                    }
                    if (goods.visitcount) {
                        goods.visitcount = goods.visitcount + 1;
                    } else {
                        goods.visitcount = 1;
                    }
                    callback(null, goods);
                });
            },
            function (goods, callback) {
                Async.parallel([
                    function (callback) {
                        Goods.updateVisitCount(goods, function (err, result) {
                            if (err) {
                                console.error("getGoods update goods error", err);
                            }
                            callback(null, result);
                        });
                    },
                    function (callback) {
                        auctionRequest.populateGoods(goods);
                        callback(null, goods);
                    }
                ], function (err, results) {
                    callback(null, goods);
                });
            }
        ], function (err, goods) {
            if (err) {
                return callback(err, goods);
            }
            if (!username) {
                return callback(null, goods);
            }
            Async.waterfall([
                function (callback) {
                    User.get(username, function (err, user) {
                        if (err || !user) {
                            return console.error("get user", username, "error", err)
                        }
                        callback(null, user);
                    });
                }
            ], function (err, user) {
                Async.parallel([
                    function (callback) {//获取用户出价信息
                        auctionRequest.getUserBidInfo(goods, user, function (err, userBidInfo) {
                            callback(null, userBidInfo);
                        });
                    },
                    function (callback) {//参与人数
                        auctionRequest.getAttendNum(goods, function (err, attendNum) {
                            callback(err, attendNum);
                        });
                    },
                    function (callback) {
                        auctionRequest.payedGoodsDeposit(user.id, goods.id, function (err, result) {
                            callback(err, result);
                        });
                    },
                    function (callback) {
                        if (user.address != goods.counterparty) {
                            return callback(null, false);
                        }
                        auctionRequest.payedGoods(user.id, goods.id, function (err, result) {
                            callback(err, result);
                        })
                    }
                ], function (err, results) {
                    if (err) {
                        return callback(err, null);
                    }
                    goods.bidprice = results[0].maxBidPrice;
                    goods.bidtimes = results[0].bidTimes;
                    goods.attendnum = results[1];
                    goods.payeddeposit = results[2];
                    goods.bidedgoods = user.address == goods.counterparty;
                    goods.payed = results[3];
                    callback(null, goods);
                });
            });
        });
    },

    /**
     * 结束拍卖
     * @param req
     * @param callback
     */
    endAuction: function (req, callback) {
        if (!req.body || !req.body.goodsid) {
            return callback(new ApplicationError("参数缺失", 400, 1));
        }
        var goodsId = req.body.goodsid;
        Async.waterfall([
                function (callback) {
                    Goods.get(goodsId, function (err, goods) {
                        if (!goods || goods.status != 0) {
                            return callback(new ApplicationError("goods already ended.", 400, 2))
                        }
                        callback(null, goods);
                    });
                },
                function (goods, callback) {
                    auctionRequest.doCompute(goods, callback);
                }
            ], function (err, result) {
                callback(err, result);
            }
        );
    },

    /**
     * 参加竞拍
     * @param req
     * @param callback
     */
    doAuction: function (req, callback) {
        var username = req.session.user.name;
        console.log(username, "do auction");
        var data = req.body;
        Async.waterfall([
            function (callback) {//查询商品信息
                Goods.get(data.goodsid, function (err, goods) {
                    if (err || !goods) {
                        return callback(new ApplicationError(err ? err.message : "商品标的不存在", 400, 1));
                    }
                    callback(null, goods);
                });
            },
            function (goods, callback) {
                if (goods.deposit && goods.deposit > 0) {//是否需要交保证金
                    var userId = req.session.user.userid;
                    auctionRequest.payedGoodsDeposit(userId, goods.id, function (err, result) {
                        if (err) {
                            return callback(new ApplicationError("查询是否付保证金失败", 500, 2));
                        }
                        if (!result) {
                            return callback(new ApplicationError("未支付保证金", 500, 3));
                        }
                        callback(null, goods);
                    });
                } else {
                    callback(null, goods);
                }
            },
            function (goods, callback) {
                //验证当前拍卖的时间是否开始, 是否结束
                var timestamp = Date.now();
                if (goods.starttime > Math.floor(timestamp / 1000)) {//检查是否开始
                    return callback(new ApplicationError("拍卖还没开始", 400, 4));
                }
                if (goods.status == 1 || (goods.starttime + goods.totalauction) < Math.floor(timestamp / 1000)) {//检查是否结束
                    return callback(new ApplicationError("拍卖已结束" + ((goods.status == 0) ? "" : ", 请等待拍卖结果"), 400, 5));
                }
                callback(null, goods);
            },
            function (goods, callback) {
                User.get(username, function (err, user) {
                    if (err) {
                        return callback(new ApplicationError(err.message, 500, 6));
                    }
                    if (!user) {
                        return callback(new ApplicationError((err && err.message) || "用户不存在", 403, 7));
                    }
                    callback(null, {
                        goods: goods,
                        user: user
                    });
                });
            },
            function (result, callback) {
                auctionRequest.getUserBidMemo(result.goods, function (memoData) {
                    result.memoData = memoData;
                    callback(null, result);
                });
            },
            function (result, callback) {
                var goods = result.goods;
                var memoData = result.memoData;
                auctionRequest.checkIsEnded(goods, memoData.bid_index, 3, function (ended) {
                    if (ended) {
                        return callback(new ApplicationError("拍卖提前结束, 请等待拍卖结果", 400, 8));
                    }
                    //设置商品最新出价轮次
                    var expires = goods.totalauction * 10;
                    RedisClient.setex(RKG.generateGoodsNewestIndex(goods.code), expires, memoData.bid_index);
                    callback(null, result);
                });
            },
            function (result, callback) {//判断用户是否重复参与
                var user = result.user;
                var goods = result.goods;
                var memoData = result.memoData;
                var userLastAttendBidIndexKey = RKG.generateUserLastAttend(goods.code, user.username, memoData.bid_index);
                RedisClient.exists(userLastAttendBidIndexKey, function (err, exists) {
                    if (exists) {
                        return callback(new ApplicationError("这一轮已经参加, 不得重复参加.", 400, 9));
                    }
                    RedisClient.setex(userLastAttendBidIndexKey, goods.totalauction, Date.now());//设置参与
                    callback(null, result);
                });
            },
            function (result, callback) {
                var goods = result.goods;
                var memoData = result.memoData;
                if (goods['bidindex'] != memoData.bid_index) {//变更了才更新
                    goods['bidindex'] = memoData.bid_index;
                    return Goods.updateBidIndex(goods, function (err, rowCount) {
                        if (err) {
                            return callback(new ApplicationError("update bidIndex error", 400, 10))
                        }
                        callback(null, result);
                    });
                }
                callback(null, result);
            },
            function (result, callback) {//出价
                var user = result.user;
                var goods = result.goods;
                var memoData = result.memoData;

                var sourceAddress = user.address;
                var sourceSecret = user.secret;
                var destAddress = goods.address;
                var amount = AuctionConfig.attendAuctionAmount;
                var validated = true;
                var memos = [
                    {"memo_type": "string", "memo_data": JSON.stringify(memoData)}
                ];
                Neo4jApiRequest.payments(sourceAddress, destAddress, amount, 'SWT', '', memos, function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    //异步请求井通接口
                    ApiRequest.payments(sourceAddress, sourceSecret, destAddress, amount, 'SWT', '', memos, validated,
                        function (err, response) {
                            if (err) {
                                console.error("payments failed", err, response);
                            }
                        }
                    );
                    callback(null, result);
                });
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            auctionRequest.preparePushData(result, function (err, data) {
                if (err) {
                    return console.error("push data failed", err, data);
                }
                console.log("push data success", data);
            });
            callback(null, result);
        });
    },

    preparePushData: function (result, callback) {
        var goods = result.goods;
        var user = result.user;
        Async.parallel([
            function (callback) {//获取用户出价信息
                auctionRequest.getUserBidInfo(goods, user, function (err, userBidInfo) {
                    callback(null, userBidInfo);
                });
            },
            function (callback) {//参与人数
                auctionRequest.getAttendNum(goods, function (err, attendNum) {
                    callback(err, attendNum);
                });
            }
        ], function (err, results) {
            var userBidInfo = results[0];
            result.bidtimes = userBidInfo.bidTimes;
            result.attendnum = results[1];
            auctionRequest.pushBidEntity(result, function (err, pushResult) {
                callback(null, pushResult);
            });
        });
    },

    pushBidEntity: function (result, callback) {
        var user = result.user;
        var goods = result.goods;
        var memoData = result.memoData;
        var list = [{
            userid: user.id,
            goodsid: goods.id,
            address: user.address,
            bidindex: goods.bidindex,
            bidprice: memoData.bid_price,
            biduserindex: memoData.bid_user_index,
            nickname: SensitiveUtils.username(user.username),
            timestamp: memoData.bid_timestamp
        }];
        var pushEntity = {//推送
            type: 0,//出价信息

            userid: user.id,
            visitcount: goods.visitcount,
            bidtimes: result.bidtimes,
            attendnum: result.attendnum,

            list: list
        };
        pushRequest.pushRoom(goods.id, JSON.stringify(pushEntity), function (err, result) {
            callback(err, result);
        });
    },

    /**
     * 获取商品的出价列表信息
     * @param req
     * @param callback
     */
    getAuctionList: function (req, callback) {
        var goodsId = req.query.id;
        var page = req.query.page;
        var pageSize = req.query.pageSize;
        var pagination = {
            page: (page != null ? parseInt(page) : 1),
            pageSize: (pageSize != null ? parseInt(pageSize) : 100)
        };
        Goods.get(goodsId, function (err, goods) {
            if (err || !goods) {
                return callback(new ApplicationError(err ? err.message : "商品不存在", 400, 2));
            }
            var userSession = req.session.user;
            if (userSession && userSession.name) {
                User.get(userSession.name, function (err, user) {
                    if (err) {
                        return callback(new ApplicationError(err.message, 400, 3));
                    }
                    auctionRequest.auctionList(user, goods, pagination, callback);
                });
            } else {
                auctionRequest.auctionList(null, goods, pagination, callback);
            }
        });
    },

    /**
     * 竞标历史信息
     * @param user
     * @param goods
     * @param pagination
     * @param callback
     */
    auctionList: function (user, goods, pagination, callback) {
        if (goods.starttime * 1000 > Date.now()) {
            return callback(null, {});
        }
        Neo4jApiRequest.getTransactionList({
            address: goods.address,
            pagination: pagination
        }, function (err, data) {
            if (err || !data || data.length == 0) {
                return callback(err, data);
            }
            var transactions = filterTransaction(data, auctionTransactionPredicate, AuctionConfig.transType);
            auctionRequest.transferToBidInfoList(user, goods, transactions, callback);
        });
    },

    mapToBidInfo: function (address, transaction, callback) {
        LoginRequest.getUserByAddress(transaction.counterparty, function (err, targetUser) {
            if (err || !targetUser) {
                console.error("counterparty", transaction.counterparty, "not exist user info", err);
                return callback(null, {});
            }
            var memoData = JSON.parse(JingtumUtils.getMemoData(transaction.memos[0]));
            callback(null, {
                userid: targetUser.id,
                address: transaction.counterparty,
                nickname: SensitiveUtils.username(targetUser.nickname),
                userbid: transaction.counterparty == address,//当前用户的出价
                timestamp: transaction.timestamp,
                bidindex: memoData.bid_index,
                bidprice: memoData.bid_price,
                biduserindex: memoData.bid_user_index
            });
        });
    },

    transferToBidInfoList: function (user, goods, transactions, callback) {
        Async.map(transactions, function (transaction, callback) {
            auctionRequest.mapToBidInfo(user ? user.address : null, transaction, callback);
        }, function (err, bidInfoList) {
            Async.filter(bidInfoList, function (bidInfo, callback) {
                callback(null, bidInfo.address != null);
            }, function (err, bidInfoList) {
                Async.sortBy(bidInfoList, function (bidInfo, callback) {
                    callback(null, (bidInfo.bidindex * 10000 + bidInfo.biduserindex));//先按轮次排序, 再按用户出价顺序
                }, function (err, bidInfoList) {
                    Async.parallel([
                        function (callback) {
                            auctionRequest.getBidTimes(goods, user, function (err, bidTimes) {
                                callback(err, bidTimes);
                            });
                        },
                        function (callback) {
                            auctionRequest.getAttendNum(goods, function (err, attendNum) {
                                callback(err, attendNum);
                            });
                        }
                    ], function (err, results) {
                        var result = {
                            list: bidInfoList,
                            visitcount: goods.visitcount
                        };
                        if (results && results.length == 2) {
                            result.bidtimes = results[0];
                            result.attendnum = results[1];
                        }
                        callback(err, result);
                    });
                });
            });
        });
    },

    getBidTimes: function (goods, user, callback) {
        if (!user || !goods) {
            return callback(null, 0);
        }
        var options = {
            address: goods.address,
            sourceAddress: user.address
        };
        Neo4jApiRequest.getUserBidTimes(options, function (err, data) {
            if (err) {
                return callback(err, 0);
            }
            callback(null, data);
        });
    },

    /**
     * 获取拍卖的参与人数
     * @param goods
     * @param callback
     */
    getAttendNum: function (goods, callback) {
        if (!goods) {
            return callback(null, 0);
        }
        var options = {
            address: goods.address
        };
        Neo4jApiRequest.getAttendUserCount(options, function (err, data) {
            if (err) {
                return callback(err, 0);
            }
            callback(null, data);
        });
    },

    getUserBidInfo: function (goods, user, callback) {
        var options = {
            address: goods.address,
            sourceAddress: user.address,
            pagination: {
                page: 1,
                pageSize: 30
            }
        };
        Neo4jApiRequest.getTransactionList(options, function (err, transactions) {
            if (err || !transactions) {
                return callback(err, transactions);
            }
            var maxBidPrice = -1;
            for (var i = 0; i < transactions.length; i++) {
                var transaction = transactions[i];
                var memoData = JSON.parse(JingtumUtils.getMemoData(transaction.memos[0]));
                if (maxBidPrice < memoData.bid_price) {
                    maxBidPrice = memoData.bid_price;
                }
            }
            callback(null, {
                maxBidPrice: maxBidPrice,
                bidTimes: transactions.length
            });
        });
    },

    payedGoodsDeposit: function (userId, goodsId, callback) {
        Goods.get(goodsId, function (err, goods) {
            if (err) {
                console.log("查询商品出错", goodsId);
                return callback(err, false);
            }
            if (goods.deposit < 0.001) {//不用交保证金
                return callback(null, true);
            }
            return Order.payedGoodsDeposit(userId, goodsId, function (err, result) {
                var type = typeof result;
                if (type == 'string') {
                    result = (result === 'true');
                }
                callback(null, result);
            });
        });
    },

    payedGoods: function (userId, goodsId, callback) {
        Order.payedGoods(userId, goodsId, function (err, result) {
            var type = typeof result;
            if (type == 'string') {
                result = (result === 'true');
            }
            callback(null, result);
        });
    },

    /**
     * 交保证金
     * @param userId
     * @param goodsId
     * @param price
     * @param callback
     */
    payTheDeposit: function (userId, goodsId, price, callback) {
        Async.waterfall([
            function (callback) {
                Async.parallel([
                    function (callback) {
                        User.getByUserId(userId, function (err, user) {
                            if (err) {
                                return callback(new ApplicationError("获取用户失败"));
                            }
                            callback(null, user);
                        });
                    },
                    function (callback) {
                        Goods.get(goodsId, function (err, goods) {
                            if (err) {
                                return callback(new ApplicationError("获取商品失败"));
                            }
                            callback(null, goods);
                        });
                    }
                ], function (err, results) {
                    if (err) {
                        return callback(err);
                    }
                    callback(err, {
                        user: results[0],
                        goods: results[1]
                    });
                });
            },
            function (result, callback) {
                var user = result.user;
                var goods = result.goods;
                var memoData = {
                    trans_type: AuctionConfig.depositTransType,
                    deposit_price: price
                };
                var sourceAddress = user.address;
                var sourceSecret = user.secret;
                var destAddress = goods.address;
                var amount = AuctionConfig.attendAuctionAmount;
                var validated = true;
                var memos = [
                    {"memo_type": "string", "memo_data": JSON.stringify(memoData)}
                ];
                //异步请求井通接口
                ApiRequest.payments(sourceAddress, sourceSecret, destAddress, amount, 'SWT', '', memos, validated,
                    function (err, response) {
                        if (err) {
                            return callback(err, response);
                        }
                        callback(null, response);
                    }
                );
            }
        ], function (err, result) {
            callback(err, result);
        });
    }
};

module.exports = auctionRequest;