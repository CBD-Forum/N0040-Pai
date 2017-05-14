function computeResult(rs, transactions) {
    if (!transactions) {
        return;
    }
    for (var i = 0; i < transactions.length; ++i) {
        var ts = transactions[i];
        var type = transactionType(ts);
        if (type == 'do_auction') {
            processTransaction(rs, ts);
        }
        if (type == 'auction_deposit') {
            rs.depositlist.push(ts);
        }
    }
    return rs;
}