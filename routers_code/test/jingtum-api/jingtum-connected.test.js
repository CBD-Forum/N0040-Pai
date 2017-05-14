var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.connected(function (err, data) {
    console.log(data);
});