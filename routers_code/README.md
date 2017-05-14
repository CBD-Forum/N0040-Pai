# 项目说明：
* routers是整个后端的所有的工程, 当前有拍卖,　抽奖两个工程
* 具体部署说明请看子工程的README.MD


# 开发流程：
* git checkout develop
* git checkout -b feature_20161206_1
* 开发feature后执行 git push -u origin feature_20161206_1:feature_20161206_1
* 在gitlab上发起一个merge request等待其他成员合并到develop
* 发布的版本要合并到master


# 部署流程：

* 修改ObjConfig.js里的root配置(一个用来存储文件的目录)
* install & run
 - option: npm install nrm -g 
 - npm install
 - cd bin && node www.js

* 访问localhost:8888/docs/index.html, 查看后端相关接口文档


* 测试帐户（密码都是 1234）：
 - Weijia: 为抽奖主帐户, 所有发给他的交易皆视为抽奖, 所有这个帐户发出的交易皆视为中奖, memo上边有活动号,区别不同的抽奖活动
 - user001,user002,user003,user004,为测试抽奖用户,　可注册新的帐户进行测试,　建议密码也为1234, 现在一个用户对应一个json文件,　在bin/users下,　纯测试用,　线上不能这么用,　性能太差
 - 现在的页面，已经抽过的用户，抽奖按钮为模糊，可抽的为清晰的

* 抽奖相关的业务逻辑
 - 见test/test.js
 
* 查看堆栈信息
 kill -USR2 <pid>