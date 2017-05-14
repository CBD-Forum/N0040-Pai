--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: bbt; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE bbt (
    id character varying(64) NOT NULL,
    section character varying(200),
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(512),
    "timestamp" integer,
    create_time timestamp without time zone
);


ALTER TABLE public.bbt OWNER TO skywell;

--
-- Name: blognews; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE blognews (
    title character varying(200) NOT NULL,
    abstract text,
    link character varying(512),
    created_at character varying(50),
    publish_time integer,
    create_time timestamp without time zone
);


ALTER TABLE public.blognews OWNER TO skywell;

--
-- Name: delivery_type; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE delivery_type (
    id bigint NOT NULL,
    deliverycode character varying(64) DEFAULT ''::character varying NOT NULL,
    deliveryname character varying(64) DEFAULT ''::character varying NOT NULL,
    deliverycontent character varying(256) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.delivery_type OWNER TO skywell;

--
-- Name: TABLE delivery_type; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE delivery_type IS '配送类型表';


--
-- Name: COLUMN delivery_type.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN delivery_type.id IS '主键ID';


--
-- Name: COLUMN delivery_type.deliverycode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN delivery_type.deliverycode IS '配送类型代码';


--
-- Name: COLUMN delivery_type.deliveryname; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN delivery_type.deliveryname IS '配送类型名称, 快递等';


--
-- Name: COLUMN delivery_type.deliverycontent; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN delivery_type.deliverycontent IS '配送类型备注';


--
-- Name: COLUMN delivery_type.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN delivery_type.createtime IS '创建时间';


--
-- Name: delivery_type_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE delivery_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.delivery_type_id_seq OWNER TO skywell;

--
-- Name: delivery_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE delivery_type_id_seq OWNED BY delivery_type.id;


--
-- Name: delivery_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('delivery_type_id_seq', 1, false);


--
-- Name: er211ic; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE er211ic (
    id character varying(64) NOT NULL,
    section character varying(200),
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(512),
    "timestamp" integer,
    create_time timestamp without time zone
);


ALTER TABLE public.er211ic OWNER TO skywell;

--
-- Name: goods; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE goods (
    id bigint NOT NULL,
    goodsname character varying(64) DEFAULT ''::character varying NOT NULL,
    code character varying(64) DEFAULT ''::character varying NOT NULL,
    address character varying(64) DEFAULT ''::character varying NOT NULL,
    secret character varying(64) DEFAULT ''::character varying NOT NULL,
    description character varying(1024) DEFAULT ''::character varying NOT NULL,
    starttime integer DEFAULT 0 NOT NULL,
    baseprice integer DEFAULT 0 NOT NULL,
    fixincprice integer DEFAULT 0 NOT NULL,
    bidinterval integer DEFAULT 0 NOT NULL,
    totalauction integer DEFAULT 0 NOT NULL,
    marketvalue integer DEFAULT 0 NOT NULL,
    salt character varying(1024) DEFAULT ''::character varying NOT NULL,
    hash character varying(1024) DEFAULT ''::character varying NOT NULL,
    visitcount integer DEFAULT 0 NOT NULL,
    bidindex integer DEFAULT 0 NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    locked integer DEFAULT 0 NOT NULL,
    counterparty character varying(64) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    deposit numeric(10,2) DEFAULT 0 NOT NULL,
    typeid bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.goods OWNER TO skywell;

--
-- Name: TABLE goods; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE goods IS '商品表';


--
-- Name: COLUMN goods.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.id IS '主键ID';


--
-- Name: COLUMN goods.goodsname; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.goodsname IS '商品名称';


--
-- Name: COLUMN goods.code; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.code IS '商品代码';


--
-- Name: COLUMN goods.address; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.address IS '商品钱包地址';


--
-- Name: COLUMN goods.secret; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.secret IS '商品钱包密钥';


--
-- Name: COLUMN goods.description; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.description IS '描述信息';


--
-- Name: COLUMN goods.starttime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.starttime IS '开始时间';


--
-- Name: COLUMN goods.baseprice; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.baseprice IS '基准价格';


--
-- Name: COLUMN goods.fixincprice; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.fixincprice IS '固定加价';


--
-- Name: COLUMN goods.bidinterval; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.bidinterval IS '出价间隔';


--
-- Name: COLUMN goods.totalauction; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.totalauction IS '总拍卖时间';


--
-- Name: COLUMN goods.marketvalue; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.marketvalue IS '市场价';


--
-- Name: COLUMN goods.salt; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.salt IS '密码盐';


--
-- Name: COLUMN goods.hash; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.hash IS '密码hash';


--
-- Name: COLUMN goods.visitcount; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.visitcount IS '围观人数';


--
-- Name: COLUMN goods.bidindex; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.bidindex IS '出价轮次';


--
-- Name: COLUMN goods.status; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.status IS '状态';


--
-- Name: COLUMN goods.locked; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.locked IS '锁定';


--
-- Name: COLUMN goods.counterparty; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.counterparty IS '中标用户地址';


--
-- Name: COLUMN goods.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods.createtime IS '创建时间';


--
-- Name: goods_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE goods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.goods_id_seq OWNER TO skywell;

--
-- Name: goods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE goods_id_seq OWNED BY goods.id;


--
-- Name: goods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('goods_id_seq', 17, true);


--
-- Name: goods_img; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE goods_img (
    id bigint NOT NULL,
    filename character varying(1024) DEFAULT ''::character varying NOT NULL,
    goodscode character varying(64) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.goods_img OWNER TO skywell;

--
-- Name: TABLE goods_img; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE goods_img IS '商品图片表';


--
-- Name: COLUMN goods_img.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods_img.id IS '主键ID';


--
-- Name: COLUMN goods_img.filename; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods_img.filename IS '文件名称';


--
-- Name: COLUMN goods_img.goodscode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN goods_img.goodscode IS '商品代码';


--
-- Name: goods_img_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE goods_img_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.goods_img_id_seq OWNER TO skywell;

--
-- Name: goods_img_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE goods_img_id_seq OWNED BY goods_img.id;


--
-- Name: goods_img_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('goods_img_id_seq', 185, true);


--
-- Name: invoice; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE invoice (
    id bigint NOT NULL,
    orderid bigint DEFAULT 0 NOT NULL,
    invoicetypeid bigint DEFAULT 0 NOT NULL,
    invoicetitle character varying(64) DEFAULT ''::character varying NOT NULL,
    invoicecontent character varying(128) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoice OWNER TO skywell;

--
-- Name: TABLE invoice; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE invoice IS '配送类型表';


--
-- Name: COLUMN invoice.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice.id IS '主键ID';


--
-- Name: COLUMN invoice.invoicetypeid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice.invoicetypeid IS '发票类型id';


--
-- Name: COLUMN invoice.invoicetitle; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice.invoicetitle IS '发票抬头';


--
-- Name: COLUMN invoice.invoicecontent; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice.invoicecontent IS '发票备注';


--
-- Name: COLUMN invoice.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice.createtime IS '创建时间';


--
-- Name: invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE invoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.invoice_id_seq OWNER TO skywell;

--
-- Name: invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE invoice_id_seq OWNED BY invoice.id;


--
-- Name: invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('invoice_id_seq', 1, false);


--
-- Name: invoice_type; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE invoice_type (
    id bigint NOT NULL,
    invoicecode character varying(64) DEFAULT ''::character varying NOT NULL,
    invoicename character varying(64) DEFAULT ''::character varying NOT NULL,
    invoicecontent character varying(256) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoice_type OWNER TO skywell;

--
-- Name: COLUMN invoice_type.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice_type.id IS '主键ID';


--
-- Name: COLUMN invoice_type.invoicecode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice_type.invoicecode IS '发票类型代码';


--
-- Name: COLUMN invoice_type.invoicename; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice_type.invoicename IS '发票类型名称';


--
-- Name: COLUMN invoice_type.invoicecontent; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice_type.invoicecontent IS '发票类型备注';


--
-- Name: COLUMN invoice_type.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN invoice_type.createtime IS '创建时间';


--
-- Name: invoice_type_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE invoice_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.invoice_type_id_seq OWNER TO skywell;

--
-- Name: invoice_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE invoice_type_id_seq OWNED BY invoice_type.id;


--
-- Name: invoice_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('invoice_type_id_seq', 1, false);


--
-- Name: leiphone; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE leiphone (
    id character varying(64) NOT NULL,
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(200),
    "timestamp" integer
);


ALTER TABLE public.leiphone OWNER TO skywell;

--
-- Name: lparticle; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE lparticle (
    id character varying(64) NOT NULL,
    section character varying(200),
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(512),
    "timestamp" integer,
    create_time timestamp without time zone
);


ALTER TABLE public.lparticle OWNER TO skywell;

--
-- Name: lpguoji; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE lpguoji (
    id character varying(64) NOT NULL,
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(200),
    "timestamp" integer
);


ALTER TABLE public.lpguoji OWNER TO skywell;

--
-- Name: lpjingdu; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE lpjingdu (
    id character varying(64) NOT NULL,
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(200),
    "timestamp" integer
);


ALTER TABLE public.lpjingdu OWNER TO skywell;

--
-- Name: lpsponsor; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE lpsponsor (
    id character varying(64) NOT NULL,
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(200),
    "timestamp" integer
);


ALTER TABLE public.lpsponsor OWNER TO skywell;

--
-- Name: payment_type; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE payment_type (
    id bigint NOT NULL,
    paymentcode character varying(64) DEFAULT ''::character varying NOT NULL,
    paymentname character varying(64) DEFAULT ''::character varying NOT NULL,
    paymentcomment character varying(128) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_type OWNER TO skywell;

--
-- Name: TABLE payment_type; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE payment_type IS '支付类型表';


--
-- Name: COLUMN payment_type.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN payment_type.id IS '主键ID';


--
-- Name: COLUMN payment_type.paymentcode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN payment_type.paymentcode IS '支付类型代码';


--
-- Name: COLUMN payment_type.paymentname; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN payment_type.paymentname IS '支付类型名称, 微信支付, 支付宝支付等';


--
-- Name: COLUMN payment_type.paymentcomment; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN payment_type.paymentcomment IS '支付类型备注';


--
-- Name: COLUMN payment_type.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN payment_type.createtime IS '创建时间';


--
-- Name: payment_type_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE payment_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.payment_type_id_seq OWNER TO skywell;

--
-- Name: payment_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE payment_type_id_seq OWNED BY payment_type.id;


--
-- Name: payment_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('payment_type_id_seq', 1, false);


--
-- Name: semi; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE semi (
    id character varying(64) NOT NULL,
    category character varying(50),
    section character varying(200),
    title character varying(200),
    author character varying(200),
    link character varying(200),
    abstract character varying(512),
    "timestamp" integer,
    create_time timestamp without time zone
);


ALTER TABLE public.semi OWNER TO skywell;

--
-- Name: spider; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE spider (
    id integer NOT NULL,
    name character(50) NOT NULL,
    category character(50) NOT NULL,
    href text NOT NULL,
    xpath text NOT NULL,
    next_pattern text NOT NULL,
    method character(8) NOT NULL
);


ALTER TABLE public.spider OWNER TO skywell;

--
-- Name: spider_category; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE spider_category (
    id integer NOT NULL,
    name character(50) NOT NULL,
    category character(50) NOT NULL,
    property character(50) NOT NULL,
    flag character(8) NOT NULL,
    xpath text NOT NULL,
    re text NOT NULL,
    resv character(50)
);


ALTER TABLE public.spider_category OWNER TO skywell;

--
-- Name: spider_category_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE spider_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.spider_category_id_seq OWNER TO skywell;

--
-- Name: spider_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE spider_category_id_seq OWNED BY spider_category.id;


--
-- Name: spider_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('spider_category_id_seq', 115, true);


--
-- Name: spider_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE spider_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.spider_id_seq OWNER TO skywell;

--
-- Name: spider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE spider_id_seq OWNED BY spider.id;


--
-- Name: spider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('spider_id_seq', 23, true);


--
-- Name: sspider; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE sspider (
    title character varying(200) NOT NULL,
    abstract text,
    href character varying(512),
    name character varying(512),
    category character varying(512),
    source character varying(512),
    publish_time integer,
    create_time timestamp without time zone
);


ALTER TABLE public.sspider OWNER TO skywell;

--
-- Name: user_address; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE user_address (
    id bigint NOT NULL,
    username character varying(64) DEFAULT ''::character varying NOT NULL,
    receivername character varying(64) DEFAULT ''::character varying NOT NULL,
    receiverphone character varying(64) DEFAULT ''::character varying NOT NULL,
    provincecode character varying(64) DEFAULT ''::character varying NOT NULL,
    provincename character varying(64) DEFAULT ''::character varying NOT NULL,
    citycode character varying(64) DEFAULT ''::character varying NOT NULL,
    cityname character varying(64) DEFAULT ''::character varying NOT NULL,
    districtcode character varying(64) DEFAULT ''::character varying NOT NULL,
    districtname character varying(64) DEFAULT ''::character varying NOT NULL,
    detailaddress character varying(256) DEFAULT ''::character varying NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_address OWNER TO skywell;

--
-- Name: TABLE user_address; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE user_address IS '用户地址表';


--
-- Name: COLUMN user_address.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.id IS '主键ID';


--
-- Name: COLUMN user_address.username; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.username IS '用户名称';


--
-- Name: COLUMN user_address.receivername; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.receivername IS '收件人名称';


--
-- Name: COLUMN user_address.receiverphone; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.receiverphone IS '收件人电话';


--
-- Name: COLUMN user_address.provincecode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.provincecode IS '省份代码';


--
-- Name: COLUMN user_address.provincename; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.provincename IS '省份名称';


--
-- Name: COLUMN user_address.citycode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.citycode IS '城市代码';


--
-- Name: COLUMN user_address.cityname; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.cityname IS '城市名称';


--
-- Name: COLUMN user_address.districtcode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.districtcode IS '区代码';


--
-- Name: COLUMN user_address.districtname; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.districtname IS '区名称';


--
-- Name: COLUMN user_address.detailaddress; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.detailaddress IS '详细地址';


--
-- Name: COLUMN user_address.status; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.status IS '地址状态, 0表示正常, 1表示默认地址';


--
-- Name: COLUMN user_address.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_address.createtime IS '创建时间';


--
-- Name: user_address_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE user_address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.user_address_id_seq OWNER TO skywell;

--
-- Name: user_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE user_address_id_seq OWNED BY user_address.id;


--
-- Name: user_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('user_address_id_seq', 12, true);


--
-- Name: user_bid_info; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE user_bid_info (
    id bigint NOT NULL,
    username character varying(64) DEFAULT ''::character varying NOT NULL,
    goodscode character varying(64) DEFAULT ''::character varying NOT NULL,
    bidtimestamp bigint DEFAULT 0 NOT NULL,
    bidprice integer DEFAULT 0 NOT NULL,
    bidindex integer DEFAULT 0 NOT NULL,
    biduserindex integer DEFAULT 0 NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_bid_info OWNER TO skywell;

--
-- Name: user_bid_info_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE user_bid_info_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.user_bid_info_id_seq OWNER TO skywell;

--
-- Name: user_bid_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE user_bid_info_id_seq OWNED BY user_bid_info.id;


--
-- Name: user_bid_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('user_bid_info_id_seq', 53, true);


--
-- Name: user_order; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE user_order (
    id bigint NOT NULL,
    ordercode character varying(64) DEFAULT ''::character varying NOT NULL,
    ordercomment character varying(128) DEFAULT ''::character varying NOT NULL,
    userid bigint DEFAULT 0 NOT NULL,
    addressid bigint DEFAULT 0 NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    totalprice numeric(10,2) DEFAULT 0 NOT NULL,
    paymenttypeid bigint DEFAULT 0 NOT NULL,
    finishtime timestamp without time zone,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_order OWNER TO skywell;

--
-- Name: TABLE user_order; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE user_order IS '用户订单表';


--
-- Name: COLUMN user_order.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.id IS '主键ID';


--
-- Name: COLUMN user_order.ordercode; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.ordercode IS '订单编码';


--
-- Name: COLUMN user_order.userid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.userid IS '订单用户id';


--
-- Name: COLUMN user_order.addressid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.addressid IS '订单地址id';


--
-- Name: COLUMN user_order.status; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.status IS '订单状态, -1表示过期, 0表示拍下商品, 1表示支付成功, 2表示买家发货, 3表示完成';


--
-- Name: COLUMN user_order.paymenttypeid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.paymenttypeid IS '支付方式id, 1表示微信支付';


--
-- Name: COLUMN user_order.finishtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.finishtime IS '完成时间';


--
-- Name: COLUMN user_order.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_order.createtime IS '创建时间';


--
-- Name: user_order_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE user_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.user_order_id_seq OWNER TO skywell;

--
-- Name: user_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE user_order_id_seq OWNED BY user_order.id;


--
-- Name: user_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('user_order_id_seq', 38, true);


--
-- Name: user_sub_order; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE user_sub_order (
    id bigint NOT NULL,
    orderid bigint DEFAULT 0 NOT NULL,
    ordertype smallint DEFAULT 0 NOT NULL,
    goodsid bigint DEFAULT 0 NOT NULL,
    amount integer DEFAULT 0 NOT NULL,
    subtotalprice numeric(10,2) DEFAULT 0 NOT NULL,
    status smallint DEFAULT 0 NOT NULL,
    deliverywayid bigint DEFAULT 0 NOT NULL,
    deliverytime timestamp without time zone,
    deliveredtime timestamp without time zone,
    finishtime timestamp without time zone,
    createtime timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_sub_order OWNER TO skywell;

--
-- Name: TABLE user_sub_order; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE user_sub_order IS '用户子订单表';


--
-- Name: COLUMN user_sub_order.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.id IS '主键ID';


--
-- Name: COLUMN user_sub_order.orderid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.orderid IS '订单id';


--
-- Name: COLUMN user_sub_order.ordertype; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.ordertype IS '订单类型, 0:正常商品, 1:保证金';


--
-- Name: COLUMN user_sub_order.goodsid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.goodsid IS '商品id';


--
-- Name: COLUMN user_sub_order.amount; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.amount IS '商品数量';


--
-- Name: COLUMN user_sub_order.status; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.status IS '订单状态, 0表示未完成, 1表示完成';


--
-- Name: COLUMN user_sub_order.deliverywayid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.deliverywayid IS '配送方式id';


--
-- Name: COLUMN user_sub_order.deliverytime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.deliverytime IS '配送时间';


--
-- Name: COLUMN user_sub_order.deliveredtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.deliveredtime IS '送到的时间';


--
-- Name: COLUMN user_sub_order.finishtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.finishtime IS '完成时间';


--
-- Name: COLUMN user_sub_order.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN user_sub_order.createtime IS '创建时间';


--
-- Name: user_sub_order_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE user_sub_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.user_sub_order_id_seq OWNER TO skywell;

--
-- Name: user_sub_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE user_sub_order_id_seq OWNED BY user_sub_order.id;


--
-- Name: user_sub_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('user_sub_order_id_seq', 37, true);


--
-- Name: users; Type: TABLE; Schema: public; Owner: skywell; Tablespace:
--

CREATE TABLE users (
    id bigint NOT NULL,
    username character varying(64) DEFAULT ''::character varying NOT NULL,
    salt character varying(1024) DEFAULT ''::character varying NOT NULL,
    hash character varying(1024) DEFAULT ''::character varying NOT NULL,
    phone character varying(20) DEFAULT ''::character varying NOT NULL,
    email character varying(64) DEFAULT ''::character varying NOT NULL,
    userref smallint DEFAULT 0 NOT NULL,
    refusername character varying(64) DEFAULT ''::character varying NOT NULL,
    address character varying(64) DEFAULT ''::character varying NOT NULL,
    secret character varying(64) DEFAULT ''::character varying NOT NULL,
    createtime timestamp without time zone DEFAULT now() NOT NULL,
    unionid character varying(36) DEFAULT ''::character varying NOT NULL,
    nickname character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.users OWNER TO skywell;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON TABLE users IS '用户表';


--
-- Name: COLUMN users.id; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.id IS '主键ID';


--
-- Name: COLUMN users.username; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.username IS '用户名称';


--
-- Name: COLUMN users.salt; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.salt IS '密码盐';


--
-- Name: COLUMN users.hash; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.hash IS '密码hash';


--
-- Name: COLUMN users.phone; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.phone IS '电话号码';


--
-- Name: COLUMN users.email; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.email IS '邮箱';


--
-- Name: COLUMN users.userref; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.userref IS '用户来源, 0注册用户, 1井通帐号, 2微信帐号';


--
-- Name: COLUMN users.refusername; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.refusername IS '来源用户名称';


--
-- Name: COLUMN users.address; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.address IS '用户钱包地址';


--
-- Name: COLUMN users.secret; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.secret IS '用户钱包密钥';


--
-- Name: COLUMN users.createtime; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.createtime IS '创建时间';


--
-- Name: COLUMN users.unionid; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.unionid IS '统一id';


--
-- Name: COLUMN users.nickname; Type: COMMENT; Schema: public; Owner: skywell
--

COMMENT ON COLUMN users.nickname IS '昵称';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: skywell
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO skywell;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: skywell
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: skywell
--

SELECT pg_catalog.setval('users_id_seq', 114, true);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY delivery_type ALTER COLUMN id SET DEFAULT nextval('delivery_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY goods ALTER COLUMN id SET DEFAULT nextval('goods_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY goods_img ALTER COLUMN id SET DEFAULT nextval('goods_img_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY invoice ALTER COLUMN id SET DEFAULT nextval('invoice_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY invoice_type ALTER COLUMN id SET DEFAULT nextval('invoice_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY payment_type ALTER COLUMN id SET DEFAULT nextval('payment_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY spider ALTER COLUMN id SET DEFAULT nextval('spider_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY spider_category ALTER COLUMN id SET DEFAULT nextval('spider_category_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY user_address ALTER COLUMN id SET DEFAULT nextval('user_address_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY user_bid_info ALTER COLUMN id SET DEFAULT nextval('user_bid_info_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY user_order ALTER COLUMN id SET DEFAULT nextval('user_order_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY user_sub_order ALTER COLUMN id SET DEFAULT nextval('user_sub_order_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: skywell
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: bbt; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY bbt (id, section, title, author, link, abstract, "timestamp", create_time) FROM stdin;
\.


--
-- Data for Name: blognews; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY blognews (title, abstract, link, created_at, publish_time, create_time) FROM stdin;
\.


--
-- Data for Name: delivery_type; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY delivery_type (id, deliverycode, deliveryname, deliverycontent, createtime) FROM stdin;
\.


--
-- Data for Name: er211ic; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY er211ic (id, section, title, author, link, abstract, "timestamp", create_time) FROM stdin;
\.


--
-- Data for Name: goods; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY goods (id, goodsname, code, address, secret, description, starttime, baseprice, fixincprice, bidinterval, totalauction, marketvalue, salt, hash, visitcount, bidindex, status, locked, counterparty, createtime, price, deposit, typeid) FROM stdin;
17	测试商品118	ceshipaimai118	jBYtrqvQhHSak6yoN3UUkVm7Jo9uyWd9or	sh5tFsB9zVPUJ9xWXsogzW18gSRdf	测试商品, 大家快来参加哦	1494739980	500	50	60	1200	30000	crKhmAcVdipQ1Ei/2VPnYXGYkcR67wEKohci+BX4zS4kEf3lgmYpx/FoiYHLWFW9d1dsWdK+x+vI2WP4R3nMJiFjcYsqJP+F37bkFuHuY6R7RiQ/cdNzbS2bbMyR9at4IqbDyT4DICimG1ReINd/1vWzGMEc3LXGqbjKF0Qob5s=	nUCKNaixc9UA/QuMSH+4qfGlSHYTX3IAGZS/r7fYBcH9BhmKd+cSTIwMXxRCQFCPgG/EwTD/uK4w73K4fRwPga3XFY9uPvdvKxGouhjF6+jsrCvI9nl9L/Hi1ngoFLxDlN7lZtTSaVtYp8AYyrz2ifbQaOaEFqSYYd51rRWFNUQ=	14	4	1	1494740400	jNScbEe2YzT6BUb24ZF1qCJitUtvRFWgod	2017-05-14 13:30:57.926108	650.00	10.00	0
12	测试商品001	ceshipaimai001	jGUbMMoFbS35ydqneYMjCEiuiFWV431Kue	ssACndh4XnaGHLxvVm8y5LsdqSHo3	测试商品, 大家快来参加哦	1494688500	300	30	60	1200	30000	eMKfhfZC84sKptV/+Jl/CyGvUFDYkcs59SvgHw9YQ/XYnGqB0mKy/qOz/LRkRBVDSZdxJ0WAUY6SZJDFnFV3a9wEufdgT7rOSrLcic1P4vHy6yyay9ycAgMO7mko++EwR0dxSXfq1HkCZ4+nY3OoA8bfXA0Si93XyaY/FvxGFH8=	1rFCI94ivunW4TIC8AM83zGtR524C3uRrMOvlgavewCvALGdQ2ZjHE+S0RQONc2xgGkL4Ijm12vTRRSx9qwIghDRnRjxBOK75MO2LVl2Ber9YycRiD1F9k6hu/dUihsvspuw7df+aYPM8XBLS/86v3f+SVBpilC6+C+XIrfblO0=	9	4	1	1494689100	jNScbEe2YzT6BUb24ZF1qCJitUtvRFWgod	2017-05-13 23:11:58.907557	390.00	10.00	0
13	测试商品002	ceshipaimai002	j4QPJ4RHRGqi9Ni7swDeFjaRtVwB1JNrYb	snfyCg1GXUEPUofLdyfqDBcTco7TS	测试商品, 大家快来参加哦	1494689760	300	30	300	1800	30000	SCyDQyMjIrW62H7fyj8IOn/Si6UDu0WKcrNKxui/YTqOIyuxW95KyV2ob1ZCD2Qj/qgHfcEQoI+61iwv/CfGrSdD1zADVMOx5mzB72vsnYHg/qBqhs0OYZX/tk17sovmLe77gqyXRL+fNwwxq/DD+rFbhwU+ufUsfhTtfDstcpM=	sQX8ETIY36hai6FzPAg9eWo9GhesT8+dSKsLzvJJWxglhDc4vUcjnd9PtfVXp9PEo1la3QAKob6lgv1pM3FXalZwAWWBpeYxm1wiVXcZGS9bbYGw821o7+FlpaA74oMJIUK1xcVmlVsfw518s+MtOHNkP7cTJlQNvNxVnCpOx30=	9	4	1	1494691560	jNScbEe2YzT6BUb24ZF1qCJitUtvRFWgod	2017-05-13 23:34:48.387338	390.00	10.00	0
14	测试商品003	ceshipaimai003	jKZLtMQRobqRCiHYFPMHueJdumg5fMsect	shMVZ5DPzt174sgM5aSUp1ngkWAHo	测试商品, 大家快来参加哦	1494691920	300	30	300	1800	30000	QklRIzF22stafwCQQ5/awLDQZfomp6MNm9veHI47vpApuqVzw1eTGTSKcvB+YKAm83GvYpFvrIns5MSQe8JsptAooL9w3VloS8co/pMu39/tBCYtfnzkvLBiGgiDagrATP84Ga/BDCgQzt7DKEvdAwIBA+HseTORY9JoZivRfM4=	ZT8kQRkEzT+rqFnvQtXBPwux0fgTI66Ulw9+YJboUIGpyG9eTfGqAr91pc8jurbYzA0UxxNLGzo9TPYGsMN4HVDMBIWDMNQYX82KkDbO+IEL4VE8bsPyhzuIaL+51paY3gv30mfB7pd3LtvSBNxdaxHaIvbiTCIEwM2UcHhkJiY=	23	5	1	1494693720	jLk2wUBNajDRANzCMncMJJpHFXA9dgJjkb	2017-05-14 00:09:18.205609	420.00	10.00	0
16	测试商品008	ceshipaimai008	j4RHj2s9chMsWnZUwcjju1BpcZJKSf1Q5J	sanZ9cFGtphezVZ9LQMUoFqgUv85E	测试商品, 大家快来参加哦	1494730200	500	50	60	1200	30000	0CaVRklVZs/g+pUJjFquD53Vd69jZH2tp3PwPe6R6GHNcljhHg9Dba31eWkcmi01oahN+LpP44f9VV3mWgzlOFNLSTxq/BdUEnms+V5HWBDIXbPrus/KaTbln8EmTXRLD1eAySufnoeV8gD6G4ehYAUaDxVXexlAmKdPYy12k9I=	yBRmKYIjwW0D4fZo4dC4wnmBcIxXuoX77NG5Q9J/IeZZeW6gmV6+qOg01qkBgavJnWDoyvM/wNDsrnIsbReAipD8XJ4o3OxebDVNL+ZGCjgtvqBsssGZqrjh5GslDJ0ybQZBgA4hbb+V8dmELw4ZHo1yPl0EiqrJD9O/gee4Tgs=	27	10	1	1494730980	jNScbEe2YzT6BUb24ZF1qCJitUtvRFWgod	2017-05-14 10:43:29.015508	950.00	10.00	0
15	测试商品005	ceshipaimai005	j32zWKPYbDHvHV1njw9sLsaBFWPKXTn4Zf	sntc7qcf9cKYH4v9SLtjFQNA2SW6B	测试商品, 大家快来参加哦	1494694860	300	30	300	1800	30000	5ZwL+2mrkE24oS+tobY0UFwhe3HYcNpGG5jgP2PSCwDM/0P2o+nBiYNJ35+caQjphsN6dzZrqlAKsOXdz0/j1eLn3BhzU3oKgXGpCps0CuOHi1TV9gSEE7RoWZeJUrmTyoYRj5ZLJj4mtUpPdrr7itVCDkiDlL6jg+e8sN6JjhQ=	pIbi+5hQBZxz684loGfn1s+N75I06Iq8Y6ypzgYZ38wpKlcaXZq1pxcZYnM9eMtwddzsv09wKdyYGK1RHXJreAVw8qMenj1/jshGDJtMM2SuM0kQM6UGJC+gjUtDxao9XGonr19GvDNZONnuawjINL/vBFXKEACi0ctiGAjjF/E=	14	2	1	1494696360	jLk2wUBNajDRANzCMncMJJpHFXA9dgJjkb	2017-05-14 00:58:49.062358	330.00	10.00	0
\.


--
-- Data for Name: goods_img; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY goods_img (id, filename, goodscode, createtime) FROM stdin;
177	1285997748.jpg	ceshipaimai001	2017-05-13 23:11:58.925399
178	1285997748.jpg	ceshipaimai002	2017-05-13 23:34:48.40468
179	1285997748.jpg	ceshipaimai002	2017-05-13 23:34:48.4089
180	1285997748.jpg	ceshipaimai003	2017-05-14 00:09:18.21405
181	1285997748.jpg	ceshipaimai003	2017-05-14 00:09:18.220571
182	1285997748.jpg	ceshipaimai005	2017-05-14 00:58:49.078819
183	1285997748.jpg	ceshipaimai005	2017-05-14 00:58:49.084354
184	1285997748.jpg	ceshipaimai008	2017-05-14 10:43:29.02197
185	1285997748.jpg	ceshipaimai118	2017-05-14 13:30:57.944198
\.


--
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY invoice (id, orderid, invoicetypeid, invoicetitle, invoicecontent, createtime) FROM stdin;
\.


--
-- Data for Name: invoice_type; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY invoice_type (id, invoicecode, invoicename, invoicecontent, createtime) FROM stdin;
\.


--
-- Data for Name: leiphone; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY leiphone (id, title, author, link, abstract, "timestamp") FROM stdin;
\.


--
-- Data for Name: lparticle; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY lparticle (id, section, title, author, link, abstract, "timestamp", create_time) FROM stdin;
\.


--
-- Data for Name: lpguoji; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY lpguoji (id, title, author, link, abstract, "timestamp") FROM stdin;
\.


--
-- Data for Name: lpjingdu; Type: TABLE DATA; Schema: public; Owner: skywell
--

COPY lpjingdu (id, title, author, link, abstract, "timestamp") FROM stdin;
\.


--
-- Data for Name: lpsponsor; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: payment_type; Type: TABLE DATA; Schema: public; Owner: skywell
--

--
-- Data for Name: semi; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: spider; Type: TABLE DATA; Schema: public; Owner: skywell
--

--
-- Data for Name: spider_category; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: sspider; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: user_address; Type: TABLE DATA; Schema: public; Owner: skywell
--

--
-- Data for Name: user_bid_info; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: user_order; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: user_sub_order; Type: TABLE DATA; Schema: public; Owner: skywell
--
--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: skywell
--

--
-- Name: bbt_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY bbt
    ADD CONSTRAINT bbt_pkey PRIMARY KEY (id);


--
-- Name: blognews_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY blognews
    ADD CONSTRAINT blognews_pkey PRIMARY KEY (title);


--
-- Name: delivery_type_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY delivery_type
    ADD CONSTRAINT delivery_type_pkey PRIMARY KEY (id);


--
-- Name: er211ic_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY er211ic
    ADD CONSTRAINT er211ic_pkey PRIMARY KEY (id);


--
-- Name: goods_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY goods
    ADD CONSTRAINT goods_pkey PRIMARY KEY (id);


--
-- Name: goodsimg_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY goods_img
    ADD CONSTRAINT goodsimg_pkey PRIMARY KEY (id);


--
-- Name: invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (id);


--
-- Name: invoice_type_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY invoice_type
    ADD CONSTRAINT invoice_type_pkey PRIMARY KEY (id);


--
-- Name: leiphone_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY leiphone
    ADD CONSTRAINT leiphone_pkey PRIMARY KEY (id);


--
-- Name: lparticle_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY lparticle
    ADD CONSTRAINT lparticle_pkey PRIMARY KEY (id);


--
-- Name: lpguoji_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY lpguoji
    ADD CONSTRAINT lpguoji_pkey PRIMARY KEY (id);


--
-- Name: lpjingdu_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY lpjingdu
    ADD CONSTRAINT lpjingdu_pkey PRIMARY KEY (id);


--
-- Name: lpsponsor_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY lpsponsor
    ADD CONSTRAINT lpsponsor_pkey PRIMARY KEY (id);


--
-- Name: payment_type_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY payment_type
    ADD CONSTRAINT payment_type_pkey PRIMARY KEY (id);


--
-- Name: semi_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY semi
    ADD CONSTRAINT semi_pkey PRIMARY KEY (id);


--
-- Name: spider_category_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY spider_category
    ADD CONSTRAINT spider_category_pkey PRIMARY KEY (id);


--
-- Name: spider_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY spider
    ADD CONSTRAINT spider_pkey PRIMARY KEY (id);


--
-- Name: sspider_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY sspider
    ADD CONSTRAINT sspider_pkey PRIMARY KEY (title);


--
-- Name: user_address_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY user_address
    ADD CONSTRAINT user_address_pkey PRIMARY KEY (id);


--
-- Name: user_bid_info_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY user_bid_info
    ADD CONSTRAINT user_bid_info_pkey PRIMARY KEY (id);


--
-- Name: user_order_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY user_order
    ADD CONSTRAINT user_order_pkey PRIMARY KEY (id);


--
-- Name: user_sub_order_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY user_sub_order
    ADD CONSTRAINT user_sub_order_pkey PRIMARY KEY (id);


--
-- Name: users_address_key; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_address_key UNIQUE (address);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_unionid_key; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_unionid_key UNIQUE (unionid);


--
-- Name: users_username_key; Type: CONSTRAINT; Schema: public; Owner: skywell; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_username_goodscode_bidindex; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX idx_username_goodscode_bidindex ON user_bid_info USING btree (username, goodscode, bidindex);


--
-- Name: idx_userref_refusername; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX idx_userref_refusername ON users USING btree (userref, refusername);


--
-- Name: ix_bbt_title; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX ix_bbt_title ON bbt USING btree (title);


--
-- Name: ix_er211ic_title; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX ix_er211ic_title ON er211ic USING btree (title);


--
-- Name: ix_lparticle_title; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX ix_lparticle_title ON lparticle USING btree (title);


--
-- Name: ix_semi_timestamp; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX ix_semi_timestamp ON semi USING btree ("timestamp");


--
-- Name: ix_semi_title; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE INDEX ix_semi_title ON semi USING btree (title);


--
-- Name: uqi_code; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE UNIQUE INDEX uqi_code ON goods USING btree (code);


--
-- Name: uqi_username_detailaddress; Type: INDEX; Schema: public; Owner: skywell; Tablespace:
--

CREATE UNIQUE INDEX uqi_username_detailaddress ON user_address USING btree (username, detailaddress);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

