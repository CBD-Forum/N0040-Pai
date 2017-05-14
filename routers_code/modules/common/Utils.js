/**
 * Append querystring to a url
 */
var utils = {
    queryAppend: function (url, options) {
        if (!options) {
            return url;
        }
        var first = true;
        var _url = url;
        for (var p in options) {
            _url += (first ? '?' : '&') + p + '=' + options[p];
            first = false;
        }
        return _url;
    }
};

module.exports = utils;