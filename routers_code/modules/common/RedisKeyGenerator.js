var redisKeyGenerator = {

    generateUserGoodsDeposit: function (userId, goodsId) {
        return "ugd_" + userId + "_" + goodsId;
    },

    generateOrderCodeNumber: function () {
        return "ordercodenumber";
    },

    /**
     * 商品的推送消息队列
     * @param goodsCode
     * @returns {string}
     */
    generateMsgRedisKey: function (goodsCode) {
        return "msgg_" + goodsCode;
    },

    generatePhoneSmsCode: function (phone) {
        return "psc_" + phone;
    },

    generateUserLastAttend: function (goodsCode, username, bidIndex) {
        return "ula_" + goodsCode + "_" + username + "_" + bidIndex;
    },

    generateGoodsNewestIndex: function (goodsCode, bidIndex) {
        return "gni_" + goodsCode + "_" + bidIndex;
    },

    generateGoodsLastIndex: function (goodsCode, bidIndex) {
        return "gli_" + goodsCode + "_" + bidIndex;
    },

    generateAddressKey: function (address) {
        return "ak_" + address;
    },

    generateGoodsBidUserIndexKey: function (goodsCode, bidIndex) {
        return "gbui_" + goodsCode + "_" + bidIndex;
    },

    /**
     * 出价列表缓存key
     * @param goodsCode
     * @returns {string}
     */
    generateAuctionListKey: function (goodsCode) {
        return "alk_" + goodsCode;
    }
};

module.exports = redisKeyGenerator;
