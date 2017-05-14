var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.getBalances("jpzbdV46WPBHaJHMhk5YKaW87tJniUbZTc", function (err, data) {
    console.log("1", data);
});

ApiRequest.getBalances("jG4oHTKopzG1JXjCRd23HdXvXBAAvCSSjr", function (err, data) {
    console.log("2", data);
});

ApiRequest.getBalances("j4xWrvN4pwdejhabYrXzE8Z7cfEZXUrB36", function (err, data) {
    console.error(err);
    console.log("3", data);
});

ApiRequest.getBalances("jL4n8uQAJ7ZKnvkZjWFAjpz6wm2DnK3CzC", function (err, data) {
    console.error(err);
    console.log("4", data);
});