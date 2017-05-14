/**
 * Created by Zhuli on 2017/2/27 0027.
 */
var PgPool = require('../common/PgPool');

module.exports = {

    countByArticleId: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS goodcount FROM article_good WHERE articleid=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取点赞数失败' + "articleid=" + id);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].goodcount) : 0);
            });
        });
    },

    countByArticleNValue: function (userid, articleid, value, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var querys = [];
            querys.push(userid);
            querys.push(articleid);
            var strSql = "SELECT COUNT(*) AS goodcount FROM article_good WHERE userid=$1 and articleid=$2 ";
            if (!!value){
                strSql += " and type=$3"
                querys.push(value);
            }
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取点赞数失败' + "articleid=" + id + "&value=" + value);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].goodcount) : 0);
            });
        });
    },

    countGood: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS goodcount FROM article_good WHERE type=1 and articleid=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取点赞数失败' + "articleid=" + id);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].goodcount) : 0);
            });
        });
    },

    countBad: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS goodcount FROM article_good WHERE type=-1 and articleid=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取点赞数失败' + "articleid=" + id);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].goodcount) : 0);
            });
        });
    },

    get: function (userid, articleid, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM article_good WHERE userid=$1 and articleid=$2', [userid, articleid], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取点赞信息错误');
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    insert: function (good, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO article_good(userid, articleid, type) VALUES($1, $2, $3)",
                [good.userid, good.articleid, good.type], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存点赞记录出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    update: function (good, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE article_good SET type=$2 WHERE id=$1",
                [good.id, good.type], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "变更点赞出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("DELETE FROM article_good WHERE id=$1", [id], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "取消点赞出错");
                }
                callback(null, result.rowCount);
            });
        });
    }
};
