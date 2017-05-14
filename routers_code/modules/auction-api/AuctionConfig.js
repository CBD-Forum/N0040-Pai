/**
 * Created by weijia on 16-11-20.
 */
var globalConfig = require('config');

var config = {
    auctionTransType: globalConfig.get("auction.auctionTransType"),
    transType: globalConfig.get("auction.transType"),
    computeScriptDirectory: globalConfig.get("auction.computeScriptDirectory"),
    computeScriptTransType: globalConfig.get("auction.computeScriptTransType"),
    bidTransType: globalConfig.get("auction.bidTransType"),
    issuer: globalConfig.get("auction.issuer"),
    coinsAccount: globalConfig.get("auction.coinsAccount"),
    coinsSecret: globalConfig.get("auction.coinsSecret"),
    coinsCurrency: globalConfig.get("auction.coinsCurrency"),
    depositTransType: globalConfig.get("auction.depositTransType"),
    goodsPassword: globalConfig.get("auction.goodsPassword"),//拍卖商品的默认密码
    goodsAssistAccountName: globalConfig.get("auction.goodsAssistAccountName"),//拍卖辅助帐号
    goodsAssistAccountPassword: globalConfig.get("auction.goodsAssistAccountPassword"),//拍卖辅助帐号密码
    goodsAssistAccountPhone: globalConfig.get("auction.goodsAssistAccountPhone"),
    goodsAssistAccountEmail: globalConfig.get("auction.goodsAssistAccountEmail"),
    goodsAuctionInitAmount: globalConfig.get("auction.goodsAuctionInitAmount"),//每次商品拍卖初始化的费用
    attendAuctionAmount: globalConfig.get("auction.attendAuctionAmount"),//每次出价的费用
    scheduleJobCron: globalConfig.get("auction.scheduleJobCron"),//定时任务配置信息
    jingtumStatusJobCron: globalConfig.get("auction.jingtumStatusJobCron"),//监控井通api状态的定时任务配置信息
    debug: globalConfig.get("auction.debug"),
    lockedExpires: globalConfig.get("auction.lockedExpires")
};

module.exports = config;