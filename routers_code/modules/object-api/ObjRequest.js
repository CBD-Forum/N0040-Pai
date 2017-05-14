/**
 * Created by weijia on 16-11-20.
 */
var fs = require("fs");
var ObjConfig = require('./ObjConfig');

var objRequest = {

    init: function () {
        //todo 添加初始化
    },

    /**
     * 存储资源
     * @param req
     * @param res
     */
    saveObj: function (req, res, next) {
        var id = req.body.fileName;
        var fileName = ObjConfig.root + '/data/images/' + id;

        fs.writeFile(fileName, req.file.buffer, function (err) {
            if (err) {
                res.send({
                    code: 1,
                    msg: err.message
                });
            } else {
                console.log(fileName + " saved success.");
                res.send({
                    code: 0,
                    data: id
                })
            }
        });
    },

    /**
     * 获取资源
     * @param req
     * @param res
     */
    getObj: function (req, res) {
        var id = req.param("id");
        var fileName = ObjConfig.root + '/data/images/' + id;

        fs.access(fileName, (fs.constants || fs).F_OK, function (err) {
            if (err) {
                console.log(fileName + " not exists.");
                res.status(500).send({
                    code: 1,
                    msg: "file not exists"
                });
            } else {
                res.sendfile(fileName);
            }
        });
    },

    /**
     * 删除资源
     * @param req
     * @param res
     */
    deleteObj: function (req, res) {
        var id = req.param("id");
        this.deleteObjInternal(id, function (err) {
            if (err) {
                res.send({
                    code: 1,
                    msg: "file not exists"
                });
            } else {
                res.send({
                    code: 0,
                    msg: "success"
                });
            }
        });
    },
    deleteObjInternal: function (id, callback) {
        var fileName = ObjConfig.root + '/data/images/' + id;

        fs.access(fileName, (fs.constants || fs).F_OK, function (err) {
            if (err) {
                console.log(fileName + " not exists.");
                callback(err);
            } else {
                fs.truncate(fileName, function () {
                    console.log(fileName + " delete success.")
                    callback(null);
                });
            }
        });
    }
};

module.exports = objRequest;