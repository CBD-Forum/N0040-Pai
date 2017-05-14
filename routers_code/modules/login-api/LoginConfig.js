/**
 * Created by weijia on 16-11-20.
 */
var globalConfig = require('config');

var config = {
    homePage: globalConfig.get("login.homePage"),//配置首页地址
    transType: globalConfig.get("login.transType"),
    thridPartyDefaultPassword: globalConfig.get("login.thridPartyDefaultPassword"),
    weixinApiUrl: globalConfig.get("login.weixinApiUrl"),
    weixinAppId: globalConfig.get("login.weixinAppId"),
    blockchainWeixinAppId: globalConfig.get("login.blockchainWeixinAppId"),
    blockchainWeixinAppSecret: globalConfig.get("login.blockchainWeixinAppSecret"),
    weixinAppSecret: globalConfig.get("login.weixinAppSecret"),
    weixinGrantType: globalConfig.get("login.weixinGrantType"),
    jingtumApiUrl: globalConfig.get("login.jingtumApiUrl"),
    clientId: globalConfig.get("login.clientId"),
    clientSecret: globalConfig.get("login.clientSecret"),
    grantType: globalConfig.get("login.grantType"),
    smsUrl: 'https://api.netease.im/sms/sendcode.action',
    appKey: '89801220327de6056a40f06d4f8390c7',
    appSecret: '48e0a22224c1',
    templateId: '3044025',
    smsCodeEnabled: false,
    inviteCode: '1MBA3zgFmAZQ27L'
};

module.exports = config;