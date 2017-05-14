var jingtumUtils = {

    getMemoType: function (memo) {
        return memo.MemoType ? memo.MemoType : memo.memo_type;
    },

    getMemoData: function (memo) {
        return memo.MemoData ? memo.MemoData : memo.memo_data;
    }
};

module.exports = jingtumUtils;