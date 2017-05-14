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
        url: "https://tapi.jingtum.com",
        version: "/v1",
        wss_url: "wss://tapi.jingtum.com:5443",
        gift_account: "jpLpucnjfX7ksggzc9Qw6hMSm1ATKJe3AF",//激活账号与充值账号
        gift_secret: "sha4eGoQujTi9SsRSxGN5PamV3YQ4",//激活账号与充值账号密钥
        gift_amount: "30",

        market_account: "j33uE7tz2xFkNbfCjn2SaCmwkwZcqf7gQo",
        fgate_account: "jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS",//银关账号
        wd_account: "j3n6art3Qfyk3eLyngPXFiFUVUhxyonanD",//提现账号
        wd_secret: "snBHnRwzEnQLNpwCiKcegZFt2npY3"//提现密钥
    },
    wx_info: {
        notify_url: "http://m.jingtum.com/app/deposit/"
    }
};
