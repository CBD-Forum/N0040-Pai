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
            client.query('SELECT COUNT(*) AS commentcount FROM article_comment WHERE articleid=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取评论数失败' + "articleid=" + id);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].commentcount) : 0);
            });
        });
    },

    insert: function (comment, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO article_comment(userid, articleid, content) VALUES($1, $2, $3)",
                [comment.userid, comment.articleid, comment.content], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存评论出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("DELETE FROM article_comment WHERE id=$1", [id], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "删除评论出错");
                }
                callback(null, result.rowCount);
            });
        });
    },

    update: function (comment, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE article_comment SET content=$2, updatetime=current_timestamp WHERE id=$1",
                [comment.id, comment.content], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新评论出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    list: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        querys.push(params.articleid);

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT * FROM article_comment WHERE articleid=$3";

            strSql += "ORDER BY id desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取文章评论失败' + "articleid=" + params.articleid);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    }
};
