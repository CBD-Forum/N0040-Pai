var LoginRequest = require('./LoginRequest');
var Auth = require('../common/SessionAuth');

LoginRequest.init();

module.exports = function (app) {

    /**
     * 使用微信帐号登入的回调地址
     * 参数:
     * code
     * next
     */
    app.get('/v1/access/weixin/oauth2', function (req, res) {
        LoginRequest.weixinCallback(req, res);
    });

    /**
     * 使用井通app帐号登入的回调地址
     * 参数:
     * code
     * next
     */
    app.get('/v1/access/jingtum/oauth2', function (req, res) {
        LoginRequest.jingtumCallback(req, res);
    });

    app.post('/v1/register', function (req, res, next) {
        LoginRequest.register(req, function (err, user) {
            if (err) {
                next(err);
            } else {
                LoginRequest.processSensitive(user);
                console.log("user", user.username, "register success");
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });

    /**
     * 发送验证码
     */
    app.post('/v1/sendcode', function (req, res, next) {
        if (1) {
            return res.send({
                code: 1,
                msg: '不支持'
            })
        }
        LoginRequest.sendCode(req, function (err, smsCode) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: smsCode
                });
            }
        });
    });

    /**
     * 发送验证码
     */
    app.post('/v1/sendcode1', function (req, res, next) {
        LoginRequest.sendCode1(req, function (err, smsCode) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: smsCode
                });
            }
        });
    });

    /**
     * 修改用户信息
     */
    app.put('/v1/user', Auth.authorize, function (req, res, next) {
        LoginRequest.updateUser(req, function (err, user) {
            if (err) {
                next(err);
            } else {
                LoginRequest.processSensitive(user);
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });

    /**
     * 获取用户的余额列表
     */
    app.get('/v1/user/balance', Auth.authorize, function (req, res, next) {
        LoginRequest.getUserBalances(req, function (err, balances) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: balances
                });
            }
        });
    });

    /**
     * 转账
     */
    app.post('/v1/user/transfer', Auth.authorize, function (req, res, next) {
        LoginRequest.transfer(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    app.get('/v1/user', Auth.authorize, function (req, res, next) {
        LoginRequest.getUserByUsername(req, function (err, user) {
            if (err) {
                next(err);
            } else {
                LoginRequest.processSensitive(user);
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });

    app.get('/v1/user/address', function (req, res, next) {
        LoginRequest.getUser(req, function (err, user) {
            if (err) {
                next(err);
            } else {
                LoginRequest.processSensitive(user);
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });

    /**
     * 登录
     */
    app.post('/v1/login', function (req, res, next) {
        LoginRequest.login(req, function (err, user) {
            if (err) {
                next(err);
            } else {
                LoginRequest.processSensitive(user);
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });

    /**
     * 退出
     */
    app.post('/v1/logout', Auth.authorize, function (req, res) {
        req.session = null;
        res.send({
            code: 0,
            msg: 'success'
        });
    });

    /**
     * 反馈
     */
    app.post('/v1/feedback', Auth.authorize, function (req, res) {
        LoginRequest.feedback(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    /**
     * 获取达人列表
     */
    app.get('/v1/experts', function (req, res, next) {
        LoginRequest.getExpertList(req, function (err, expertList) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expertList
                });
            }
        });
    });

    /**
     * 获取关注达人列表
     */
    app.get('/v1/my/experts', Auth.authorize, function (req, res, next) {
        LoginRequest.getMyExpertList(req, function (err, expertList) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expertList
                });
            }
        });
    });

    /**
     * 在neo4j创建节点
     */
    app.post('/v1/neo4j-node', function (req, res) {
        LoginRequest.createNeo4jNode(req, function (err, user) {
            if (err) {
                next(err);
            } else {
                LoginRequest.processSensitive(user);
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });
};