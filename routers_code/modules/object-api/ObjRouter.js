var ObjRequest = require('./ObjRequest');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

ObjRequest.init();

module.exports = function (app) {

    /**
     * 上传对象
     */
    app.post('/v1/obj-store', upload.single('file'), function(req, res, next){
        ObjRequest.saveObj(req, res, next);
    });

    /**
     * 下载对象信息
     */
    app.get('/v1/obj-store', function(req, res){
        ObjRequest.getObj(req, res);
    });

    /**
     * 删除对象信息
     */
    app.delete('/v1/obj-store', function(req, res){
        ObjRequest.deleteObj(req, res);
    });
};