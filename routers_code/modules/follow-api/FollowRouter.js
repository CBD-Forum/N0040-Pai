/**
 * Created by Administrator on 2017/2/23 0023.
 */
var FollowRequest = require('./FollowRequest');
var Auth = require('../common/SessionAuth');

FollowRequest.init();

module.exports = function (app) {

    /**
     * 关注
     */
    app.post('/v1/follow', Auth.authorize, function (req, res, next) {
        FollowRequest.addFollow(req, function (err, expert) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expert
                });
            }
        });
    });

    /**
     * 取消关注
     */
    app.delete('/v1/follow', Auth.authorize, function (req, res, next) {
        FollowRequest.cancelFollow(req, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: result
                });
            }
        });
    });

    /**
     * 查看关注数
     */
    app.get('/v1/follow/count', Auth.authorize, function (req, res, next) {
        FollowRequest.getFollowCount(req, function (err, expert) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: expert
                });
            }
        });
    });

    /**
     * 查看粉丝数
     */
    app.get('/v1/fans/count', Auth.authorize, function (req, res, next) {
        FollowRequest.getFansCount(req, function (err, count) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: count
                });
            }
        });
    });
};