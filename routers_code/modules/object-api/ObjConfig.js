/**
 * Created by weijia on 16-11-20.
 */
var globalConfig = require('config');

var config = {
    url: globalConfig.get("objStore.url"),
    root: globalConfig.get("objStore.root")
};

module.exports = config;