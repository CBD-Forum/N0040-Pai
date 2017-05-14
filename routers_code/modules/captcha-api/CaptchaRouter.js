var Canvas = require('canvas');

var globalParams = {
    "color": "rgb(0,100,100)",// can be omitted, default 'rgb(0,100,100)'
    "background": "rgb(255,200,150)",// can be omitted, default 'rgb(255,200,150)'
    "lineWidth": 3, // can be omitted, default 8
    "fontSize": 60, // can be omitted, default 80
    "codeLength": 4, // length of code, can be omitted, default 6
    "lineNumber": 2, // length of code, can be omitted, default 6
    "canvasWidth": 250,// can be omitted, default 250
    "canvasHeight": 150// can be omitted, default 150
};

module.exports = function (app) {

    /**
     * 获取captcha
     */
    app.get('/v1/captcha.jpg', function (req, res, next) {
        var params = {};
        var params1 = req.query;
        if (params1 == null) {
            params = globalParams;
        } else {
            params.color = globalParams.color;
            if (params1.color) {
                params.color = params1.color;
            }
            params.background = globalParams.background;
            if (params1.background) {
                params.background = params1.background;
            }
            params.codeLength = globalParams.codeLength;
            if (params1.codelength) {
                params.codeLength = parseInt(params1.codelength);
            }
            params.lineWidth = globalParams.lineWidth;
            if (params1.linewidth) {
                params.lineWidth = parseInt(params1.linewidth);
            }
            params.lineNumber = globalParams.lineNumber;
            if (params1.linenumber) {
                params.lineNumber = parseInt(params1.linenumber);
            }
            params.canvasWidth = globalParams.canvasWidth;
            if (params1.canvaswidth) {
                params.canvasWidth = parseInt(params1.canvaswidth);
            }
            params.canvasHeight = globalParams.canvasHeight;
            if (params1.canvasheight) {
                params.canvasHeight = parseInt(params1.canvasheight);
            }
            params.fontSize = globalParams.fontSize;
            if (params1.fontsize) {
                params.fontSize = parseInt(params1.fontsize);
            }
        }

        var canvas = new Canvas(params.canvasWidth, params.canvasHeight);
        var ctx = canvas.getContext('2d');
        ctx.antialias = 'gray';
        ctx.fillStyle = params.background;
        ctx.fillRect(0, 0, params.canvasWidth, params.canvasHeight);
        ctx.fillStyle = params.color;
        ctx.lineWidth = params.lineWidth;
        ctx.strokeStyle = params.color;
        ctx.font = params.fontSize + 'px sans';

        for (var i = 0; i < 2; i++) {
            ctx.moveTo(Math.floor(0.08*params.canvasWidth), Math.random() * params.canvasHeight);
            ctx.bezierCurveTo(Math.floor(0.32*params.canvasWidth), Math.random() * params.canvasHeight, Math.floor(1.07*params.canvasHeight), Math.random() * params.canvasHeight, Math.floor(0.92*params.canvasWidth), Math.random() * params.canvasHeight);
            ctx.stroke();
        }

        var text = ('' + Math.random()).substr(3, params.codeLength);

        for (i = 0; i < text.length; i++) {
            ctx.setTransform(Math.random() * 0.5 + 1, Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.5 + 1, Math.floor(0.375*params.fontSize) * i + Math.floor(0.25*params.fontSize), Math.floor(1.25*params.fontSize));
            ctx.fillText(text.charAt(i), 0, 0);
        }

        canvas.toBuffer(function (err, buf) {
            if (req.session) {
                req.session.captcha = text;
            }
            res.type('jpg');
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.header('Expires', 'Sun, 12 Jan 1986 12:00:00 GMT');
            res.end(buf);
        });
    });
};
