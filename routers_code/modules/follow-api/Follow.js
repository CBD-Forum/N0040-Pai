/**
 * Created by Administrator on 2017/2/23 0023.
 */
var PgPool = require('../common/PgPool');

module.exports = {

    countByFollowerId: function (userId, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS followcount FROM user_follow WHERE followerid=$1', [userId], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取关注达人信息失败' + "userId=" + userId);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].followcount) : 0);
            });
        });
    },

    countByUserId: function (userId, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS fancount FROM user_follow WHERE userid=$1', [userId], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取达人粉丝信息失败' + "userid=" + userId);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].fancount) : 0);
            });
        });
    },

    get: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM expert_watch WHERE id=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取关注信息错误' + "id=" + id);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    insert: function (follow, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO user_follow(userid, followerid) VALUES($1, $2)",
                [follow.userid, follow.followerid], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存关注信息出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (userId, followerId, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("DELETE FROM user_follow WHERE userid=$1 and followerid=$2", [userId, followerId], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "删除关注信息出错");
                }
                callback(null, result.rowCount);
            });
        });
    }
};