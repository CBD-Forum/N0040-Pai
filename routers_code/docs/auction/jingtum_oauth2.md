# 井通app帐号对接流程：

* 前端提供一个登录入口, 跳转链接格式http://localhost:1337/oauth2/authorization?client_id=f1450890-c2f8-11e6-8734-6d09def7&redirect_uri=http://localhost:8888/v1/access/jingtum/oauth2?next=http://www.baidu.com
* http://localhost:1337/oauth2/authorization是井通提供的授权页面;
* client_id是井通提供给我们应用的客户端id识别码;
* redirect_uri是我们应用提供给井通的回调地址, 这里的next参数前端同学可以根据需求设置(前端希望后端跳转到那个前端页面);
* 前端判断是否登录状态, 需要判断cookie名称id是否存在, 如果需要获取当前的用户id是谁需要将id的值用base64解码一下, 然后转换为json, user对象就是用户相关信息 

