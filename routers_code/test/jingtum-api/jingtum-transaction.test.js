var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.getTransaction({
    address: "jhYJvaHyb83ue6v3tzfSHAtiYNV2QPiWMd",
    id: "1dca5280-bfc5-11e6-a818-abdeab02e44e"
}, function (err, data) {
    console.log(data);
});