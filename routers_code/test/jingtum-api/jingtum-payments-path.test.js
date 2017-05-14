var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.getPaymentsPaths("jpzbdV46WPBHaJHMhk5YKaW87tJniUbZTc", "jhYJvaHyb83ue6v3tzfSHAtiYNV2QPiWMd", "1.00+AAA+jMhLAPaNFo288PNo5HMC37kg6ULjJg8vPf", {}, function (err, data) {
    console.log(err, data);
});