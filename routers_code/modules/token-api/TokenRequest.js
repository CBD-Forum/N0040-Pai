/**
 * Created by weijia on 16-11-20.
 */
var Async = require('async');

var LoginConfig = require('../login-api/LoginConfig');
var ApplicationError = require('../error/ApplicationError');
var RedisClient = require('../common/RedisClient');
var RKG = require('../common/RedisKeyGenerator');

var tokenRequest = {

    init: function () {
        //todo 添加初始化
    },

    updateOrder: function (req, callback) {

    },

    getOrder: function (req, callback) {
        var params = req.query;

    }
};

module.exports = tokenRequest;