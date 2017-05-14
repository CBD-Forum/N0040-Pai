var ApiRequest = require('../../modules/jingtum-api/ApiRequest');

ApiRequest.payments("jhYJvaHyb83ue6v3tzfSHAtiYNV2QPiWMd", "shh2QywGfuQ3vZqaJHSpyf7J558rH", "jpzbdV46WPBHaJHMhk5YKaW87tJniUbZTc", "0.01", 'SWT', '', [], true, function (err, data) {
    console.log(data);
});