function sendBackDeposit(rs) {
    var winner = rs.counterparty;
    var list = rs.depositlist;
    for (var i = 0; i < list.length; ++i) {
        var ts = list[i];
        console.log(winner, ts.counterparty);
        if (winner != ts.counterparty) {
            ApiRequest.payments(AuctionConfig.coinsAccount, AuctionConfig.coinsSecret, ts.counterparty,
                JSON.parse(ts.memos[0].MemoData).deposit_price, AuctionConfig.coinsCurrency, AuctionConfig.issuer, [
                    {"memo_type": "string", "memo_data": JSON.stringify({trans_type: 'auction_deposit_back'})}
                ], true, function (err, response) {
                    console.log("send back deposit", response, err ? err : '');
                });
        }
    }
}