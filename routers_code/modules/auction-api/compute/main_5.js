var result = {
    memoData: memoData,
    goods: goods,
    callback: callback,
    maxbidindex: 0,
    mbuindex: 1000000,
    depositlist: [],
    counterparty: null,
    cplist: []
};

var params = {
    address: goods.address,
    results_per_page: 20,
    page: 1
};
var selfCallback = function (err, data) {
    if (!data || data.length == 0) {
        return processResult(result, result.callback);
    }
    result = computeResult(result, data);
    params.address = goods.address;
    params.page = params.page + 1;
    ApiRequest.getTransactionList(params, function (err, data) {
        selfCallback(err, data);
    });
};
ApiRequest.getTransactionList(params, function (err, data) {
    selfCallback(err, data);
});