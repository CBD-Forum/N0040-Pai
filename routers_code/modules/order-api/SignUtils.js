var md5 = require('md5');

var SignUtils = {

    signRequest: function (signKey, paramsArrays) {
        var paramKeys = [];
        var data = {};
        for (var i = 0; i < paramsArrays.length; ++i) {
            var param = paramsArrays[i];
            var keys = Object.keys(param);
            for (var j = 0; j < keys.length; ++j) {
                var key = keys[j];
                if (!SignUtils.filter(key)) {
                    continue;
                }
                data[key] = param[key];
                paramKeys.push(key);
            }
        }
        return SignUtils.sign(signKey, paramKeys, data);
    },

    filter: function (key) {
        return !(key == 'sign' || typeof key != 'string');
    },

    signWeixinCallback: function (signKey, callbackParams) {
        var keys = Object.keys(callbackParams);
        var paramsKeys = [];
        var data = {};
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!SignUtils.filter(key)) {
                continue;
            }
            paramsKeys.push(key);
            data[key] = callbackParams[key][0];
        }
        return SignUtils.sign(signKey, paramsKeys, callbackParams);
    },

    sign: function (signKey, paramsKeys, data) {
        paramsKeys.sort();
        paramsKeys.reverse();
        var stringSignTemp = "key=" + signKey;
        for (var j = 0; j < paramsKeys.length; ++j) {
            stringSignTemp = paramsKeys[j] + "=" + data[paramsKeys[j]] + "&" + stringSignTemp;
        }
        return md5(stringSignTemp).toUpperCase();
    },

    randomStr: function (randomFlag, min, max) {
        var seeds = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
            'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
            'W', 'X', 'Y', 'Z'];
        var range = min;
        // 随机产生
        if (randomFlag) {
            range = Math.round(Math.random() * (max - min)) + min;
        }
        var str = "";
        for (var i = 0; i < range; i++) {
            str += seeds[Math.round(Math.random() * (seeds.length - 1))];
        }
        return str;
    }
};
module.exports = SignUtils;