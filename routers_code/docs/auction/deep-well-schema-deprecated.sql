-- 用户关注表
CREATE TABLE user_follower(
    id bigserial primary key NOT NULL,
    userid bigserial NOT NULL DEFAULT 0,
    followerid bigserial NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);

--表说明
COMMENT ON TABLE user_follower IS '用户关注表';
--字段说明
COMMENT ON COLUMN user_follower.id IS '主键ID';
COMMENT ON COLUMN user_follower.userid IS '用户id, userid关注followerid';
COMMENT ON COLUMN user_follower.followerid IS '关注用户id';
COMMENT ON COLUMN user_follower.createtime IS '创建时间';

-- 问题分类表
CREATE TABLE question_class(
    id bigserial primary key NOT NULL,
    classname VARCHAR(1024) NOT NULL DEFAULT '',
    classcode VARCHAR(32) NOT NULL DEFAULT '',
    createTime timestamp NOT NULL DEFAULT current_timestamp
);

--表说明
COMMENT ON TABLE question_class IS '问题分类表';
--字段说明
COMMENT ON COLUMN question_class.id IS '主键ID';
COMMENT ON COLUMN question_class.classname IS '分类名称';
COMMENT ON COLUMN question_class.classcode IS '分类代码';
COMMENT ON COLUMN question.createtime IS '创建时间';

-- 问题表
CREATE TABLE question(
    id bigserial primary key NOT NULL,
    question VARCHAR(1024) NOT NULL DEFAULT '',
    price int NOT NULL DEFAULT 0,
    answerprice int NOT NULL DEFAULT 0,
    userid bigint NOT NULL DEFAULT 0,
    classid bigint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);
CREATE INDEX idx_userid ON question(userid);

--表说明
COMMENT ON TABLE question IS '问题表';
--字段说明
COMMENT ON COLUMN question.id IS '主键ID';
COMMENT ON COLUMN question.question IS '问题内容';
COMMENT ON COLUMN question.price IS '回答问题价值';
COMMENT ON COLUMN question.answerprice IS '知识价值';
COMMENT ON COLUMN question.userid IS '用户id';
COMMENT ON COLUMN question.classid IS '分类id';
COMMENT ON COLUMN question.createtime IS '创建时间';


-- 活动表
CREATE TABLE activity(
    id bigserial primary key NOT NULL,
    backgroundid bigserial NOT NULL DEFAULT 0,
    title VARCHAR(64) NOT NULL DEFAULT '',
    sponsor VARCHAR(64) NOT NULL DEFAULT '',
    place VARCHAR(64) NOT NULL DEFAULT '',
    description VARCHAR(1024) NOT NULL DEFAULT '',
    userid bigint NOT NULL DEFAULT 0,
    price int NOT NULL DEFAULT 0,
    starttime timestamp NOT NULL DEFAULT current_timestamp,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);

--表说明
COMMENT ON TABLE activity IS '活动表';
--字段说明
COMMENT ON COLUMN activity.id IS '主键ID';
COMMENT ON COLUMN activity.backgroundid IS '背景图id';
COMMENT ON COLUMN activity.title IS '活动标题';
COMMENT ON COLUMN activity.sponsor IS '活动主办方';
COMMENT ON COLUMN activity.place IS '活动地点';
COMMENT ON COLUMN activity.description IS '活动描述';
COMMENT ON COLUMN activity.userid IS '用户id';
COMMENT ON COLUMN activity.price IS '活动价格';
COMMENT ON COLUMN activity.starttime IS '活动开始时间';
COMMENT ON COLUMN activity.createtime IS '创建时间';

-- 活动嘉宾表
CREATE TABLE activity_guest(
    id bigserial primary key NOT NULL,
    activityid bigserial NOT NULL DEFAULT 0,
    userid bigint NOT NULL DEFAULT 0,
    createTime timestamp NOT NULL DEFAULT current_timestamp
);

--表说明
COMMENT ON TABLE activity IS '活动嘉宾表';
--字段说明
COMMENT ON COLUMN activity.id IS '主键ID';
COMMENT ON COLUMN activity.activityid IS '活动id';
COMMENT ON COLUMN activity.userid IS '用户id';
COMMENT ON COLUMN activity.createtime IS '创建时间';