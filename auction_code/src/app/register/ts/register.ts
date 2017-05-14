import {RestApi} from "../../providers/ts/rest/rest-api";
import {Auth} from "../../providers/ts/auth";
import {Toast} from "../../providers/ts/toast";
/**
 * Created by yongli.chen on 2016/12/6.
 */
require('bootstrapcss');
require('indexcss');
require('registercss');
let VALIDATE_TIME = 60;
let toast = new Toast();

let userReg = function () {
  //暂时置灰
  $("#validate-btn").attr({"disabled": "disabled"}).addClass("disabled");

  $("#register").on('click', (e) => {
    let username = $("#userName").val().trim();
    if (username.length < 6) {
      alert("帐号名称不能为空,　长度不能少于6个字符");
      return;
    }
    let confirmedPassword = $("#pwd1").val().trim();
    let password = $("#pwd").val().trim();

    if (password != confirmedPassword) {
      alert("输入的密码不一致");
      return;
    }
    let code = $("#code").val().trim();
    if (code.length < 1) {
      alert("邀请码不能为空");
      return;
    }
    let phone = $("#tel").val().trim();
    if (phone.length < 1) {
      alert("手机号不能为空");
      return;
    }
    let smsCode = $("#validator").val();
    if (smsCode.length < 1) {
      alert("验证码不能为空");
      return;
    }

    let restApi = new RestApi();
    let data = {
      "username": username,
      "password": password,
      "confirmedPassword": confirmedPassword,
      "phone": phone,
      "email": $("#email").val().trim(),
      "code": code,
      "smsCode": smsCode
    };
    $("#register").attr({"disabled": "disabled"}).addClass("disabled");
    restApi.register(data).then((res) => {
      $("#register").removeAttr("disabled").removeClass("disabled");
      if (res.code != 0) {
        return toast.show({content: res.msg});
      }
      let auth = new Auth();
      let user = res.data;
      auth.addUserInfo({
        userid: user.id,
        username: user.username,
        nickname: user.nickname
      });
      window.location.href = "/index.html";
    }, (res, err) => {
      $("#register").removeAttr("disabled").removeClass("disabled");
      toast.show({content: res.responseJSON.msg});
    });
  });

  $("#validate-btn").on('click', (e) => {
    let phone = $("#tel").val().trim();
    if (phone.length < 1) {
      alert("手机号不能为空");
      return;
    }
    $("#validate-btn").addClass("disabled");
    let restApi = new RestApi();
    restApi.sendCode({
      "phone": phone
    }).then((res) => {
      if (res.code != 0) {
        return alert(res.msg);
      }
      let intervalTime = VALIDATE_TIME;//获取验证码的间隔时间
      let interval = setInterval(() => {
        $("#validate-btn").val((--intervalTime) + "秒后重发");
        if (intervalTime <= 0) {
          intervalTime = VALIDATE_TIME;
          $("#validate-btn").removeClass("disabled").val("获取验证码");
          clearInterval(interval);
        }
      }, 1000);
    }, (res, err) => {
      console.log(err);
    });
  });
};

$(function () {
  userReg();
});
