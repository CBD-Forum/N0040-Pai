var SignUtils = require("../modules/order-api/SignUtils");

var data = {
    appid: ['wx59fbe72de7c42d1c'],
    bank_type: ['CFT'],
    cash_fee: ['1'],
    fee_type: ['CNY'],
    is_subscribe: ['Y'],
    mch_id: ['1432950402'],
    nonce_str: ['qkiMWAr3vOqvzcU85WFELvgKV6x6ub8B'],
    openid: ['oor9ywMZNF4xtqathh34l5jQ7gZk'],
    out_trade_no: ['2017061953727'],
    result_code: ['SUCCESS'],
    return_code: ['SUCCESS'],
    sign: ['0F451D94BABA7E0EBCDB6A5A8474F7C2'],
    time_end: ['20170114190604'],
    total_fee: ['1'],
    trade_type: ['NATIVE'],
    transaction_id: ['4005532001201701146315148209']
};

var sign = SignUtils.signWeixinCallback("bOU7cqOGmOdaEQTQApjhXXJVeSX5HcoU", data);
console.log(sign);
