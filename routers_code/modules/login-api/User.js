var PgPool = require('../common/PgPool');

module.exports = {

    /**
     * 通过用户id获取用户信息
     * @param userId
     * @param callback
     */
    getByUserId: function (userId, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('SELECT * FROM users WHERE id=$1', [userId], function (err, result) {
                done();
                if (err) {
                    throw new Error((err && err.message) || '获取用户信息失败id=' + userId);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        })
    },

    /**
     * 通过地址获取用户信息
     * @param address
     * @param callback
     */
    getByAddress: function (address, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('SELECT * FROM users WHERE address=$1', [address], function (err, result) {
                done();
                if (err) {
                    throw new Error((err && err.message) || '内部错误');
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    /**
     * 通过用户名称获取用户信息
     * @param username
     * @param callback
     */
    getByUsername: function (username, callback) {
        PgPool.connect(function (err, client, done) {
            client.query('SELECT * FROM users WHERE username=$1', [username], function (err, result) {
                done();
                if (err) {
                    throw new Error((err && err.message) || '内部错误');
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    /**
     * 根据平台信息获取用户信息
     * @param userRef
     * @param refUsername
     * @param callback
     */
    getByRefAndRefUsername: function (userRef, refUsername, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM users WHERE userref=$1 AND refusername=$2', [userRef, refUsername], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },
    /**
     * 根据用户名获取用户信息
     * @param username
     * @param callback
     */
    get: function (username, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM users WHERE username=$1', [username], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '内部错误');
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    update: function (user, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE users SET salt=$1, hash=$2, phone=$3, email=$4, " +
                "userref=$5, refusername=$6, address=$7, secret=$8, unionid=$9, " +
                "nickname=$10 WHERE username=$12",
                [user.salt,
                    user.hash,
                    user.phone ? user.phone : '',
                    user.email ?
                        user.email : '',
                    user.userref,
                    user.refusername ? user.refusername : '',
                    user.address,
                    user.secret,
                    user.unionid,
                    user.nickname,
                    user.username],
                function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新用户数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    insert: function (user, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO users(username, salt, hash, phone, email, userref, " +
                "refusername, address, secret, unionid, nickname) " +
                "VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                [user.username,
                    user.salt,
                    user.hash,
                    user.phone ? user.phone : '',
                    user.email ? user.email : '',
                    user.userref,
                    user.refusername ? user.refusername : '',
                    user.address,
                    user.secret,
                    user.unionid,
                    user.nickname
                ], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存用户数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    insertUserFeedback: function (userFeedback, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO user_feedback(userid, feedback) VALUES($1, $2)",
                [userFeedback.userid, userFeedback.feedback], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存用户反馈数据失败");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    /***
     * 达人列表
     * @param params
     * @param pagination
     * @param callback
     */
    getExpertList: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var queryList = [];
        queryList.push(pagination.pageSize);
        queryList.push(offset);
        var flag = params && !!params.keyword;
        if (flag) {
            queryList.push(params.keyword);
        }
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var sql = "SELECT * FROM users WHERE status=1 ";
            if (flag) {
                sql += " and e.realname like '" + params.keyword + "%'";
            }
            sql += " limit $1 offset $2";
            client.query(sql, queryList, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取用户列表失败');
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    },

    /**
     * 查看关注的达人
     * @param params
     * @param pagination
     * @param callback
     */
    listWatchedExperts: function (params, pagination, callback) {
        var offset = ((pagination.page - 1) < 0 ? 0 : pagination.page - 1) * pagination.pageSize;
        var queryList = [];
        queryList.push(pagination.pageSize);
        queryList.push(offset);
        queryList.push(params.userid);
        var flag = params && !!params.keyword;
        if (flag) {
            queryList.push(params.keyword + "%");
        }
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            var sql = "SELECT t1.* FROM users AS t1 JOIN user_follow AS t2 ON t1.id=t2.followerid WHERE t1.status=1 and t1.id=$3";
            if (flag) {
                sql += " and t1.realname like '$4'";
            }
            sql += "ORDER BY t1.realname limit $1 offset $2";
            client.query(sql, queryList, function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取用户列表失败' + "userid=" + params.userid);
                }
                var list = result.rows.length ? result.rows : [];
                callback(null, list);
            });
        });
    }
};
