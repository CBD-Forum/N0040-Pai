/**
 * Created by Zhuli on 2017/2/25 0025.
 */
var QuestionRequest = require('./QuestionRequest');
var ArticleRequest = require('./ArticleRequest');
var OrderRequest = require('../order-api/OrderRequest');
var Auth = require('../common/SessionAuth');

module.exports = function (app) {

    /**
     * 提问
     */
    app.post('/v1/question', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.addExpertQuestion(req, function (err, question) {
            if (err) {
                next(err);
            } else {
                OrderRequest.wxpayPay(question.id, req.ip, question.price, function (err, result) {
                    if (err) {
                        next(err);
                    } else {
                        res.send({
                            code: 0,
                            data: result
                        });
                    }
                });
            }
        });
    });

    /**
     * 修改提问
     */
    app.put('/v1/question', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.update(req, function (err, question) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: question
                });
            }
        });
    });

    app.get('/v1/question', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.get(req, function (err, question) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: question
                });
            }
        });
    });

    /**
     * 删除提问
     */
    app.delete('/v1/question', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.deleteExpertQuestion(req, function (err, result) {
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
     * 查看我的提问数量
     */
    app.get('/v1/myask/count', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.getMyAskedQuestionCount(req, function (err, expert) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expert
                });
            }
        });
    });

    /**
     * 查看我的提问列表
     */
    app.get('/v1/myask/list', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.getMyAskedQuestionList(req, function (err, expert) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expert
                });
            }
        });
    });

    /**
     * 查看我的问题数量
     */
    app.get('/v1/myquestion/count', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.getMyQuestionCount(req, function (err, expert) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expert
                });
            }
        });
    });

    /**
     * 查看我的问题列表
     */
    app.get('/v1/myquestion/list', /*Auth.authorize,*/function (req, res, next) {
        QuestionRequest.getMyQuestionList(req, function (err, expert) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expert
                });
            }
        });
    });

    /**
     * 回答问题
     */
    app.post('/v1/answer', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.addAnswer(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    /**
     * 修改回答
     */
    app.put('/v1/answer', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.updateAnswer(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    app.get('/v1/answer', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.get(req, function (err, question) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: question
                });
            }
        });
    });

    app.delete('/v1/answer', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.delete(req, function (err, question) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: question
                });
            }
        });
    });

    /**
     * 可以围观问题列表
     */
    app.get('/v1/questions/list', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getAnsweredQuestionList(req, function (err, questionlist) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: questionlist
                });
            }
        });
    });

    /**
     * 查看问题
     */
    app.get('/v1/questions/view', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getAnsweredQuestion(req, function (err, article) {
            if (err) {
                next(err);
            } else if(!article){
                ArticleRequest.get(req, function (err, article) {
                    if (err) {
                        next(err);
                    }
                    OrderRequest.wxpayPay(article.id, req.ip, article.readprice, function (err, result) {
                        if (err) {
                            next(err);
                        } else {
                            res.send({
                                code: 0,
                                data: result
                            });
                        }
                    });
                })
            }else{
                res.send({
                    code: 0,
                    data: article
                });
            }
        });
    });

    /**
     * 收藏
     */
    app.post('/v1/bookmark', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.mark(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    /**
     * 取消收藏
     */
    app.delete('/v1/bookmark', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.cancelMark(req, function (err, result) {
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
     * 收藏数
     */
    app.get('/v1/bookmark/count', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getBookmarkCount(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    /**
     * 收藏
     */
    app.post('/v1/articlegood', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.saygood(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    /**
     * 取消收藏
     */
    app.delete('/v1/articlegood', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.cancelSaygood(req, function (err, result) {
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

    app.get('/v1/articlegood/count', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getGoodCount(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    /**
     * 收藏
     */
    app.post('/v1/articlebad', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.saybad(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    /**
     * 取消收藏
     */
    app.delete('/v1/articlebad', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.cancelSaybad(req, function (err, result) {
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

    app.get('/v1/articlebad/count', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getBadCount(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    app.get('/v1/article/readcount', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getReadCount(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    app.post('/v1/comment', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.comment(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    app.put('/v1/comment', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.updatecomment(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    app.delete('/v1/comment', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.deleteComment(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });

    app.get('/v1/comments/list', /*Auth.authorize,*/function (req, res, next) {
        ArticleRequest.getCommentList(req, function (err, answer) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: answer
                });
            }
        });
    });
}