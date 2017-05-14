/**
 * Created by Zhuli on 2017/2/25 0025.
 */
var ApiRequest = require('../jingtum-api/ApiRequest');
var OrderRequest = require('../order-api/OrderRequest');
var Async = require('async');
var Schedule = require('node-schedule');
var LocalTime = require('../common/Time');

var Article = require('./Article');
var Question = require('./Question');
var Payment = require('./Payment');

var ApplicationError = require('../error/ApplicationError');

const HTTP_SUCCESS_CODE = 200;

var questionRequest = {

    init: function () {

    },

    /**
     * 添加达人问题
     * @param req
     * @param callback
     */
    addExpertQuestion: function (req, callback) {
        var newQuestion = {
            askuserid: req.body.userid,//req.session.user.name,
            answerexpertid: req.body.expertid,
            questiontype : 1,//达人问题
            price: req.body.price,
            content: req.body.content,
            publishtime : (req.body.status && req.body.status == 0) ? new Date().getTime() : null,
            status: req.body.status ? parseInt(req.body.status) : 0
        };

        questionRequest.validateExpertQuestion(newQuestion, function (err, newQuestion) {
            if (err) {
                return callback(err);
            }
            Question.insert(newQuestion, function (err, effects) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 3));
                }
            });

        });
    },

    deleteExpertQuestion: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Question.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    /**
     * 验证达人问题内容
     * @param question
     * @param callback
     * @returns {*}
     */
    validateExpertQuestion: function (question, callback) {
        if (!question.askuserid || !question.answerexpertid || !question.content || !question.price) {
            return callback(new ApplicationError("参数不合法", 400, 1))
        }
        callback(null, question);
    },

    update: function (req, callback) {
        var newQuestion = {
            id : req.body.id,
            price: req.body.price,
            content: req.body.content,
            status: req.body.status ? parseInt(req.body.status) : 0
        };
        if (!newQuestion.id) {
            return callback(new ApplicationError("参数不合法", 400, 1));
        }
        Async.waterfall([
            function (callback) {
                Question.update(newQuestion, function (err, effects) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    console.log("update expert", newQuestion.id, "effects", effects);
                    callback(null, newQuestion);
                });
            }
        ], function (err, newQuestion) {
            if (err) {
                return callback(err);
            }
            callback(null, newQuestion);
        });
    },

    get: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        // Question.get(params.id, function (err, question) {
        //     if (err) {
        //         return callback(new ApplicationError(err.message || err, 500, 2));
        //     }
        //     var key = {
        //         questionid : question.id
        //     };
        //     var pagination = {
        //         page: 1,
        //         pageSize: 10
        //     };
        //     Article.listAnswers(key, pagination, function (err, answers){
        //         question.answers = answers;
        //     });
        //     callback(null, question);
        // });
        Async.waterfall([
            function (callback) {
                Question.get(params.id, function (err, question) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }

                    callback(null, question);
                });
            },
            function (question, callback) {
                var key = {
                    questionid : question.id
                };
                var pagination = {
                    page: 1,
                    pageSize: 10
                };
                Article.listAnswers(key, pagination, function (err, answers){
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    question.answers = answers;
                    callback(null, question);
                });
            }
        ], function (err, question) {
            if (err) {
                return callback(err);
            }
            callback(null, question);
        });
    },

    getAnsweredQuestionList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Question.listAnseredQuestions(params, pagination, function (err, questionList) {
            if (err) {
                return console.error("获取我的提问列表失败");
            }
            if (!questionList || questionList.length == 0) {
                return;
            }
            callback(null, questionList);
        });
    },

    getMyAskedQuestionList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Question.listMyAsk(params, pagination, function (err, questionList) {
            if (err) {
                return console.error("获取我的提问列表失败");
            }
            if (!questionList || questionList.length == 0) {
                return;
            }
            callback(null, questionList);
        });
    },

    getMyQuestionList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Question.listMyAnswers(params, pagination, function (err, questionList) {
            if (err) {
                return console.error("获取我的提问列表失败");
            }
            callback(null, questionList);
        });
    },

    getMyAskedQuestionCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.username) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Question.countByFollowerId(params.username, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    getMyQuestionListCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Question.countByUserId(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    /**
     *
     * 微信支付回调请求（提问支付）
     * @param req
     * @param callback
     */
    wxpayCallback: function (req, callback) {
        // var result = req.body;
        // console.log(result);
        // if (!result.xml) {
        //     return callback(null, orderRequest.createRet('FAIL', '参数格式不对'));
        // }
        // var data = result.xml;
        // var sign = SignUtils.signWeixinCallback(OrderConfig.apikey, data);
        // if (sign != data.sign[0]) {
        //     console.error("订单的签名不正确", data.sign, "!=", sign);
        //     return callback(null, orderRequest.createRet('FAIL', "签名不对"));
        // }
        // if (!orderRequest.weixinRetIsX(data.return_code, 'SUCCESS')) {
        //     console.error("订单状态不正确", data.return_code, data.return_msg);
        //     return callback(null, orderRequest.createRet('FAIL', data.return_msg));
        // }
        // var outTradeNo = data.out_trade_no[0];
        questionRequest.paymentCallback(id, callback);
    },

    paymentCallback: function (id, callback) {
        Question.get(id, function (err, question) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            Question.publish(question.id, function (err, updatecount) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 2));
                }
            });
            var payment = {
                targetid : question.id,
                typeid: 0,
                userid: question.askuserid
            };
            Payment.insert(payment, function (err, updatecount) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 2));
                }
                callback(null, OrderRequest.createRet('SUCCESS', 'OK'));
            });
        });
    }
};

module.exports = questionRequest;