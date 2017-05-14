var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.getTransactionList({
    address: "jwG2tTpXDNYSJXVJBJGeG7MZxHkCmozFUx",
    results_per_page: 50,
    page: 1
}, function (err, data) {
    console.log(data);
    for (var i = 0; i < data.length; ++i) {
        var memos = data[i].memos;
        console.log(data[i].counterparty, memos);
    }
});