var Goods = require('../modules/auction-api/Goods');

Goods.list({
	status: 0
}, {
	page: 1,
	pageSize: 100
}, function (err, goodsList) {
	console.log(err, goodsList);
});
