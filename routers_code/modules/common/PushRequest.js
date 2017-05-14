const request = require('request');

var globalConfig = require('config');

var pushRequest = {

    /**
     * 推送给某个用户
     * @param userId
     * @param message
     * @param callback
     */
    pushUserid: function (userId, message, callback) {
        var options = {
            method: 'POST',
            url: globalConfig.get("push.url") + "push?uid=" + userId,
            headers: {'Connection': 'close'},
            body: message
        };
        request(options, function (err, res, data) {
            callback(err, data);
        });
    },

    /**
     * 推送房间
     * @param roomId
     * @param message
     * @param callback
     */
    pushRoom: function (roomId, message, callback) {
        var options = {
            method: 'POST',
            url: globalConfig.get("push.url") + "push/room?rid=" + roomId,
            headers: {'Connection': 'close'},
            body: message
        };
        request(options, function (err, res, data) {
            callback(err, data);
        });
    }
};

module.exports = pushRequest;