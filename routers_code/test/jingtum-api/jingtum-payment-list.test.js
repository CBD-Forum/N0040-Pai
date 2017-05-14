var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.getPaymentsList({
    address: "jhYJvaHyb83ue6v3tzfSHAtiYNV2QPiWMd"
}, function (err, data) {
    console.log(data);
});