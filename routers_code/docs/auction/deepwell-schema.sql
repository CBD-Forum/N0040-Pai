ALTER TABLE users ADD status int NOT NULL DEFAULT 0;
ALTER TABLE users ADD companyname VARCHAR(128) DEFAULT '';
ALTER TABLE users ADD title VARCHAR(128) DEFAULT '';
ALTER TABLE users ADD realname VARCHAR(32) DEFAULT '';
ALTER TABLE users ADD description VARCHAR(512) DEFAULT '';
ALTER TABLE users ADD price int DEFAULT 0;
ALTER TABLE users ADD totalincome bigserial DEFAULT 0;
ALTER TABLE users ADD income bigserial DEFAULT 0;
ALTER TABLE users ADD photoid VARCHAR(128) DEFAULT '';

COMMENT ON COLUMN users.status IS '状态, 0正常, 1申请达人状态, 审核ing, 2达人状态';
COMMENT ON COLUMN users.companyname IS '公司名字';
COMMENT ON COLUMN users.title IS '职位';
COMMENT ON COLUMN users.realname IS '真实名字';
COMMENT ON COLUMN users.description IS '个人描述信息';
COMMENT ON COLUMN users.price IS '提问价格';
COMMENT ON COLUMN users.totalincome IS '总收入, 单位是分';
COMMENT ON COLUMN users.income IS '收入, 单位是分';
COMMENT ON COLUMN users.photoid IS '图片id';

--added by zhuli
----达人表
--CREATE TABLE expert(
--    id bigserial primary key NOT NULL,
--    username VARCHAR(40) NOT NULL DEFAULT '',
--    expertname VARCHAR(40) NOT NULL DEFAULT '',
--    companyname VARCHAR(80) NOT NULL DEFAULT '',
--    title VARCHAR(40) NOT NULL DEFAULT '',
--    questionprice decimal(10, 2) NOT NULL DEFAULT 10.0,
--    status int NOT NULL DEFAULT 0,
--    discription VARCHAR(200),
--    createTime timestamp NOT NULL DEFAULT current_timestamp,
--    updateTime timestamp NOT NULL DEFAULT current_timestamp
--);
--CREATE UNIQUE INDEX uqi_expertname ON expert(expertname);
--CREATE UNIQUE INDEX uqi_expert_username ON expert(username);
----表说明
--COMMENT ON TABLE expert IS '达人表';
----字段说明
--COMMENT ON COLUMN expert.id IS '主键ID';
--COMMENT ON COLUMN expert.username IS '用户名称';
--COMMENT ON COLUMN expert.expertname IS '达人昵称';
--COMMENT ON COLUMN expert.companyname IS '何处就职';
--COMMENT ON COLUMN expert.title IS '头衔';
--COMMENT ON COLUMN expert.questionprice IS '提问价格';
--COMMENT ON COLUMN expert.status IS '状态';
--COMMENT ON COLUMN expert.discription IS '状态说明';
--COMMENT ON COLUMN expert.createTime IS '创建时间';
--COMMENT ON COLUMN expert.updateTime IS '更新时间';

-- 用户关注表
CREATE TABLE user_follow(
    id bigserial primary key NOT NULL,
    userid bigserial NOT NULL DEFAULT 0,
    followerid bigserial NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE UNIQUE INDEX uqi_userid_followerid ON user_follow(userid, followerid);

--表说明
COMMENT ON TABLE user_follow IS '用户关注表';
--字段说明
COMMENT ON COLUMN user_follow.id IS '主键ID';
COMMENT ON COLUMN user_follow.userid IS '被关注用户id, followerid关注userid';
COMMENT ON COLUMN user_follow.followerid IS '用户id';
COMMENT ON COLUMN user_follow.createtime IS '创建时间';

CREATE TABLE article(
    id bigserial primary key NOT NULL,
    title VARCHAR(80) NOT NULL DEFAULT '',
    authorid bigint NOT NULL DEFAULT 0,
    code VARCHAR(64) NOT NULL DEFAULT '',
    readprice decimal(10, 2) NOT NULL DEFAULT 0,
    questionid bigint,
    content text,
    status int NOT NULL DEFAULT '1',
    publishtime timestamp,
    createTime timestamp NOT NULL DEFAULT current_timestamp,
    updatetime timestamp NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE article IS '文章表';

COMMENT ON COLUMN article.id IS '主键id';
COMMENT ON COLUMN article.title IS '文章标题';
COMMENT ON COLUMN article.authorid IS '作者id';
COMMENT ON COLUMN article.code IS '区块链编号';
COMMENT ON COLUMN article.createTime IS '创建时间';
COMMENT ON COLUMN article.questionid IS '提问id';
COMMENT ON COLUMN article.readprice IS '阅读价格';
COMMENT ON COLUMN article.content IS '内容';
COMMENT ON COLUMN article.status IS '状态';
COMMENT ON COLUMN article.publishtime IS '发布时间';
COMMENT ON COLUMN article.updatetime IS '更新时间';


--提问表
CREATE TABLE question(
    id bigserial primary key NOT NULL,
    questiontype int NOT NULL DEFAULT 1,
    askuserid bigint NOT NULL DEFAULT 0,
    answerexpertid bigint NOT NULL DEFAULT 0,
    price decimal(10, 2) NOT NULL DEFAULT 0,
    content text,
    status int NOT NULL DEFAULT '1',
    publishtime timestamp,
    createTime timestamp NOT NULL DEFAULT current_timestamp,
    updatetime timestamp NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE question IS '提问表';

COMMENT ON COLUMN question.id IS '主键id';
COMMENT ON COLUMN question.askuserid IS '提问达人id';
COMMENT ON COLUMN question.answerexpertid IS '答题达人id';
COMMENT ON COLUMN question.questiontype IS '问题类型1：达人问答2：不定向问答';
COMMENT ON COLUMN question.createTime IS '创建时间';
COMMENT ON COLUMN question.price IS '提问价格';
COMMENT ON COLUMN question.content IS '问题内容';
COMMENT ON COLUMN question.status IS '状态';
COMMENT ON COLUMN question.publishtime IS '提出时间';
COMMENT ON COLUMN question.updatetime IS '更新时间';

--阅读记录
CREATE TABLE article_read(
    id bigserial primary key NOT NULL,
    userid bigint NOT NULL DEFAULT 0,
    articleid bigint NOT NULL DEFAULT 0,
    price decimal(10, 2) NOT NULL DEFAULT 0,
    createtime timestamp NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE article_read IS '阅读表';

COMMENT ON COLUMN article_read.id IS '主键id';
COMMENT ON COLUMN article_read.userid IS '阅读用户id';
COMMENT ON COLUMN article_read.articleid IS '文章id';
COMMENT ON COLUMN article_read.price IS '阅读价格';
COMMENT ON COLUMN article_read.createtime IS '初次阅读时间';

--收藏表
CREATE TABLE bookmark(
    id bigserial primary key NOT NULL,
    userid bigint NOT NULL DEFAULT 0,
    articleid bigint NOT NULL DEFAULT 0,
    createtime timestamp NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE bookmark IS '收藏';

COMMENT ON COLUMN bookmark.id IS '主键id';
COMMENT ON COLUMN bookmark.userid IS '阅读用户id';
COMMENT ON COLUMN bookmark.articleid IS '文章id';
COMMENT ON COLUMN bookmark.createtime IS '收藏时间';

--点赞表
CREATE TABLE article_good(
    id bigserial primary key NOT NULL,
    userid bigint NOT NULL DEFAULT 0,
    articleid bigint NOT NULL DEFAULT 0,
    type int NOT NULL DEFAULT 1,
    createtime timestamp NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE article_good IS '点赞表';

COMMENT ON COLUMN article_good.id IS '主键id';
COMMENT ON COLUMN article_good.userid IS '阅读用户id';
COMMENT ON COLUMN article_good.articleid IS '文章id';
COMMENT ON COLUMN article_good.type IS '点赞类型 1点赞，-1吐槽';
COMMENT ON COLUMN article_good.createtime IS '点赞时间';
--
----吐槽表
--CREATE TABLE article_bad(
--    id bigserial primary key NOT NULL,
--    userid bigint NOT NULL DEFAULT 0,
--    articleid bigint NOT NULL DEFAULT 0,
--    createtime timestamp NOT NULL DEFAULT current_timestamp
--);
--COMMENT ON TABLE article_bad IS '吐槽表';
--
--COMMENT ON COLUMN article_bad.id IS '主键id';
--COMMENT ON COLUMN article_bad.userid IS '阅读用户id';
--COMMENT ON COLUMN article_bad.articleid IS '文章id';
--COMMENT ON COLUMN article_bad.createtime IS '吐槽时间';

--评论表
CREATE TABLE article_comment(
    id bigserial primary key NOT NULL,
    userid bigint NOT NULL DEFAULT 0,
    articleid bigint NOT NULL DEFAULT 0,
    createtime timestamp NOT NULL DEFAULT current_timestamp,
    content VARCHAR(200) NOT NULL DEFAULT '',
    updatetime timestamp NOT NULL DEFAULT current_timestamp
);
COMMENT ON TABLE article_comment IS '评论表';

COMMENT ON COLUMN article_comment.id IS '主键id';
COMMENT ON COLUMN article_comment.userid IS '评论用户id';
COMMENT ON COLUMN article_comment.articleid IS '文章id';
COMMENT ON COLUMN article_comment.createtime IS '评论时间';
COMMENT ON COLUMN article_comment.content IS '评论内容';
COMMENT ON COLUMN article_comment.updatetime IS '更新时间';


-- 支付订单表
CREATE TABLE payment_order(
    id bigserial primary key NOT NULL,
    targetid bigint NOT NULL DEFAULT 0,
    typeid int NOT NULL DEFAULT 0,
    userid bigint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE UNIQUE INDEX uqi_userid_targetid_typeid ON payment_order(userid, targetid, typeid);

--表说明
COMMENT ON TABLE payment_order IS '支付订单表';
--字段说明
COMMENT ON COLUMN payment_order.id IS '主键ID';
COMMENT ON COLUMN payment_order.userid IS '用户id';
COMMENT ON COLUMN payment_order.targetid IS '目标id';
COMMENT ON COLUMN payment_order.typeid IS '目标类型id, 0表示问题,1表示围观（偷听）';
COMMENT ON COLUMN payment_order.createtime IS '创建时间';


-- 用户反馈表
CREATE TABLE user_feedback(
    id bigserial primary key NOT NULL,
    feedback varchar(1024) NOT NULL DEFAULT '',
    userid bigint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);

--表说明
COMMENT ON TABLE user_feedback IS '用户反馈表';
--字段说明
COMMENT ON COLUMN user_feedback.id IS '主键ID';
COMMENT ON COLUMN user_feedback.userid IS '用户id';
COMMENT ON COLUMN user_feedback.feedback IS '反馈内容';
COMMENT ON COLUMN user_feedback.createtime IS '创建时间';
