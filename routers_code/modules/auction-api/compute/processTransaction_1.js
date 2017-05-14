function processTransaction(result, ts) {
    var memoData = JSON.parse(ts.memos[0].MemoData);
    if (result.maxbidindex < memoData.bid_index) {//最大的出价轮次
        result.maxbidindex = memoData.bid_index;
        result.mbuindex = memoData.bid_user_index;
        result.counterparty = ts.counterparty;
        result.cplist = [ts.counterparty];
    } else if (result.maxbidindex == memoData.bid_index) {
        if (result.mbuindex > memoData.bid_user_index) {
            result.mbuindex = memoData.bid_user_index;
            result.counterparty = ts.counterparty;
        }
        result.cplist.push(ts.counterparty);
    }
}