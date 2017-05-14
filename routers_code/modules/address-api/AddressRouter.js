var AddressRequest = require('./AddressRequest');
var Auth = require('../common/SessionAuth');

AddressRequest.init();

module.exports = function (app) {

    /**
     * 新增地址
     */
    app.post('/v1/address', Auth.authorize, function (req, res, next) {
        AddressRequest.addAddress(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 删除地址
     */
    app.delete('/v1/address', Auth.authorize, function (req, res, next) {
        AddressRequest.deleteAddress(req, function (err, result) {
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
     * 修改地址信息
     */
    app.put('/v1/address', Auth.authorize, function (req, res, next) {
        AddressRequest.updateAddress(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 设置默认地址
     */
    app.put('/v1/default-address', Auth.authorize, function (req, res, next) {
        AddressRequest.setDefaultAddress(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 查看地址
     */
    app.get('/v1/address', Auth.authorize, function (req, res, next) {
        AddressRequest.getAddress(req, function (err, address) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: address
                });
            }
        });
    });

    /**
     * 获取地址列表
     */
    app.get('/v1/addresses', Auth.authorize, function (req, res, next) {
        AddressRequest.getAddressList(req, function (err, addressList) {
            if (err) {
                next(err);
            } else {
                res.send({
                    code: 0,
                    data: addressList
                });
            }
        });
    });
};