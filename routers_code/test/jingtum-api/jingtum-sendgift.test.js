var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

var sourceAddress = 'jpLpucnjfX7ksggzc9Qw6hMSm1ATKJe3AF';
var sourceSecret = 'sha4eGoQujTi9SsRSxGN5PamV3YQ4';
var amount = '30';
var destAddress = 'jG4oHTKopzG1JXjCRd23HdXvXBAAvCSSjr';
console.log('send gift to', destAddress);
ApiRequest.payments(sourceAddress, sourceSecret, destAddress, amount, 'SWT', '', [], true, function (err, result) {
    console.log(err, result);
});
