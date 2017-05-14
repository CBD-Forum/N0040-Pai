var PgPool = require('../common/PgPool');

module.exports = {

    updateDefaultAddress: function (username, receiverphone, status, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('UPDATE user_address SET status=$1 WHERE username=$2 AND receiverphone!=$3', [status, username, receiverphone], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '修改用户的默认地址失败' + " username=" + username + " receiverphone=" + receiverphone);
                }
                callback(null, result.rows.length ? result.rows : []);
            });
        });
    },

    updateDefaultAddressById: function (username, id, status, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('UPDATE user_address SET status=$1 WHERE username=$2 AND id!=$3', [status, username, id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '修改用户的默认地址失败' + " username=" + username + " id=" + id);
                }
                callback(null, result.rowCount);
            });
        });
    },

    countByFollowerId: function (username, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT COUNT(*) AS addresscount FROM user_address WHERE username=$1', [username], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取用户的地址失败' + "username=" + username);
                }
                callback(null, result.rows.length ? parseInt(result.rows[0].addresscount) : 0);
            });
        });
    },

    /**
     * @param username
     * @param callback
     */
    list: function (username, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_address WHERE username=$1', [username], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取用户的地址失败' + "username=" + username);
                }
                callback(null, result.rows.length ? result.rows : []);
            });
        });
    },

    get: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            if (err) {
                return callback(err);
            }
            client.query('SELECT * FROM user_address WHERE id=$1', [id], function (err, result) {
                done();
                if (err) {
                    throw new Error(err.message || '获取地址错误' + "id=" + id);
                }
                callback(null, result.rows.length ? result.rows[0] : null);
            });
        });
    },

    update: function (address, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("UPDATE user_address SET receivername=$1, receiverphone=$2, provincecode=$3, provincename=$4, citycode=$5, cityname=$6, districtcode=$7, districtname=$8, detailaddress=$9, status=$10 WHERE id=$11",
                [address.receivername, address.receiverphone, address.provincecode, address.provincename, address.citycode, address.cityname, address.districtcode, address.districtname, address.detailaddress, address.status, address.id], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "更新地址数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    insert: function (address, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO user_address(username, receivername, receiverphone, provincecode, provincename, citycode, cityname, districtcode, districtname, detailaddress, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                [address.username, address.receivername, address.receiverphone, address.provincecode, address.provincename, address.citycode, address.cityname, address.districtcode, address.districtname, address.detailaddress, address.status], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存地址数据出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    },

    delete: function (id, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("DELETE FROM user_address WHERE id=$1", [id], function (err, result) {
                done();
                if (err || result.rowCount < 1) {
                    throw new Error(err.message || "删除地址数据出错");
                }
                callback(null, result.rowCount);
            });
        });
    }
};