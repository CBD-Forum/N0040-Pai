/**
 * Created by yongli.chen on 2017/1/6.
 */
import {Auth} from "../../providers/ts/auth";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {RestApi} from "../../providers/ts/rest/rest-api";
/**
 * Created by yongli.chen on 2016/12/8.
 */
require('bootstrapcss');
require('indexcss');
require('withdrawcss');

let loadModule = function () {
  let header = new Header("module", ".header", () => {
    $("#top-nav-login").hide();
    $("div[class=webNav] .page-title").text("井通币转出").show();
  });
  let footer = new Footer("module", ".footer");
};

let initEvent = function () {
  $(".withdraw-err").hide();
  $("#withdraw-confirm").on('click', function (e) {
    $("#withdraw-confirm").attr({"disabled": "disabled"}).addClass("disabled");
    $(".withdraw-err").hide();
    let fees = $("#fees").val().trim();
    if (fees == null || fees.length < 1) {
      $("#fees-err").show();
      return;
    }
    let address = $("#address").val().trim();
    if (address == null || address.length < 1) {
      $("#address-err").show();
      return;
    }

    let pwd = $("#pwd").val().trim();
    if (pwd == null || pwd.length < 1) {
      $("#pwd-err").show();
      return;
    }
    let restApi = new RestApi();
    let auth = new Auth();
    restApi.transfer({
      amount: fees,
      address: address,
      password: pwd
    }).then((res) => {
      if (res.code != 0 || res.data == null){
        $("#withdraw-confirm").removeAttr("disabled").removeClass("disabled");
        return;
      }
      window.location.href = "./account.html#finance";
    }, (res, err) => {
      if (res.status == 403) {//用户未登录, 跳转到登录页面
        auth.deleteUserInfo();
        return window.location.href = "./login.html?ref=" + window.location.href;
      }
      $("#withdraw-confirm").removeAttr("disabled").removeClass("disabled");
      console.log(err);
    });
  });
};

let init = function () {
  withdraw();
};

let setBalance = function (data) {
  let flag = false;
  let value = 0;
  for (let i = 0; i < data.length; ++i) {
    let item = data[i];
    if (item.currency == '8200000005000020170006000000000020000001') {
      value = item.value;
      flag = true;
      break;
    }
  }
  $("#lbl-balance").text(value + "COINS");
};

let withdraw = function () {
  let restApi = new RestApi();
  let auth = new Auth();
  restApi.get("/v1/user/balance").then((res) => {
    if (res.code != 0 || res.data == null)
      return;
    setBalance(res.data);
  }, (res, err) => {
    if (res.status == 403) {//用户未登录, 跳转到登录页面
      auth.deleteUserInfo();
      return window.location.href = "./login.html?ref=" + window.location.href;
    }
    console.log(err);
  });
};

$(function () {
  loadModule();
  initEvent();
  init();
});
