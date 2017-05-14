/**
 * Created by Zhuli on 2017/2/25 0025.
 */
var PgPool = require('../common/PgPool');

module.exports = {

    /**
     * 获取用户提问数
     * @param username
     * @param callback
     */
    countByUserid: function (username, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS questioncount FROM question WHERE userid=$1', [username], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取提问数失败' + "username=" + username);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].questioncount) : 0);
            });
        });
    },

    /**
     * 获取专家回答问题数
     * @param expertid
     * @param callback
     */
    countByExpertid: function (expertid, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS questioncount FROM question WHERE answerexpertid=$1', [expertid], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取达人回答问题数失败' + "expertid=" + expertid);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].questioncount) : 0);
            });
        });
    },

    /**
     * 回答问题列表
     * @param params
     * @param pagination
     * @param callback
     */
    listAnseredQuestions: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT q.*, a.* FROM question q JOIN article a ON q.questiontype=1 and q.id = a.questionid  and a.status=0 WHERE q.status<>-1 ";
            strSql += "ORDER BY q.id desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取我的提问失败' + "username=" + params.username);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    /***
     * 我的提问列表
     * @param pagination
     * @param callback
     */
    listMyAsk: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        querys.push(params.userid);

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT q.*, COALESCE(p.id, 0) as paymentid, COALESCE(a.status, 1) as answerstatus FROM question q LEFT OUTER JOIN article a ON q.id = a.questionid  ";
            strSql += " LEFT OUTER JOIN payment_order p ON q.id = p.targetid and p.typeid=0 ";
            strSql += " WHERE q.status<>-1 ";
            strSql += " and q.askuserid=$3"
            strSql += "ORDER BY q.publishtime desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取我的提问失败' + "userid=" + params.userid);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    /**
     * 我回答的问题
     * @param params
     * @param pagination
     * @param callback
     */
    listMyAnswers : function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        querys.push(params.userid);

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT q.*, COALESCE(a.status, 1) as answerstatus FROM question q JOIN payment_order p ON q.id = p.targetid and p.typeid=0 ";
            strSql += " LEFT OUTER JOIN article a ON q.id = a.questionid  WHERE q.status<>-1 ";
            strSql += " and q.answerexpertid=$3 "
            strSql += " ORDER BY q.publishtime desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取我回答的问题失败' + "userid=" + params.userid);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    get: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM question WHERE id=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取问题信息错误' + "id=" + id);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    /**
     * 修改问题信息
     * @param question
     * @param callback
     */
    update: function (question, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE question SET content=$2, price=$3, status=$4, updatetime=current_timestamp WHERE id=$1",
                [question.id, question.content, question.price, question.status], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新问题信息出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    publish: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE question SET status=0, publishtime=current_timestamp, updatetime=current_timestamp WHERE id=$1",
                [id], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "发布问题信息出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    /**
     * 添加问题
     * @param question
     * @param callback
     */
    insert: function (question, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO question(askuserid, answerexpertid, questiontype, price, content, status) VALUES($1, $2, $3, $4, $5, $6)",
                [question.askuserid, question.answerexpertid, question.questiontype, question.price, question.content, question.status], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存问题信息出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    /**
     * 取消问题
     * @param id
     * @param callback
     */
    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE question SET status=-1 WHERE id=$1", [id], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "删除问题信息出错");
                }
                callback(null, result.rowCount);
            });
        });
    }
};
