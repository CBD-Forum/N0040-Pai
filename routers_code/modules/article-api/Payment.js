/**
 * Created by Zhuli on 2017/3/14 0025.
 */
var PgPool = require('../common/PgPool');

module.exports = {

    insert: function (payment, callback) {
        PgPool.connect(function (err, client, done) {
            client.query("INSERT INTO payment_order(targetid, typeid, userid) VALUES($1, $2, $3)",
                [payment.targetid, payment.typeid, payment.userid], function (err, result) {
                    done();
                    if (err || result.rowCount < 1) {
                        throw new Error(err.message || "保存支付信息出错");
                    }
                    callback(null, result.rowCount);
                });
        });
    }
};
