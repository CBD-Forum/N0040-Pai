function processResult(result, callback) {
    var goods = result.goods;
    if (result.counterparty && !goods.counterparty) {
        sendBackDeposit(result);
        ApiRequest.payments(goods.address, goods.secret, result.counterparty,
            AuctionConfig.attendAuctionAmount, 'SWT', '', [
                {
                    "memo_type": "string", "memo_data": JSON.stringify({
                    trans_type: 'auction_bid',
                    bid_index: result.maxbidindex,
                    bid_user_index: result.mbuindex
                })
                }
            ], true, function (err, response) {
                if (err) {
                    result.response = response;
                }
                callback(err, result);
            });
    } else {
        callback(null, result);
    }
}