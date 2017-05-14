/**
 * Created by Zhuli on 2017/2/25 0025.
 */
var ApiRequest = require('../jingtum-api/ApiRequest');
var Async = require('async');
var Schedule = require('node-schedule');
var LocalTime = require('../common/Time');

var Article = require('./Article');
var Good = require('./ArticleGood');
var Read = require('./ArticleRead');
var Bookmark = require('./Bookmark');
var Question = require('./Question');
var Comment = require('./Comment');

var ApplicationError = require('../error/ApplicationError');

const HTTP_SUCCESS_CODE = 200;

var articleRequest = {

    init: function () {

    },

    addArticle: function (req, callback) {
        var newArticle = {
            title: req.body.title,//req.session.user.name,
            expertid: req.body.expertid,
            readprice : req.body.readprice,
            content: req.body.content,
            publishtime : (req.body.status && req.body.status == 0) ? new Date().getTime() : null,
            status: req.body.status ? parseInt(req.body.status) : 0
        };

        articleRequest.validateNormalArticle(newArticle, function (err, newExpert) {
            if (err) {
                return callback(err);
            }
            Article.insert(newArticle, function (err, effects) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 3));
                }
                callback(null, newArticle);
            });
        });
    },

    validateNormalArticle: function (article, callback) {
        if (!article.expertid || !article.title || !article.content) {
            return callback(new ApplicationError("参数不合法", 400, 1))
        }
        callback(null, article);
    },

    addAnswer: function (req, callback) {
        var newArticle = {
            title: '',
            questionid: req.body.questionid,//req.session.user.name,
            questiontype : 2,
            authorid: req.body.authorid,
            readprice : 1,
            content: req.body.content,
            status: req.body.status ? parseInt(req.body.status) : 0
        };

        articleRequest.validateAnswer(newArticle, function (err, newExpert) {
            if (err) {
                return callback(err);
            }
            Article.insert(newArticle, function (err, effects) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 3));
                }
                callback(null, newArticle);
            });
        });
    },

    validateAnswer: function (article, callback) {
        if (!article.authorid || !article.questionid || !article.content) {
            return callback(new ApplicationError("参数不合法", 400, 1))
        }
        callback(null, article);
    },

    delete: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Article.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    update: function (req, callback) {
        var  article = {
            id: parseInt(req.body.id),
            title: req.body.title,
            readprice : req.body.readprice,
            content: req.body.content,
            status: req.body.status ? parseInt(req.body.status) : 0
        };
        if (!article.id) {
            return callback(new ApplicationError("参数不合法", 400, 1));
        }
        Async.waterfall([
            function (callback) {
                Article.update(article, function (err, effects) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    console.log("update expert", article.id, "effects", effects);
                    callback(null, newExpert);
                });
            }
        ], function (err, article) {
            if (err) {
                return callback(err);
            }
            callback(null, article);
        });
    },

    updateAnswer: function (req, callback) {
        var  newArticle = {
            id: parseInt(req.body.id),
            title: '',
            content: req.body.content,
            status: req.body.status ? parseInt(req.body.status) : 0
        };
        if (!newArticle.id) {
            return callback(new ApplicationError("参数不合法", 400, 1));
        }
        Async.waterfall([
            function (callback) {
                Article.update(newArticle, function (err, effects) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    console.log("update expert", newArticle.id, "effects", effects);
                    callback(null, newArticle);
                });
            }
        ], function (err, newArticle) {
            if (err) {
                return callback(err);
            }
            callback(null, newArticle);
        });
    },

    get: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Article.get(params.id, function (err, article) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, article);
        });
    },

    getAnsweredQuestion: function (req, callback) {
        var params = req.query;
        if (!params || !params.id || !params.userid) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Article.getAnsweredQuestion(params.id, params.userid, function (err, article) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, article);
        });
    },

    getAnsweredQuestionList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Article.listQuestionArticles(params, pagination, function (err, expertList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!expertList || expertList.length == 0) {
                return;
            }
            callback(null, expertList);
        });
    },

    /**
     * 获取文章列表
     * @param req
     * @param callback
     */
    getNormalArticleList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Article.listNormalArticles(params, pagination, function (err, expertList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!expertList || expertList.length == 0) {
                return;
            }
            callback(null, expertList);
        });
    },

    readArticle : function (req, callback) {
        var newRead = {
            username: req.body.username,//req.session.user.name,
            ariticleid: req.body.ariticleid,
            price : req.body.price
        };

        Read.insert(newRead, function (err, effects) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 3));
            }
            callback(null, newRead);
        });
    },

    getMyReadArticles: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Read.listMyReadArticles(params, pagination, function (err, expertList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!expertList || expertList.length == 0) {
                return;
            }
            callback(null, expertList);
        });
    },

    getReadCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Read.countByArticleId(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    mark : function (req, callback) {
        var newBookmark = {
            userid: req.body.userid,//req.session.user.name,
            articleid: req.body.articleid
        };

        Bookmark.insert(newBookmark, function (err, effects) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 3));
            }
            callback(null, newBookmark);
        });
    },

    cancelMark : function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Bookmark.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    getBookmarks: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Bookmark.listBookmarks(params, pagination, function (err, expertList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!expertList || expertList.length == 0) {
                return;
            }
            callback(null, expertList);
        });
    },

    getBookmarkCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Bookmark.countByArticleId(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    saygood : function (req, callback) {
        var newGood = {
            userid: req.body.userid,//req.session.user.name,
            articleid: req.body.articleid,
            type: req.body.type
        };
        Async.waterfall([
            function (callback) {
                Good.countByArticleNValue(newGood.userid, newGood.articleid, null, function (err, goodcount) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    callback(null, goodcount);
                });
            },
            function (goodcount, callback) {

                if (goodcount == 0){
                    return callback(null, 1);
                }
                Good.countByArticleNValue(newGood.userid, newGood.articleid, newGood.type, function (err, goodcount) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    if (goodcount == 0) {
                        return callback(null, 2);
                    }
                    return callback(null, 3);
                });
            },
            function (writeType, callback) {
               if (writeType == 1){
                   Good.insert(newGood, function (err, effects) {
                       if (err) {
                           return callback(new ApplicationError(err.message || err, 500, 3));
                       }
                       return callback(null, newGood);
                   });
               } else if (writeType == 2) {
                   Good.get(newGood.userid, newGood.articleid, function (err, oldGood) {
                       if (err) {
                           return callback(new ApplicationError(err.message || err, 500, 3));
                       }
                       newGood.id = oldGood.id;
                       Good.update(newGood, function (err, effects) {
                           if (err) {
                               return callback(new ApplicationError(err.message || err, 500, 3));
                           }
                           return callback(null, newGood);
                       });
                   })

               } else {
                   if (newGood.type == 1) {
                       return callback(new ApplicationError("已经赞过了。" || err, 500, 3));
                   } else {
                       return callback(new ApplicationError("已经吐槽过了。" || err, 500, 3));
                   }
               }
            }
        ], function (err, newGood) {
            if (err) {
                return callback(err);
            }
            callback(null, newGood);
        });

    },

    cancelSaygood : function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Good.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    getGoodCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Good.countGood(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    saybad : function (req, callback) {
        var newBad = {
            userid: req.body.userid,//req.session.user.name,
            articleid: req.body.articleid,
            type: -1
        };
        Good.insert(newBad, function (err, effects) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 3));
            }
            callback(null, newBad);
        });
    },

    getBadCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Good.countBad(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    comment : function (req, callback) {
        var newComment = {
            userid: req.body.userid,//req.session.user.name,
            articleid: req.body.articleid,
            content: req.body.content
        };
        Comment.insert(newComment, function (err, effects) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 3));
            }
            callback(null, newComment);
        });
    },

    updatecomment : function (req, callback) {
        var newComment = {
            id: req.body.id,//req.session.user.name,
            content: req.body.content
        };
        Comment.update(newComment, function (err, effects) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 3));
            }
            callback(null, newComment);
        });
    },

    deleteComment : function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Comment.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    getCommentCount: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Comment.countByArticleId(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },

    getCommentList: function (req, callback) {
        var params = req.query;
        var pagination = {
            page: params.page ? params.page : 1,
            pageSize: params.pageSize ? params.pageSize : 10
        };
        Comment.list(params, pagination, function (err, commentList) {
            if (err) {
                return console.error("获取达人列表失败");
            }
            if (!commentList || commentList.length == 0) {
                return;
            }
            callback(null, commentList);
        });
    },

    /**
     *
     * 微信支付回调请求（观看文章或问答支付）
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
        var userid = req.session.user.name;
        articleRequest.paymentCallback(id,userid, callback);
    },

    paymentCallback: function (id,userid, callback) {
        Article.get(id, function (err, question) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            Article.publish(question.id, function (err, updatecount) {
                if (err) {
                    return callback(new ApplicationError(err.message || err, 500, 2));
                }
            });
            var payment = {
                targetid : question.id,
                typeid: 1,
                userid: userid
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

module.exports = articleRequest;