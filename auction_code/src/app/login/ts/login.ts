import {Toast} from "../../providers/ts/toast";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {Auth} from "../../providers/ts/auth";
import {RestApi} from "../../providers/ts/rest/rest-api";
/**
 * Created by Administrator on 2016/11/27.
 */
require('bootstrapcss');
require('indexcss');
require('logincss');

let auth = new Auth();

let loginInit = function () {
  $(".login-btn").on("click", function (e) {
    login();
  });
  $("#login-pwd").on("keydown", function (e) {
    var key = e.which;
    if (key == 13) {
      login();
    }
  });
  $.when($.getJSON("./asset/config/config.json"))
    .then((res) => {
      if (res.thirdParty.jingtum && res.thirdParty.jingtum.length > 0) {
        let jingtumLoginUrl = res.thirdParty.jingtum;
        let restApi = new RestApi();
        let ref = restApi.getParameter("ref");
        if (ref) {
          if (jingtumLoginUrl.lastIndexOf("?") > 0) {
            jingtumLoginUrl += "&next=" + ref;
          } else {
            jingtumLoginUrl += "?next=" + ref;
          }
        }
        $("#login-jingtum").attr({"href": jingtumLoginUrl});
      }
      if (res.thirdParty.weixin && res.thirdParty.weixin.length > 0) {
        $("#login-wechat").attr({"href": res.thirdParty.weixin});
      }
    }, (err) => {
      console.log(err);
    });

};

let login = function () {
  let name = $("div[class=login-box] #login-name").val().trim();
  let pwd = $("div[class=login-box] #login-pwd").val().trim();
  if ((name == null || name.length < 1) &&
    (pwd == null || pwd.length < 1)) {
    $("div[class=login-box] .msg-error").show().text("请输入帐号和密码");
  }
  else if (name == null || name.length < 1) {
    $("div[class=login-box] .msg-error").show().text("请输入帐号");
  }
  else if (pwd == null || pwd.length < 1) {
    $("div[class=login-box] .msg-error").show().text("请输入密码");
  } else {
    let data = {
      "username": name,
      "password": pwd
    };
    $(".login-btn").attr({"disabled": "disabled"}).addClass("disabled");
    let restApi = new RestApi();
    restApi.login(data).then((res) => {
      if (res.code) {
        $(".login-btn").removeAttr("disabled").removeClass("disabled");//将按钮可用
        return new Toast().show({content: res.msg});
      }
      let user = res.data;
      auth.addUserInfo({
        userid: user.id,
        username: user.username,
        nickname: user.nickname
      });
      let ref = restApi.getParameter("ref");
      if (ref) {
        window.location.href = ref;
      } else {
        window.location.href = "/index.html";
      }
      $(".login-btn").removeAttr("disabled").removeClass("disabled");//将按钮可用
    }, (res) => {
      if (res.responseJSON && res.responseJSON.code) {
        new Toast().show({content: res.responseJSON.msg});
      }
      $(".login-btn").removeAttr("disabled").removeClass("disabled");//将按钮可用
    });
  }
};

let loadModule = function () {
  let header = new Header("module", ".header", (res) => {
    $("div[class=webNav] ul").hide();
    $("#top-nav-login").hide();
    $(".header").css({border: "none"});
    $("div[class=webNav] .page-title").text("欢迎登录").show();
  });
  let footer = new Footer("module", ".footer");
  //删除登录信息
  auth.deleteUserInfo();
};

$(function () {
  loginInit();
  loadModule();
});
