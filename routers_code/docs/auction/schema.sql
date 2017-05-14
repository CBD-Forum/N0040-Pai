CREATE DATABASE skywell OWNER skywell;

-- 商品表
CREATE TABLE goods(
    id bigserial primary key NOT NULL,
    goodsname VARCHAR(64) NOT NULL DEFAULT '',
    code VARCHAR(64) NOT NULL DEFAULT '',
    address VARCHAR(64) NOT NULL DEFAULT '',
    secret VARCHAR(64) NOT NULL DEFAULT '',
    description VARCHAR(1024) NOT NULL DEFAULT '',
    starttime int NOT NULL DEFAULT 0,
    baseprice int NOT NULL DEFAULT 0,
    fixincprice int NOT NULL DEFAULT 0,
    bidinterval int NOT NULL DEFAULT 0,
    totalauction int NOT NULL DEFAULT 0,
    marketvalue int NOT NULL DEFAULT 0,
    salt VARCHAR(1024) NOT NULL DEFAULT '',
    hash VARCHAR(1024) NOT NULL DEFAULT '',
    visitcount int NOT NULL DEFAULT 0,
    bidindex int NOT NULL DEFAULT 0,
    status smallint NOT NULL DEFAULT 0,
    deposit decimal(10, 2) NOT NULL DEFAULT 0,
    price decimal(10, 2) NOT NULL DEFAULT 0,
    userid bigint NOT NULL DEFAULT 0,
    locked int NOT NULL DEFAULT 0,
    counterparty VARCHAR(64) NOT NULL DEFAULT '',
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE UNIQUE INDEX uqi_code ON goods(code);

--表说明
COMMENT ON TABLE goods IS '商品表';
--字段说明
COMMENT ON COLUMN goods.id IS '主键ID';
COMMENT ON COLUMN goods.userid IS '用户id';
COMMENT ON COLUMN goods.goodsname IS '商品名称';
COMMENT ON COLUMN goods.code IS '商品代码';
COMMENT ON COLUMN goods.address IS '商品钱包地址';
COMMENT ON COLUMN goods.secret IS '商品钱包密钥';
COMMENT ON COLUMN goods.description IS '描述信息';
COMMENT ON COLUMN goods.starttime IS '开始时间';
COMMENT ON COLUMN goods.baseprice IS '基准价格';
COMMENT ON COLUMN goods.fixincprice IS '固定加价';
COMMENT ON COLUMN goods.bidinterval IS '出价间隔';
COMMENT ON COLUMN goods.totalauction IS '总拍卖时间';
COMMENT ON COLUMN goods.marketvalue IS '市场价';
COMMENT ON COLUMN goods.salt IS '密码盐';
COMMENT ON COLUMN goods.hash IS '密码hash';
COMMENT ON COLUMN goods.visitcount IS '围观人数';
COMMENT ON COLUMN goods.bidindex IS '出价轮次';
COMMENT ON COLUMN goods.status IS '状态';
COMMENT ON COLUMN goods.deposit IS '保证金';
COMMENT ON COLUMN goods.price IS '价格';
COMMENT ON COLUMN goods.locked IS '锁定';
COMMENT ON COLUMN goods.counterparty IS '中标用户地址';
COMMENT ON COLUMN goods.createtime IS '创建时间';

--商品图片表
CREATE TABLE goods_img(
    id bigserial primary key NOT NULL,
    fileName VARCHAR(1024) NOT NULL DEFAULT '',
    goodsid bigint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE INDEX idx_goodsid ON goods_img (goodsid);

--表说明
COMMENT ON TABLE goods_img IS '商品图片表';
--字段说明
COMMENT ON COLUMN goods_img.id IS '主键ID';
COMMENT ON COLUMN goods_img.fileName IS '文件名称';
COMMENT ON COLUMN goods_img.goodsid IS '商品id';
COMMENT ON COLUMN goods_img.createtime IS '创建时间';


--用户表
CREATE TABLE users(
    id bigserial primary key NOT NULL,
    username VARCHAR(64) NOT NULL DEFAULT '',
    salt VARCHAR(1024) NOT NULL DEFAULT '',
    hash VARCHAR(1024) NOT NULL DEFAULT '',
    phone VARCHAR(20) NOT NULL DEFAULT '',
    email VARCHAR(64) NOT NULL DEFAULT '',
    userref smallint NOT NULL DEFAULT 0,
    refusername VARCHAR(64) NOT NULL DEFAULT '',
    address VARCHAR(64) NOT NULL DEFAULT '',
    secret VARCHAR(64) NOT NULL DEFAULT '',
    unionid VARCHAR(36) NOT NULL DEFAULT '',
    nickname VARCHAR(64) NOT NULL DEFAULT '',
    userroleid bigint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE UNIQUE INDEX uqi_unionid ON users(unionid);
CREATE UNIQUE INDEX uqi_username ON users(username);
CREATE UNIQUE INDEX uqi_address ON users(address);
CREATE INDEX idx_userref_refusername ON users (userref, refusername);

--表说明
COMMENT ON TABLE users IS '用户表';
--字段说明
COMMENT ON COLUMN users.id IS '主键ID';
COMMENT ON COLUMN users.username IS '用户名称';
COMMENT ON COLUMN users.salt IS '密码盐';
COMMENT ON COLUMN users.hash IS '密码hash';
COMMENT ON COLUMN users.phone IS '电话号码';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.userref IS '用户来源, 0注册用户, 1井通帐号, 2微信帐号';
COMMENT ON COLUMN users.refusername IS '来源用户名称';
COMMENT ON COLUMN users.address IS '用户钱包地址';
COMMENT ON COLUMN users.secret IS '用户钱包密钥';
COMMENT ON COLUMN users.unionid IS '统一id';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.roleid IS '角色id';
COMMENT ON COLUMN users.createtime IS '创建时间';

--角色表
CREATE TABLE user_role(
    id bigserial primary key NOT NULL,
    rolename VARCHAR(64) NOT NULL DEFAULT '',
    rolecode VARCHAR(64) NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX uqi_rolecode ON user_role(rolecode);
INSERT INTO user_role(rolename, rolecode) VALUES('普通用户', 'user');
INSERT INTO user_role(rolename, rolecode) VALUES('管理员', 'admin');

--表说明
COMMENT ON TABLE user_role IS '角色表';
--字段说明
COMMENT ON COLUMN user_role.id IS '主键ID';
COMMENT ON COLUMN user_role.rolename IS '角色名字';
COMMENT ON COLUMN user_role.rolecode IS '角色code';

-- 2016.12.31
--用户地址表
CREATE TABLE user_address(
    id bigserial primary key NOT NULL,
    username VARCHAR(64) NOT NULL DEFAULT '',
    receivername VARCHAR(64) NOT NULL DEFAULT '',
    receiverphone VARCHAR(64) NOT NULL DEFAULT '',
    provinceCode VARCHAR(64)  NOT NULL DEFAULT '',
    provinceName VARCHAR(64)  NOT NULL DEFAULT '',
    cityCode VARCHAR(64) NOT NULL DEFAULT '',
    cityName VARCHAR(64) NOT NULL DEFAULT '',
    districtCode VARCHAR(64) NOT NULL DEFAULT '',
    districtName VARCHAR(64) NOT NULL DEFAULT '',
    detailaddress VARCHAR(256) NOT NULL DEFAULT '',
    status smallint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE UNIQUE INDEX uqi_username_detailaddress ON user_address(username, detailaddress);

--表说明
COMMENT ON TABLE user_address IS '用户地址表';
--字段说明
COMMENT ON COLUMN user_address.id IS '主键ID';
COMMENT ON COLUMN user_address.username IS '用户名称';
COMMENT ON COLUMN user_address.receivername IS '收件人名称';
COMMENT ON COLUMN user_address.receiverphone IS '收件人电话';
COMMENT ON COLUMN user_address.provinceCode IS '省份代码';
COMMENT ON COLUMN user_address.provinceName IS '省份名称';
COMMENT ON COLUMN user_address.cityCode IS '城市代码';
COMMENT ON COLUMN user_address.cityName IS '城市名称';
COMMENT ON COLUMN user_address.districtCode IS '区代码';
COMMENT ON COLUMN user_address.districtName IS '区名称';
COMMENT ON COLUMN user_address.detailaddress IS '详细地址';
COMMENT ON COLUMN user_address.status IS '地址状态, 0表示正常, 1表示默认地址';
COMMENT ON COLUMN user_address.createtime IS '创建时间';

-- 2017.01.05
--用户订单
CREATE TABLE user_order(
    id bigserial primary key NOT NULL,
    ordercode VARCHAR(64) NOT NULL DEFAULT '',
    ordercomment VARCHAR(128) NOT NULL DEFAULT '',
    userid bigint  NOT NULL DEFAULT 0,
    addressid bigint NOT NULL DEFAULT 0,
    status smallint NOT NULL DEFAULT 0,
    totalprice decimal(10, 2) NOT NULL DEFAULT 0,
    paymenttypeid bigint NOT NULL DEFAULT 0,
    finishTime timestamp,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
--表说明
COMMENT ON TABLE user_order IS '用户订单表';
--字段说明
COMMENT ON COLUMN user_order.id IS '主键ID';
COMMENT ON COLUMN user_order.ordercode IS '订单编码';
COMMENT ON COLUMN user_order.ordercoment IS '订单备注';
COMMENT ON COLUMN user_order.userid IS '订单用户id';
COMMENT ON COLUMN user_order.addressid IS '订单地址id';
COMMENT ON COLUMN user_order.status IS '订单状态, -1表示过期, 0表示拍下商品, 1表示支付成功, 2表示买家发货, 3表示完成';
COMMENT ON COLUMN user_order.paymenttypeid IS '支付方式id, 1表示微信支付';
COMMENT ON COLUMN user_order.finishtime IS '完成时间';
COMMENT ON COLUMN user_order.createtime IS '创建时间';

--子订单表
CREATE TABLE user_sub_order(
    id bigserial primary key NOT NULL,
    orderid bigint NOT NULL DEFAULT 0,
    ordertype smallint NOT NULL DEFAULT 0,
    goodsid bigint NOT NULL DEFAULT 0,
    amount int NOT NULL DEFAULT 0,
    subtotalprice decimal(10, 2) NOT NULL DEFAULT 0,
    status smallint NOT NULL DEFAULT 0,
    deliverywayid bigint NOT NULL DEFAULT 0,
    deliveryTime timestamp,
    deliveredTime timestamp,
    finishTime timestamp,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
--表说明
COMMENT ON TABLE user_sub_order IS '用户子订单表';
--字段说明
COMMENT ON COLUMN user_sub_order.id IS '主键ID';
COMMENT ON COLUMN user_sub_order.orderid IS '订单id';
COMMENT ON COLUMN user_sub_order.ordertype IS '订单类型, 0:正常商品, 1:保证金';
COMMENT ON COLUMN user_sub_order.goodsid IS '商品id';
COMMENT ON COLUMN user_sub_order.amount IS '商品数量';
COMMENT ON COLUMN user_sub_order.price IS '价格';
COMMENT ON COLUMN user_sub_order.status IS '订单状态, 0表示未完成, 1表示完成';
COMMENT ON COLUMN user_sub_order.deliverywayid IS '配送方式id';
COMMENT ON COLUMN user_sub_order.deliveryTime IS '配送时间';
COMMENT ON COLUMN user_sub_order.deliveredTime IS '送到的时间';
COMMENT ON COLUMN user_sub_order.finishtime IS '完成时间';
COMMENT ON COLUMN user_sub_order.createtime IS '创建时间';


--支付类型表
CREATE TABLE payment_type(
    id bigserial primary key NOT NULL,
    paymentcode VARCHAR(64) NOT NULL DEFAULT '',
    paymentname VARCHAR(64) NOT NULL DEFAULT '',
    paymentcomment VARCHAR(128) NOT NULL DEFAULT '',
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
--表说明
COMMENT ON TABLE payment_type IS '支付类型表';
--字段说明
COMMENT ON COLUMN payment_type.id IS '主键ID';
COMMENT ON COLUMN payment_type.paymentcode IS '支付类型代码';
COMMENT ON COLUMN payment_type.paymentname IS '支付类型名称, 微信支付, 支付宝支付等';
COMMENT ON COLUMN payment_type.paymentcomment IS '支付类型备注';
COMMENT ON COLUMN payment_type.createtime IS '创建时间';

--配送类型表
CREATE TABLE delivery_type(
    id bigserial primary key NOT NULL,
    deliverycode VARCHAR(64) NOT NULL DEFAULT '',
    deliveryname VARCHAR(64) NOT NULL DEFAULT '',
    deliverycontent VARCHAR(256) NOT NULL DEFAULT '',
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
--表说明
COMMENT ON TABLE delivery_type IS '配送类型表';
--字段说明
COMMENT ON COLUMN delivery_type.id IS '主键ID';
COMMENT ON COLUMN delivery_type.deliverycode IS '配送类型代码';
COMMENT ON COLUMN delivery_type.deliveryname IS '配送类型名称, 快递等';
COMMENT ON COLUMN delivery_type.deliverycontent IS '配送类型备注';
COMMENT ON COLUMN delivery_type.createtime IS '创建时间';

--发票表
CREATE TABLE invoice(
    id bigserial primary key NOT NULL,
    orderid bigint  NOT NULL DEFAULT 0,
    invoicetypeid bigint  NOT NULL DEFAULT 0,
    invoicetitle VARCHAR(64) NOT NULL DEFAULT '',
    invoicecontent VARCHAR(128) NOT NULL DEFAULT '',
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
--表说明
COMMENT ON TABLE invoice IS '配送类型表';
--字段说明
COMMENT ON COLUMN invoice.id IS '主键ID';
COMMENT ON COLUMN invoice.invoicetypeid IS '发票类型id';
COMMENT ON COLUMN invoice.invoicetitle IS '发票抬头';
COMMENT ON COLUMN invoice.invoicecontent IS '发票备注';
COMMENT ON COLUMN invoice.createtime IS '创建时间';

--发票类型表
CREATE TABLE invoice_type(
    id bigserial primary key NOT NULL,
    invoicecode VARCHAR(64) NOT NULL DEFAULT '',
    invoicename VARCHAR(64) NOT NULL DEFAULT '',
    invoicecontent VARCHAR(256) NOT NULL DEFAULT '',
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
--表说明
COMMENT ON TABLE delivery_type IS '配送类型表';
--字段说明
COMMENT ON COLUMN invoice_type.id IS '主键ID';
COMMENT ON COLUMN invoice_type.invoicecode IS '发票类型代码';
COMMENT ON COLUMN invoice_type.invoicename IS '发票类型名称';
COMMENT ON COLUMN invoice_type.invoicecontent IS '发票类型备注';
COMMENT ON COLUMN invoice_type.createtime IS '创建时间';


