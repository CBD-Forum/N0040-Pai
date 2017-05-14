/**
 * Created by weijia on 16-11-20.
 */
var ApiRequest = require('../jingtum-api/ApiRequest');
var Async = require('async');

var Address = require('./Address');

var AddressConfig = require('./AddressConfig');
var ApplicationError = require('../error/ApplicationError');

var addressRequest = {

    init: function () {
        //todo 添加初始化
    },

    addAddress: function (req, callback) {
        var newAddress = {
            username: req.session.user.name,
            receivername: req.body.receivername,
            receiverphone: req.body.receiverphone,
            provincecode: req.body.provincecode,
            provincename: req.body.provincename,
            citycode: req.body.citycode,
            cityname: req.body.cityname,
            districtcode: req.body.districtcode,
            districtname: req.body.districtname,
            detailaddress: req.body.detailaddress,
            status: req.body.status ? parseInt(req.body.status) : 0
        };
        addressRequest.validateAddress(newAddress, function (err, newAddress) {
            if (err) {
                return callback(err);
            }
            Async.waterfall([
                function (callback) {
                    Address.countByFollowerId(newAddress.username, function (err, result) {
                        if (AddressConfig.defaultAddressCount <= result) {
                            return callback(new ApplicationError("创建的地址个数达到上线" + AddressConfig.defaultAddressCount, 400, 2));
                        }
                        callback(null, newAddress);
                    });
                },
                function (newAddress, callback) {
                    Address.insert(newAddress, function (err, effects) {
                        if (err) {
                            return callback(new ApplicationError(err.message || err, 500, 3));
                        }
                        callback(null, newAddress);
                    });
                }
            ], function (err, newAddress) {
                if (err) {
                    return callback(err);
                }
                if (newAddress.status) {//修改其他的地址为非默认值
                    return Address.updateDefaultAddress(newAddress.username, newAddress.receiverphone, 0, function (err, effects) {
                        if (!err) {
                            console.log("update default address", newAddress, "effects", effects);
                        }
                        callback(err, newAddress);
                    });
                }
                callback(null, newAddress);
            });
        });
    },

    deleteAddress: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Address.delete(params.id, function (err, effects) {
            if (err) {
                return callback(err.message || err, 500, 2);
            }
            callback(null, effects);
        });
    },

    validateAddress: function (newAddress, callback) {
        if (!newAddress.receivername || !newAddress.receiverphone || !newAddress.provincecode || !newAddress.provincename
            || !newAddress.citycode || !newAddress.cityname || !newAddress.districtcode || !newAddress.districtname || !newAddress.detailaddress) {
            return callback(new ApplicationError("参数不合法", 400, 1))
        }
        callback(null, newAddress);
    },

    updateAddress: function (req, callback) {
        var newAddress = {
            id: parseInt(req.body.id),
            username: req.session.user.name,
            receivername: req.body.receivername,
            receiverphone: req.body.receiverphone,
            provincecode: req.body.provincecode,
            provincename: req.body.provincename,
            citycode: req.body.citycode,
            cityname: req.body.cityname,
            districtcode: req.body.districtcode,
            districtname: req.body.districtname,
            detailaddress: req.body.detailaddress,
            status: req.body.status ? parseInt(req.body.status) : 0
        };
        if (!newAddress.id) {
            return callback(new ApplicationError("参数不合法", 400, 1));
        }
        addressRequest.validateAddress(newAddress, function (err, newAddress) {
            if (err) {
                return callback(err);
            }
            Async.waterfall([
                function (callback) {
                    Address.update(newAddress, function (err, effects) {
                        if (err) {
                            return callback(new ApplicationError(err.message || err, 500, 2));
                        }
                        console.log("update address", newAddress.id, "effects", effects);
                        callback(null, newAddress);
                    });
                }
            ], function (err, newAddress) {
                if (err) {
                    return callback(err);
                }
                if (newAddress.status) {//修改其他的地址为非默认值
                    return Address.updateDefaultAddressById(newAddress.username, newAddress.id, 0, function (err, effects) {
                        if (!err) {
                            console.log("update default address", newAddress.id, "effects", effects);
                        }
                        callback(err, newAddress);
                    });
                }
                callback(null, newAddress);
            });
        });
    },

    setDefaultAddress: function (req, callback) {
        Async.waterfall([
            function (callback) {
                addressRequest.getAddress(req, function (err, address) {
                    if (address.status) {
                        return callback(null, address);
                    }
                    address.status = 1;
                    callback(null, address);
                });
            },
            function (address, callback) {
                Address.update(address, function (err, effects) {
                    if (err) {
                        return callback(new ApplicationError(err.message || err, 500, 2));
                    }
                    console.log("set default address", address.id, "effects", effects);
                    callback(null, address);
                });
            }
        ], function (err, address) {
            if (err) {
                return callback(err);
            }
            if (address.status) {//修改其他的地址为非默认值
                return Address.updateDefaultAddressById(address.username, address.id, 0, function (err, effects) {
                    if (!err) {
                        console.log("update default address by id", address.id, "effects", effects);
                    }
                    callback(err, address);
                });
            }
            callback(null, address);
        });
    },

    getAddress: function (req, callback) {
        var params = req.query;
        if (!params || !params.id) {
            return callback(new ApplicationError("缺失参数", 400, 1));
        }
        Address.get(params.id, function (err, address) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 2));
            }
            callback(null, address);
        });
    },

    getAddressList: function (req, callback) {
        var username = req.session.user.name;
        Address.list(username, function (err, addressList) {
            if (err) {
                return callback(new ApplicationError(err.message || err, 500, 1));
            }
            return callback(null, addressList);
        });
    }
};

module.exports = addressRequest;