var ApiRequest = require('../modules/jingtum-api/ApiRequest');
var LotteryRequest = require('../modules/lottery-api/LotteryRequest');

var userdb = require('../models/userdb');
var create_db = require('../modules/jsondb');

userdb.groupdb = create_db('bin/users');

// ApiRequest.createWallet(function(err, wallet){
//     console.log('wallet', wallet);
// });

// ApiRequest.sendGift('jLkGJjvxm3zfUrabfpq7VfnkrXSWtnmDPR', function(err, data){
//     console.log('gift', data);
// });

// ApiRequest.getBalances('jpLpucnjfX7ksggzc9Qw6hMSm1ATKJe3AF', function(err, data){
//     console.log('balance', data);
// });

// ApiRequest.getTransactionList('jpLpucnjfX7ksggzc9Qw6hMSm1ATKJe3AF', function(err, data){
//     console.log('list', data);
// });

userdb.getUser("weijia", function(masterUser){
    console.log(masterUser);

    // LotteryRequest.createWallet(function(err, wallet){
    //     console.log(err, wallet);
    // });

    userdb.getUser('user002', function(user){
        console.log(user);


        // LotteryRequest.lotteryList(masterUser, user, function(err, list){
        //     console.log(list);
        // });
        // LotteryRequest.doLottery(masterUser, user, function(err, data){
        //     console.log(err, data);
        // });
        LotteryRequest.doLucky(masterUser, user, function(err, data){
            console.log(err, data);
        });
    });
});
