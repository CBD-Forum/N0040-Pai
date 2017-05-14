/**
 * Created by yongli.chen on 2016/12/7.
 */
import {Auth} from "../../providers/ts/auth";
import {RestApi} from "../../providers/ts/rest/rest-api";
import {Toast} from "../../providers/ts/toast";

export class Header {
  private selector: string = "header";
  private template: string = "";
  private className: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private auth: Auth = new Auth();
  private toast: Toast = new Toast();
  private restApi: RestApi = new RestApi();

  constructor(module: string, className: string, callback?: Function) {
    this.className = className;
    let self = this;
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $(className).html(html);
        self.isSelectorLoaded = true;
        if (callback) {
          callback();
        }
        self.init();
      }, (res, err) => {
        console.log(err);
      });
  }

  private setLoginStatus(nickname: string) {
    if (nickname) {
      $("#top-nav-login").show();
      $("#top-nav-logout").hide();
      $("#top-nav-login #login-name").text("您好，" + nickname);
    } else {
      $("#top-nav-login").hide();
      $("#top-nav-logout").show();
    }
  }

  public init() {
    let self = this;
    let userInfo = this.auth.getUserInfo();
    if (userInfo == null) {//如果不存在,　请求服务器获取当前用户, 这种情况一般是第三方登录方式
      let type = this.restApi.getParameter("type");
      if (type == "1") {
        this.restApi.get("/v1/user").then((res) => {
          let nickname = null;
          if (res.code == 0) {
            let user = res.data;
            let username = user ? user.username : null;
            if (username) {
              self.auth.addUserInfo({
                userid: user.id,
                username: username,
                nickname: user.nickname
              });
              nickname = user.nickname;
            } else {
              console.log(res);
            }
          } else {
            self.toast.show({content: "登录失败" + res.msg});
          }
          self.setLoginStatus(nickname);
        });
      } else {
        this.setLoginStatus(null);
      }
    } else {
      this.setLoginStatus(userInfo["nickname"]);
    }

    $("#top-nav-login #safety-quit").on("click", function (e) {
      self.restApi.logout().then((res) => {
        self.auth.deleteUserInfo();
        window.location.href = "/login.html";
      }, (res, err) => {
        self.auth.deleteUserInfo();
        window.location.href = "/login.html";
      });
    });
  }

  get auth1() {
    return this.auth;
  }

  set auth1(auth: Auth) {
    this.auth = auth;
  }
}
