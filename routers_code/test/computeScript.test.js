function filterTransaction(item) {
    if (!item || item.memos.length < 1 || item.type != 'received') {
        return false;
    }
    var memo = item.memos[0];
    if (memo.MemoType != 'string') {
        return false;
    }
    return JSON.parse(memo.MemoData).trans_type == AuctionConfig.transType;
}

function computeResult(result, transactions) {
    if (!transactions) return;
    for (var i = 0; i < transactions.length; ++i) {
        var transaction = transactions[i];
        if (!filterTransaction(transaction)) {
            continue;
        }
        var memoData = JSON.parse(transaction.memos[0].MemoData);
        if (result.maxBidIndex < memoData.bid_index) {//最大的出价轮次
            result.maxBidIndex = memoData.bid_index;
            result.maxBidUserIndex = memoData.bid_user_index;
            result.counterparty = transaction.counterparty;
            result.counterPartyList = [transaction.counterparty];
        } else if (result.maxBidIndex == memoData.bid_index) {
            if (result.maxBidUserIndex > memoData.bid_user_index) {
                result.maxBidUserIndex = memoData.bid_user_index;
                result.counterparty = transaction.counterparty;
            }
            result.counterPartyList.push(transaction.counterparty);
        }
    }
    return result;
}

function processResult(result, callback) {
    var goods = result.goods;
    if ((goods.starttime + goods.totalauction) * 1000 < Date.now()) {
        if (result.counterparty){
            ApiRequest.payments(goods.address, goods.secret, result.counterparty, AuctionConfig.attendAuctionAmount, [
                {
                    "memo_type": "string", "memo_data": JSON.stringify({
                    trans_type: AuctionConfig.bidTransType,
                    bid_index: result.maxBidIndex,
                    bid_user_index: result.maxBidUserIndex
                })
                }
            ], true, function (err, response) {
                if (err) {
                    result.response = response;
                }
                callback(err, result);
            });
        } else {
            callback(new Error("counterparty is null"), result);
        }
    } else {
        callback(new Error("auction not ended"), result);
    }
}
var ApiRequest = require('../modules/jingtum-api/ApiRequest');
var AuctionConfig = require('../modules/auction-api/AuctionConfig');
var goods = JSON.parse('{"name":"紫砂壶12122","code":"zsh12122","images":["1285997748.jpg"],"description":"这是一个历史悠久的紫砂壶, 现在拍卖.","starttime":1481566797,"baseprice":150,"fixincprice":5,"bidinterval":120,"totalauction":300,"marketvalue":259,"auctionValue":151,"createtime":1481566807632,"salt":"pH4NTm1PuqKn3yx2Im9MccedF628xI8/KtJkX2H0knLBRE6nkGaVXvlDATcetZk2J4cInbB2kGhvRXMRHB3ZOdg+gyaeGyMEM7hwSj4l2sGKJy64K2r5HKJEGWwSuNZ4Q9AtuJmX6O48lC9agmAdR8YZfznzGwnlLnVYw94qOn0=","hash":"u47/YUVbCv+hcrYDp2NooEiovaavRgVQ1C3BjXnQcJGXRwQ0uUvdW49SJwcs5k50q2N8NUREIXHnD81OhB95HrYrlIHxyl5gkhPgrSxvspMpE4k3dpNCPEoXTy2IFcmcwLONK31771BmI+1tQKfoygB3ausp6ugKL1wP3uhxIOE=","wallet":{"address":"jECyehvAZgryQCbFoDfDBjtJN1R5We354v","secret":"sprgPyzACScfNCUcDSfDHzq5cu72F"},"bidindex":1}');
var memoData = {};
var callback = function () {

};

//最后的结果
var result = {
    memoData: memoData,
    goods: goods,
    callback: callback,
    maxBidIndex: 0,//记录最大的轮次
    maxBidUserIndex: 1000000,//记录某个轮次最小的序号
    counterparty: null,
    counterPartyList: []
};

var params = {
    address: goods.wallet.address,
    results_per_page: 20,
    page: 1
};

var selfCallback = function (err, data) {
    if (!data) {
        processResult(result, result.callback);
        return;
    }
    result = computeResult(result, data);

    //继续查询下一个分页信息
    params.page = params.page + 1;
    ApiRequest.getTransactionList(params, function (err, data) {
        selfCallback(err, data);
    });
};
ApiRequest.getTransactionList(params, function (err, data) {
    selfCallback(err, data);
});