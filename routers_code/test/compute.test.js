var AuctionRequest = require('../modules/auction-api/AuctionRequest');

// AuctionRequest.test();
AuctionRequest.getGoodsTransactionMemosList({
    code: "jEYcE4nmyz2Dt937zMYR2YvnxLjofRbzfc"
}, function (err, result) {
    console.log(err);
    console.log(result);
});