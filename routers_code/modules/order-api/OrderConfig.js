/**
 * Created by weijia on 16-11-20.
 */
var globalConfig = require('config');

var config = {
    appid: "wx59fbe72de7c42d1c",
    appsecret: "99fdcbb5cab5c0f1e67669c4f79f9aa9",
    apikey: "bOU7cqOGmOdaEQTQApjhXXJVeSX5HcoU",
    mch_id: "1432950402",
    weixinUrl: "https://api.mch.weixin.qq.com/",
    scheduleJobCron: "*/10 * * * *",
    expires: 2,//订单过期时间(小时)
    globalIp: "120.24.221.115"
};

module.exports = config;