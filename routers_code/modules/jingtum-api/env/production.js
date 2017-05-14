/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
module.exports = {

    /***************************************************************************
     * Set the default database connection for models in the development       *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    api: {
        url: "https://api.jingtum.com",
        version: "/v1",
        wss_url: "wss://api.jingtum.com:5443",
        fgate_account: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",//银关账号
        gift_account: "j9tpK6HiLYKEXA1QkxzHSV14igvbb8XmAh",//激活账号与充值账号
        gift_secret: "sas77Ee2dVhyAnj9dooZsG2mvKLAd",//激活账号与充值账号密钥
        gift_amount: "30",

        market_account: "j33uE7tz2xFkNbfCjn2SaCmwkwZcqf7gQo",
        wd_account: "j3n6art3Qfyk3eLyngPXFiFUVUhxyonanD",//提现账号
        wd_secret: "snBHnRwzEnQLNpwCiKcegZFt2npY3"//提现密钥
    },
    wx_info: {
        notify_url: "http://m.jingtum.com/app/deposit/"
    }
};
