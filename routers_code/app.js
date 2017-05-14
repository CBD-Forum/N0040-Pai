/**
 * Created by heipacker on 2016/11/29.
 */
'use strict';
process.env.TZ = 'Asia/Shanghai';

var path = require('path');
var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var xmlParser = require('express-xml-bodyparser');
var expressSession = require('express-session');
var RedisClient = require('./modules/common/RedisClient');
var RedisStore = require('connect-redis')(expressSession);

var globalConfig = require('config');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon());
app.use(logger());//default, short, dev
app.use(express.query());
app.use(bodyParser.json());
app.use(xmlParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('express-domain-middleware'));
/*
var captcha = require('captcha');
app.use(captcha({
    "url": '/v1/captcha.jpg',
    "lineWidth": 4,
    "codeLength": 4,
    "color": '#0064cd',
    "background": 'rgb(20,30,200)'
})); // captcha params
*/

var config = {
    session_secret: globalConfig.get("session.secret")
};
app.use(expressSession({
    store: new RedisStore({
        prefix: "auction_",
        client: RedisClient,
        host: globalConfig.get("redis.host"),
        port: globalConfig.get("redis.port"),
        logErrors: true
    }),
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false, maxAge: 1000 * 60 * 60 * 24 * 365}
}));
app.use(express.static(path.join(__dirname, 'public')));
var ipv4 = require('express-ipv4');
app.use(ipv4());

var routes = require('./routes');
routes(app);

app.use(function (err, req, res, next) {
    console.error(process.domain ? process.domain.id : "", req.ip, req.method, req.originalUrl, err);
    res.status(err.status || err.code || 500).send({
        code: err.code || err.status || 500,
        msg: err.message
    }).end();
});

module.exports = app;
