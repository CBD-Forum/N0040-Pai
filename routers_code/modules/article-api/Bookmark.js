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
            client.query('SELECT COUNT(*) AS readcount FROM bookmark WHERE articleid=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取收藏数失败' + "articleid=" + id);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].readcount) : 0);
            });
        });
    },

    /***
     * 文章列表
     * @param pagination
     * @param callback
     */
    listBookmarks: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var querys = [];
        querys.push(pagination.pageSize);
        querys.push(offset);
        querys.push(params.username)

        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var strSql = "SELECT a.*, r.createtime as readtime FROM article a JOIN bookmark b ON a.id=b.articleid WHERE a.status<>-1 and b.username=$3";
            if (!!params && !!params.keyword){
                strSql += " and (a.title like '%" + params.keyword + "%' ";
            }

            strSql += "ORDER BY b.createtime desc limit $1 offset $2";
            client.query(strSql, querys, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取收藏文章列表失败' + "username=" + params.username);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    insert: function (bookmark, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO bookmark(userid, articleid) VALUES($1, $2)",
                [bookmark.userid, bookmark.articleid], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存阅读记录出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("DELETE FROM bookmark WHERE id=$1", [id], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "取消收藏出错");
                }
                callback(null, result.rowCount);
            });
        });
    }
};
