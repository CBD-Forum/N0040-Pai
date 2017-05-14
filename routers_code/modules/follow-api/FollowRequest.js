/**
 * Created by Administrator on 2017/2/23 0023.
 */
var Async = require('async');

var Follow = require('./Follow');
var ApplicationError = require('../error/ApplicationError');

var followRequest = {

    init: function () {

    },

    addFollow: function (req, callback) {
        var newFollow = {
            userid: req.session.user.userid,
            followerid: req.body.followerid
        };
        Async.waterfall([
            function (callback) {
                Follow.insert(newFollow, function (err, effects) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 3));
                    }
                    callback(null, newFollow);
                });
            }
        ], function (err, newFollow) {
            if (err) {
                return callback(err);
            }
            callback(null, newFollow);
        });
    },

    cancelFollow: function (req, callback) {
        var params = req.query;
        if (!params) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        var followerId = req.session.user.id;
        var userId = params.userid;
        Follow.delete(userId, followerId, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    get: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Follow.get(params.id, function (err, expert) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, expert);
        });
    },
    getFollowCount: function (req, callback) {
        Follow.countByFollowerId(req.session.user.id, function (err, count) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, count);
        });
    },
    getFansCount: function (req, callback) {
        Follow.countByUserId(req.session.user.id, function (err, count) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, count);
        });
    }
};

module.exports = followRequest;