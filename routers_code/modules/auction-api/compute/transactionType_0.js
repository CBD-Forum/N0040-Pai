function transactionType(item) {
    if (!item || !item.memos || item.memos.length < 1 || item.type != 'received') {
        return null;
    }
    var memo = item.memos[0];
    if (memo.MemoType != 'string') {
        return null;
    }
    return JSON.parse(memo.MemoData).trans_type;
}