/**
 * Created by weijia on 16-11-20.
 */
var ApiRequest = require('../jingtum-api/ApiRequest');
var moment = require('moment');
const request = require('request');
var Async = require('async');
var sha1 = require('sha1');
var uuid = require('uuid');

var PgPool = require('../common/PgPool');
var User = require('./User');

var LoginConfig = require('./LoginConfig');
var AuctionConfig = require('../auction-api/AuctionConfig');
var hash = require('../../pass').hash;
var SensitiveUtils = require('../common/SensitiveUtils');
var globalDatabase = require('../../models/globaldb');

var ApplicationError = require('../error/ApplicationError');
var Neo4jApiRequest = require('../neo4j-api/Neo4jApiRequest');
var RedisClient = require('../common/RedisClient');
var RKG = require('../common/RedisKeyGenerator');
const HTTP_SUCCESS_CODE = 200;

const JINGTUM_USER = 1;
const OAUTH2_ACCESS_TOKEN_PATH = '/oauth2/accesstoken';
const API_GET_USER_PATH = '/api/user';

const WEIXIN_OAUTH2_ACCESS_TOKEN_PATH = '/sns/oauth2/access_token';
const WEIXIN_API_GET_USER_PATH = '/sns/userinfo';
const WEIXIN_USER = 2;

var Utils = require('../common/Utils');

var loginRequest = {

    init: function () {
        //todo 添加初始化
    },

    /**
     * 获取随机的用户名称
     * @param prefix
     * @returns {string}
     */
    getNewUsername: function (prefix) {
        var username = '';
        for (var i = 0; i < 5; ++i) {
            username += Math.floor(Math.random() * 10);
        }
        return prefix + username;
    },

    /**
     * 获取一个可用的用户名称
     * @param prefix
     * @param callback
     */
    getUsableUserName: function (prefix, callback) {
        var username = loginRequest.getNewUsername(prefix);
        User.get(username, function (err, user) {
            if (err || user) {//已经存在
                return loginRequest.getUsableUserName(callback);
            } else {
                callback(username);
            }
        });
    },

    /**
     * get redirect uri without code parameter
     * @param redirectUri
     * @returns {*}
     */
    getRedirectUri: function (redirectUri) {
        redirectUri = (redirectUri.startsWith("/")) ? (LoginConfig.homePage + redirectUri) : redirectUri;
        var index = redirectUri.indexOf('?');
        if (index > 0) {
            var queryString = redirectUri.substring(index + 1);
            var queryArray = queryString.split('&');
            var newQueryArray = [];
            for (var i = 0; i < queryArray.length; ++i) {
                if (!queryArray[i].startsWith("code=")) {
                    newQueryArray.push(queryArray[i]);
                }
            }
            if (newQueryArray.length > 0) {
                return redirectUri.substring(0, index + 1) + newQueryArray.join("&");
            } else {
                return redirectUri.substring(0, index);
            }
        }
        return redirectUri;
    },

    /**
     * 微信登录入口
     * @param req
     * @param res
     * @returns {ServerResponse|*|Request}
     */
    weixinCallback: function (req, res) {
        var params = req.query;
        if (!params) {
            return res.send({
                code: 1,
                msg: '缺少参数信息'
            });
        }
        console.log(req.query);
        var code = req.query.code;
        var state = req.query.state;
        var nextUrl = req.query.next;//前端希望跳转到的地址
        Async.waterfall([
            function (callback) {//获取token
                var url = LoginConfig.weixinApiUrl + WEIXIN_OAUTH2_ACCESS_TOKEN_PATH;
                url = Utils.queryAppend(url, {
                    appid: state == 'deep_well' ? LoginConfig.blockchainWeixinAppId : LoginConfig.weixinAppId,
                    secret: state == 'deep_well' ? LoginConfig.blockchainWeixinAppSecret : LoginConfig.weixinAppSecret,
                    code: code,
                    grant_type: LoginConfig.weixinGrantType
                });
                console.log("request", url);
                request(url, function (err, res, data) {
                    if (err) {
                        return callback(new Error(err));
                    }
                    if (res.statusCode === HTTP_SUCCESS_CODE) {
                        var _data = JSON.parse(data);
                        if (!_data.errcode) {
                            callback(null, _data);
                        } else {
                            callback(new Error(res.body));
                        }
                    } else {
                        callback(new Error(res.body));
                    }
                });
            },
            function (data, callback) {//获取用户信息
                var url = LoginConfig.weixinApiUrl + WEIXIN_API_GET_USER_PATH;
                url = Utils.queryAppend(url, {
                    access_token: data.access_token,
                    openid: data.openid
                });
                console.log("request", url);
                request(url, function (err, res, data) {
                    if (err) {
                        return callback(new Error(err));
                    }
                    if (res.statusCode === HTTP_SUCCESS_CODE) {
                        var _data = JSON.parse(data);
                        if (!_data.errcode) {
                            callback(null, _data);
                        } else {
                            callback(new Error(res.body));
                        }
                    } else {
                        callback(new Error(res.body));
                    }
                });
            },
            function (weixinUser, callback) {
                User.getByRefAndRefUsername(WEIXIN_USER, weixinUser.unionid, function (err, user) {
                    if (err) {
                        return callback(new Error(err.message));
                    }
                    if (user) {
                        return callback(null, user);
                    }
                    return Async.retry(3, function (callback, result) {
                        return loginRequest.getUsableUserName("wx_", function (newUsername) {
                            user = {
                                unionid: uuid.v1(),
                                username: newUsername,
                                nickname: newUsername,
                                password: LoginConfig.thridPartyDefaultPassword,
                                phone: weixinUser.phone,
                                email: weixinUser.email,
                                userref: WEIXIN_USER,//from weixin
                                refusername: weixinUser.unionid,//第三方帐号的名字
                                userroleid: 1,
                                photoid: weixinUser.headimgurl
                            };
                            return Async.waterfall(loginRequest.registerNewUser(user, req), function (err, result) {
                                callback(null, result);
                            });
                        });
                    }, function (err, result) {
                        if (err) {
                            return callback(new Error(err.message));
                        }
                        callback(null, result);
                    });
                });
            }
        ], function (err, result) {
            if (err) {
                console.error("oauth2 error", err);
                return res.send({
                    code: 2,
                    msg: '请求微信出错'
                });
            }
            User.get(result.username, function (err, user) {
                loginRequest.setSession(req, user, function (err, result) {
                    if (!nextUrl) {//如果没有设置　则跳转到首页
                        nextUrl = LoginConfig.homePage;
                    }
                    return res.redirect(302, nextUrl);
                });
            });
        });
    },
    /**
     * 井通app帐号登录回调地址
     * @param req
     * @param res
     * @returns {ServerResponse|*|Request}
     */
    jingtumCallback: function (req, res) {
        var params = req.query;
        if (!params) {
            return res.send({
                code: 1,
                msg: '缺少参数信息'
            });
        }
        var code = req.query.code;
        var nextUrl = req.query.next;//前端希望跳转到的地址
        Async.waterfall([
            function (callback) {//获取token
                var url = LoginConfig.jingtumApiUrl + OAUTH2_ACCESS_TOKEN_PATH;
                url = Utils.queryAppend(url, {
                    client_id: LoginConfig.clientId,
                    client_secret: LoginConfig.clientSecret,
                    code: code,
                    grant_type: LoginConfig.grantType,
                    redirect_uri: loginRequest.getRedirectUri(req.url)
                });
                request(url, function (err, res, data) {
                    if (err) {
                        return callback(new Error(err));
                    }
                    if (res.statusCode === HTTP_SUCCESS_CODE) {
                        var _data = JSON.parse(data);
                        if (_data.success) {
                            callback(null, _data.data);
                        } else {
                            callback(new Error(res.body));
                        }
                    } else {
                        callback(new Error(res.body));
                    }
                });
            },
            function (data, callback) {//获取用户信息
                var url = LoginConfig.jingtumApiUrl + API_GET_USER_PATH;
                url = Utils.queryAppend(url, {
                    access_token: data.access_token,
                    username: data.uid
                });
                request(url, function (err, res, data) {
                    if (err) {
                        return callback(new Error(err));
                    }
                    if (res.statusCode === HTTP_SUCCESS_CODE) {
                        var _data = JSON.parse(data);
                        if (_data.success) {
                            callback(null, _data.data);
                        } else {
                            callback(new Error(JSON.stringify(res.body)));
                        }
                    } else {
                        callback(new Error(JSON.stringify(res.body)));
                    }
                });
            },
            function (jingtumUser, callback) {
                var username = jingtumUser.username;
                User.getByRefAndRefUsername(JINGTUM_USER, username, function (err, user) {
                    if (err) {
                        return callback(new Error(err.message));
                    }
                    if (user) {
                        return callback(null, user);
                    }
                    return Async.retry(3, function (callback, result) {
                        user = {
                            unionid: uuid.v1(),
                            username: username,
                            nickname: username,
                            password: LoginConfig.thridPartyDefaultPassword,
                            phone: jingtumUser.phone,
                            email: jingtumUser.email,
                            userref: JINGTUM_USER,//from jingtum
                            refusername: username,//第三方帐号的名字
                            userroleid: 1
                        };
                        return Async.waterfall(loginRequest.registerNewUser(user, req), function (err, result) {
                            if (!err) {//第一次成功了
                                return callback(null, result);
                            }
                            loginRequest.getUsableUserName(username, function (newUsername) {
                                user.username = newUsername;
                                user.nickname = newUsername;
                                return Async.waterfall(loginRequest.registerNewUser(user, req), function (err, result) {
                                    callback(null, result);
                                });
                            });
                        });
                    }, function (err, result) {
                        if (err) {
                            return callback(new Error(err.message));
                        }
                        callback(null, result);
                    });
                });
            }
        ], function (err, result) {
            if (err) {
                console.error("oauth2 error", err);
                return res.send({
                    code: 2,
                    msg: '请求井通出错'
                });
            }
            User.get(result.username, function (err, user) {
                loginRequest.setSession(req, user, function (err, result) {
                    if (!nextUrl) {//如果没有设置　则跳转到首页
                        nextUrl = LoginConfig.homePage;
                    }
                    return res.redirect(302, nextUrl);
                });
            });
        });
    },

    /**
     * 注册新用户
     * @param user
     * @param req
     * @returns {[*,*,*,*]}
     */
    registerNewUser: function (user, req) {
        return [
            function (callback) {
                // when you create a user, generate a salt
                hash(user.password, function (err, salt, hash) {
                    if (err) {
                        return callback(err);
                    }
                    delete user.password;
                    user.salt = salt;
                    user.hash = hash;
                    callback(null, user);
                });
            },
            function (user, callback) {//创建钱包
                ApiRequest.createWallet(function (err, wallet) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (wallet && wallet.address) {
                        user.address = wallet.address;
                        user.secret = wallet.secret;
                        callback(null, user);
                    } else {
                        callback(new Error('无效的钱包地址'), null);
                    }
                });
            },
            function (user, callback) {
                Neo4jApiRequest.createWallet(user.address, user, function (err, address) {
                    callback(null, user);
                });
            },
            function (user, callback) {//激活用户
                ApiRequest.sendGift(user.address, true, function (err, data) {
                    if (err) {
                        return callback(new Error('激活帐务异常'));
                    }
                    console.log("user", user.username, "motivate success ret", data);
                    callback(null, user);
                });
            },
            function (user, callback) {//保存用户
                User.insert(user, function (err, result) {
                    if (err || result < 1) {
                        return callback(new Error(err.message || "保存用户数据出错"));
                    }
                    callback(null, user);
                })
            }
        ];
    },

    createNeo4jNode: function (req, callback) {
        var userId = req.query.id;
        User.getByUserId(userId, function (err, user) {
            Neo4jApiRequest.createWallet(user.address, user, function (err, result) {
                callback(null, user);
            });
        })
    },

    /**
     * 发送验证码
     * @param req
     * @param callback
     * @returns {*}
     */
    sendCode: function (req, callback) {
        var phone = req.body.phone;
        if (!phone) {
            return callback(new ApplicationError("手机号为空.", 400, 1));
        }
        var nonce = Date.now();
        var curTime = Date.now();
        var checkSum = sha1(LoginConfig.appSecret + nonce + curTime);
        var options = {
            method: 'POST',
            url: LoginConfig.smsUrl,
            headers: {
                'AppKey': LoginConfig.appKey,
                'CurTime': curTime,
                'CheckSum': checkSum,
                'Nonce': nonce,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'mobile=' + phone + "&templateid=" + LoginConfig.templateId
        };
        request(options, function (err, res, data) {
            if (err) {
                return callback(new ApplicationError('发送失败', 500, 2));
            }
            var ret = JSON.parse(data);
            RedisClient.setex(RKG.generatePhoneSmsCode(phone), 10 * 60, ret.obj, function (err, result) {
                callback(null, ret.obj);
            });
        });
    },

    /**
     * 发送验证码
     * @param req
     * @param callback
     * @returns {*}
     */
    sendCode1: function (req, callback) {
        var phone = req.body.phone;
        if (!phone) {
            return callback(new ApplicationError("手机号为空.", 400, 1));
        }
        var options = {
            method: 'POST',
            url: "http://106.ihuyi.com/webservice/sms.php?method=Submit",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'account=' + "C00956728" + "&password=" + "6d5d639a36b418f78909f65d1d7828dd"
            + "&mobile=" + phone + "&content=" + "您的验证码是：1234。请不要把验证码泄露给其他人。"
        };
        request(options, function (err, res, data) {
            if (err) {
                return callback(new ApplicationError('发送失败', 500, 2));
            }
            callback(null, data);
        });
    },

    /**
     * 删除敏感信息
     * @param user
     */
    processSensitive: function (user) {
        delete user.secret;
        delete user.salt;
        delete user.hash;

        user.email = SensitiveUtils.email(user.email);
        user.phone = SensitiveUtils.mobilePhone(user.phone);
    },

    /**
     * 注册
     * @param req
     * @param callback
     */
    register: function (req, callback) {
        //if (req.body.captcha == req.session.captcha) {
        //    return callback(new ApplicationError("图片验证码不对", 400, 0));
        //}
        var code = req.body.code;
        if (code != LoginConfig.inviteCode) {
            return callback(new ApplicationError('邀请码不对', 400, 1))
        }
        var smsCode = req.body.smsCode;
        if (!smsCode) {
            return callback(new ApplicationError("验证码为空", 400, 2));
        }
        var username = req.body.username;
        var password = req.body.password;
        var confirmedPassword = req.body.confirmedPassword;
        var phone = req.body.phone;
        var email = req.body.email;
        if (!username || !password || password != confirmedPassword) {
            return callback(new ApplicationError('参数不合法', 400, 3));
        }
        var userroleid = req.body.userroleid;
        if (!userroleid) {//普通用户
            userroleid = 1;
        }
        Async.waterfall([
            function (callback) {//验证验证码是否正确
                loginRequest.checkSmsCode(phone, smsCode, function (err, result) {
                    if (err) {
                        return callback(new ApplicationError(err.message || "验证码不对", 400, 4));
                    }
                    callback(null, result);
                });
            },
            function (result, callback) {//检查用户是否已经存在
                User.get(username, function (err, user) {
                    if (err) {
                        return callback(new ApplicationError(err.message || "内部错误", 400, 5));
                    }
                    if (user) {
                        return callback(new ApplicationError("用户已经存在", 400, 6));
                    }
                    callback(null, null);
                });
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            var newUser = {
                unionid: uuid.v1(),
                username: username,
                nickname: username,
                password: password,
                phone: phone,
                email: email,
                userref: 0,// from self
                userroleid: userroleid
            };
            Async.waterfall(loginRequest.registerNewUser(newUser, req), function (err, user) {
                if (err) {
                    return callback(err);
                }
                User.get(user.username, function (err, user) {
                    loginRequest.setSession(req, user, function (err, result) {
                        callback(null, user);
                    });
                });
            });
        });
    },

    /**
     * 验证验证码是否正确
     * @param phone
     * @param smsCode
     * @param callback
     */
    checkSmsCode: function (phone, smsCode, callback) {
        RedisClient.get(RKG.generatePhoneSmsCode(phone), function (err, result) {
            if (err) {
                return callback(err, null);
            }
            if (LoginConfig.smsCodeEnabled) {
                if (result != smsCode) {
                    return callback(new ApplicationError("验证码不正确", 400));
                }
            }
            callback(null, true);
        });
    },

    setSession: function (req, noIdUser, callback) {
        User.get(noIdUser.username, function (err, user) {
            req.session.user = {
                name: user.username,
                userid: user.id
            };
            globalDatabase.session = req.session;
            callback(null, user);
        });
    },
    /**
     * 登录
     * @param req
     * @param callback
     */
    login: function (req, callback) {
        var username = req.body.username;
        var password = req.body.password;
        Async.waterfall([
            function (callback) {
                User.get(username, function (err, user) {
                    if (err || !user) {
                        return callback(new ApplicationError((err && err.message) || '用户不存在', 403, 1));
                    }
                    callback(null, user);
                });
            },
            function (user, callback) {
                hash(password, user.salt, function (err, hash) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    if (hash != user.hash) {
                        return callback(new ApplicationError('用户名或者密码错误', 403, 3));
                    }
                    return callback(null, user);
                });
            }
        ], function (err, user) {
            if (err) {
                return callback(err);
            }
            loginRequest.setSession(req, user, function (err, result) {
                callback(null, user);
            });
        });
    },

    /**
     *
     * @param req
     * @param callback
     * @returns {*}
     */
    getUser: function (req, callback) {
        if (!req.query || !req.query.address) {
            return callback(new ApplicationError("params missing", 400, 2));
        }
        loginRequest.getUserByAddress(req.query.address, callback);
    },

    /**
     * 更新用户信息
     * @param req
     * @param callback
     */
    updateUser: function (req, callback) {
        loginRequest.getUserByUsername(req, function (err, user) {
            if (err) {
                return callback(err);
            } else {
                var nickname = req.body.nickname;
                if (nickname) {
                    user.nickname = nickname;
                }
                var phone = req.body.phone;
                if (phone) {
                    user.phone = phone;
                }
                //todo 添加验证邮箱的逻辑
                var email = req.body.email;
                if (email) {
                    user.email = email;
                }
                var status = req.body.status;
                if (status) {
                    user.status = status;
                }
                var companyname = req.body.companyname;
                if (companyname) {
                    user.companyname = companyname;
                }
                var title = req.body.title;
                if (title) {
                    user.title = title;
                }
                var realname = req.body.realname;
                if (realname) {
                    user.realname = realname;
                }
                var description = req.body.description;
                if (description) {
                    user.description = description;
                }
                var price = req.body.price;
                if (price) {
                    user.price = price;
                }
                var income = req.body.income;
                if (income) {
                    user.income = income;
                }
                var password = req.body.password;
                if (password) {//修改密码
                    var newPassword = req.body.newPassword;
                    var confirmNewPassword = req.body.confirmNewPassword;
                    if (!newPassword || newPassword != confirmNewPassword) {
                        return callback(new ApplicationError("密码为空或不一致"));
                    }
                    return Async.waterfall([
                        function (callback) {
                            hash(password, user.salt, function (err, hash) {
                                if (err) {
                                    return callback(new ApplicationError(err.message || err, 500, 2));
                                }
                                if (hash != user.hash) {
                                    return callback(new ApplicationError('用户名或者密码错误', 403, 3));
                                }
                                user.password = newPassword;
                                return callback(null, user);
                            });
                        },
                        function (user, callback) {
                            hash(user.password, function (err, salt, hash) {
                                if (err) {
                                    return callback(err);
                                }
                                delete user.password;
                                user.salt = salt;
                                user.hash = hash;
                                callback(null, user);
                            });
                        },
                        function (user, callback) {
                            User.update(user, function (err, effects) {
                                if (err) {
                                    return callback(err);
                                }
                                callback(null, user);
                            });
                        }
                    ], function (err, user) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, user);
                    });
                }
                if (phone) {//修改电话号码
                    return loginRequest.checkSmsCode(phone, req.body.code, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        User.update(user, function (err, effects) {
                            if (err) {
                                return callback(err);
                            }
                            callback(null, user);
                        });
                    });
                }
                //修改其他
                User.update(user, function (err, effects) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, user);
                });
            }
        });
    },

    getUserByUsername: function (req, callback) {
        var userSession = req.session.user;
        User.getByUsername(userSession.name, function (err, user) {
            if (err) {
                console.error("get user by username", userSession.name, "error");
                return callback(new ApplicationError("user not exists", 400, 1));
            }
            callback(null, user);
        });
    },
    /**
     * 获取地址对应的帐号信息
     * @param address
     * @param callback
     */
    getUserByAddress: function (address, callback) {
        var addressKey = RKG.generateAddressKey(address);
        RedisClient.get(addressKey, function (err, result) {
            if (result) {
                try {
                    return callback(null, JSON.parse(result));
                } catch (err) {
                    console.error("parse", result, "error", err);
                }
            }
            User.getByAddress(address, function (err, user) {
                if (err) {
                    console.error("get user by address", address, "error");
                    return callback(new ApplicationError("user not exists", 400, 1));
                }
                RedisClient.setex(addressKey, 24 * 60 * 60, JSON.stringify(user));
                callback(null, user);
            });
        });
    },

    getUserBalances: function (req, callback) {
        var username = req.session.user.name;
        Async.waterfall([
            function (callback) {
                User.get(username, function (err, user) {
                    if (err) {
                        return callback(new ApplicationError("获取用户信息错误", 500, 1));
                    }
                    callback(null, user);
                });
            },
            function (user, callback) {
                ApiRequest.getBalances(user.address, function (err, balances) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    callback(null, balances);
                });
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    transfer: function (req, callback) {
        if (!req.body) {
            return callback(new ApplicationError("缺少参数", 400, 1));
        }
        var amount = req.body.amount;
        var address = req.body.address;
        var password = req.body.password;
        if (!amount || amount == '' || !address || address == '' || !password || password == '') {
            return callback(new ApplicationError("参数异常", 400, 2));
        }
        var userId = req.session.user.userid;
        Async.waterfall([
            function (callback) {
                User.getByUserId(userId, function (err, user) {
                    callback(err, user);
                });
            },
            function (user, callback) {
                hash(password, user.salt, function (err, hash) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    if (hash != user.hash) {
                        return callback(new ApplicationError('用户名或者密码错误', 403, 3));
                    }
                    return callback(null, user);
                });
            },
            function (user, callback) {
                var currency = AuctionConfig.coinsCurrency;
                var issuer = AuctionConfig.issuer;
                var memos = [{"memo_type": "string", "memo_data": JSON.stringify({trans_type: 'transfer'})}];
                ApiRequest.payments(user.address, user.secret, address, amount, currency, issuer, memos, true, function (err, response) {
                    if (err) {
                        console.error("payments failed", response, err);
                        return callback(new ApplicationError("转账失败", 500, 4));
                    }
                    console.log("transfer success", response);
                    callback(null, response);
                });
            }
        ], function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    feedback: function (req, callback) {
        if (!req.body) {
            return callback(new ApplicationError("缺少参数", 400, 1));
        }
        var feedback = req.body.content;
        var userId = req.session.user.userid;
        console.log("userId " + userId + " feedback " + feedback);
        User.insertUserFeedback({userid: userId, feedback: feedback}, function (err, result) {
            if (err || result < 1) {
                return callback(new Error(err.message || "保存用户反馈信息失败"));
            }
            callback(null, result);
        });
    },

    getExpertList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        User.getExpertList(null, pagination, function (err, expertList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!expertList || expertList.length == 0) {
                return;
            }
            callback(null, expertList);
        });
    },

    getMyExpertList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        User.listWatchedExperts({
            userid: req.session.user.id
        }, pagination, function (err, expertList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!expertList || expertList.length == 0) {
                return;
            }
            callback(null, expertList);
        });
    }
};

module.exports = loginRequest;
