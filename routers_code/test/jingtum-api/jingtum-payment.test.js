var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.payments("jG4oHTKopzG1JXjCRd23HdXvXBAAvCSSjr", "sn5bGPAExY7H4xaDn2PJzoUbzpcbz",
    "jQakbXhzvycSUt4jKzw6Dkw76pdRDqUPxd", "1100.01", '8200000005000020170006000000000020000001', 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS',
    [], true, function (err, data) {
        console.log(data);
    });