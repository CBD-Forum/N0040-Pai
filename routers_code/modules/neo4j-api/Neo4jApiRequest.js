var Neo4j = require('../common/Neo4j');

var neo4jApiRequest = {

    /**
     * 添加节点到图形数据库
     * @param address
     * @param data
     * @param callback
     */
    createWallet: function (address, data, callback) {
        var session = Neo4j.session();
        session
            .run("CREATE (wallet:Wallet {address: {address}, timestamp: {timestamp}, data: {data}})", {
                address: address,
                timestamp: Date.now(),
                data: JSON.stringify(data)
            })
            .then(function () {
                session.close();
                callback(null, address);
            })
            .catch(function (err) {
                callback(err);
            });
    },

    /**
     * 支付操作
     * @param sourceAddress
     * @param destAddress
     * @param amount
     * @param currency
     * @param issuer
     * @param memos
     * @param callback
     */
    payments: function (sourceAddress, destAddress, amount, currency, issuer, memos, callback) {
        var session = Neo4j.session();
        session
            .run("MATCH (source:Wallet), (dest:Wallet) WHERE source.address = {sourceAddress} AND dest.address = {destAddress} CREATE (source)-[payments:PAYMENTS{currency: {currency}, amount: {amount}, issuer: {issuer}, memos: {memos}, timestamp: {timestamp}}]->(dest)",
                {
                    sourceAddress: sourceAddress,
                    destAddress: destAddress,
                    currency: currency,
                    amount: amount,
                    issuer: issuer,
                    memos: JSON.stringify(memos),
                    timestamp: Date.now()
                })
            .then(function () {
                session.close();
                callback(null, null);
            })
            .catch(function (err) {
                callback(err);
            });
    },

    /**
     * 获取记录
     * @param options
     * @param callback
     */
    getTransactionList: function (options, callback) {
        var address = options.address;
        var pagination = options.pagination ? options.pagination : {page: 1, pageSize: 20};
        var session = Neo4j.session();
        var params = {
            address: address,
            offset: (pagination.page - 1) * pagination.pageSize,
            pageSize: pagination.pageSize
        };
        if (options.sourceAddress) {
            params.sourceAddress = options.sourceAddress;
        }
        session
            .run("MATCH (source)-[payments:PAYMENTS]->(dest) WHERE dest.address = {address} " + (options.sourceAddress ? " AND source.address = {sourceAddress} " : "") +
                "RETURN source, payments.currency, payments.amount, payments.issuer, payments.memos, payments.timestamp, dest SKIP {offset} LIMIT {pageSize}",
                params)
            .then(function (result) {
                session.close();
                var transactionList = [];
                var records = result.records;
                for (var i = 0; i < records.length; ++i) {
                    var record = records[i];
                    transactionList.push({
                        source: record.get("source"),
                        counterparty: record.get("source").properties.address,
                        currency: record.get("payments.currency"),
                        amount: record.get("payments.amount"),
                        issuer: record.get("payments.issuer"),
                        memos: JSON.parse(record.get("payments.memos")),
                        timestamp: record.get("payments.timestamp"),
                        dest: record.get("dest")
                    });
                }
                callback(null, transactionList);
            })
            .catch(function (err) {
                callback(err);
            });
    },

    /**
     * 获取用户出价记录个数
     * @param options
     * @param callback
     */
    getUserBidTimes: function (options, callback) {
        var address = options.address;
        var params = {
            address: address,
            sourceAddress: options.sourceAddress
        };
        var session = Neo4j.session();
        session
            .run("MATCH (source)-[payments:PAYMENTS]->(dest) WHERE dest.address = {address} " +
                " AND source.address = {sourceAddress} RETURN COUNT(DISTINCT payments) AS count", params)
            .then(function (result) {
                session.close();
                callback(null, result.records[0].get("count").toNumber());
            })
            .catch(function (err) {
                callback(err);
            });
    },

    /**
     * 获取参加用户记录个数
     * @param options
     * @param callback
     */
    getAttendUserCount: function (options, callback) {
        var address = options.address;
        var params = {
            address: address
        };
        var session = Neo4j.session();
        session
            .run("MATCH (source)-[payments:PAYMENTS]->(dest) WHERE dest.address = {address} " +
                "RETURN COUNT(DISTINCT source) AS count", params)
            .then(function (result) {
                session.close();
                callback(null, result.records[0].get("count").toNumber());
            })
            .catch(function (err) {
                callback(err);
            });
    }
};

module.exports = neo4jApiRequest;