/**
 * Created by Zhuli on 2017/2/25 0025.
 */
var PgPool = require('../common/PgPool');

module.exports = {

    countByQuestion: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS articlecount FROM article WHERE questionid=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取达人信息失败' + "questionid=" + id);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].expertcount) : 0);
            });
        });
    },

    listAnswers: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        var authorflag = (!!params && !!params.authorid);
        if (authorflag){
            querys.push(params.authorid);
        }
        var questionflag = (!!params && !!params.questionid);
        if (questionflag) {
            querys.push(params.questionid);
        }

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT a.*, u.realname, u.title as titlename, u.companyname FROM article a JOIN users u ON a.authorid=u.id WHERE a.status<>-1 ";
            if (!!params && !!params.keyword){
                strSql += " and (a.title like '%" + params.keyword + "%' ";
            }
            if (authorflag){
                strSql += " and a.authorid=$3 ";
                if (questionflag){
                    strSql += " and a.questionid=$4 ";
                }
            } else if (questionflag){
                strSql += " and a.questionid=$3 ";
            }

            strSql += "ORDER BY a.id desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取答案列表失败' + "username=" + params.username);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    listQuestionArticles : function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        var authorflag = (!!params && !!params.authorid);
        if (authorflag){
            querys.push(params.authorid);
        }
        var questionflag = (!!params && !!params.questionid);
        if (questionflag) {
            querys.push(params.questionid);
        }

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT a.*, u.realname, u.title as titlename, u.companyname, q.content as questioncontent, q.price";
            if(params.userid){
                strSql += " , p.id as paymentid  ";
            }
            strSql += " FROM article a JOIN question q ON a.questionid=q.id ";
            strSql += " JOIN users u ON a.authorid=u.id ";
            if(params.userid) {
                strSql += " LEFT OUTER JOIN payment_order p ON a.id=p.targetid and p.typeid=1 and p.userid=$3 ";
                querys.push(params.userid);
            }
            strSql += " WHERE a.status<>-1 ";
            if (!!params && !!params.keyword){
                strSql += " and (a.title like '%" + params.keyword + "%' ";
            }

            strSql += "ORDER BY a.id desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取答案列表失败' + "username=" + params.userid);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    /***
     * 文章列表
     * @param pagination
     * @param callback
     */
    listNormalArticles: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        var authorflag = (!!params && !!params.authorid);
        if (authorflag){
            querys.push(params.authorid);
        }

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT * FROM article WHERE status<>-1 and articletype=1 ";
            if (!!params && !!params.keyword){
                strSql += " and (title like '%" + params.keyword + "%' ";
            }
            if (authorflag){
                strSql += " and authorid=$3"
            }

            strSql += "ORDER BY publishtime desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取文章列表失败' + "username=" + params.userid);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    getAnsweredQuestion: function (id, userid, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT a.*, u.realname, u.title as titlename, u.companyname, q.content as questioncontent, q.price";
            strSql += " FROM article a JOIN question q ON a.questionid=q.id ";
            strSql += " JOIN users u ON a.authorid=u.id ";
            strSql += " JOIN payment_order p ON a.id=p.targetid and p.typeid=1 and p.userid=$2 ";
            strSql += " WHERE a.status<>-1 and a.id=$1";
            client.query(strSql, [id, userid], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取文章错误' + "id=" + id);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    get: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM article WHERE id=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取文章错误' + "id=" + id);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    update: function (article, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE article SET content=$2, title=$3, status=$4, updatetime=current_timestamp WHERE id=$1",
                [article.id, article.content, article.title, article.status], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新文章出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    publish: function (article, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE article SET status=0, publishtime=current_timestamp, updatetime=current_timestamp WHERE id=$1",
                [article.id], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "发布文章出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    insert: function (article, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO article(title, authorid, questionid, readprice, content, status) VALUES($1, $2, $3, $4, $5, $6)",
                [article.title, article.authorid, article.questionid, article.readprice, article.content, article.status], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存文章出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE article SET status=-1 WHERE id=$1", [id], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "删除文章出错");
                }
                callback(null, result.rowCount);
            });
        });
    }
};
