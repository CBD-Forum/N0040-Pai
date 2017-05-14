/**
 * Created by yongli.chen on 2017/1/6.
 */
import {Auth} from "../../providers/ts/auth";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {RestApi} from "../../providers/ts/rest/rest-api";
import {Toast} from "../../providers/ts/toast";
require('bootstrapcss');
require('bootstrap_glyphicons_css');
require('indexcss');
require('paycss');
declare var QRCode;

let loadModule = function () {

  let header = new Header("module", ".header", () => {
    $("#top-nav-login").hide();
    $("div[class=webNav] .page-title").text("收银台").show();
  });
  let footer = new Footer("module", ".footer");
};
let counter = null;

let checkPayed = function (restApi, orderId) {
  counter = setInterval(() => {
    restApi.get("/v1/order?id=" + orderId).then((res) => {
      if (!res.code) {
        let order = res.data;
        if (order.status != 0) {
          new Toast().show({content: "订单支付成功, 跳转到商户"});
          if (counter) {
            clearInterval(counter);
          }
          window.location.href = "/";
        }
      }
    });
  }, 5000);//5秒钟轮询一次
};

let initEvent = function () {
  let restApi = new RestApi();
  let auth = new Auth();
  let orderId = restApi.getParameter("id");
  restApi.get("/v1/order?id=" + orderId).then((res) => {
    if (!res.code) {
      let order = res.data;
      $("#order-id").text("订单提交成功，请您尽快付款！ 订单号：" + order.ordercode);
      $("#pay-money").text(order.totalprice);
    } else {
      new Toast().show({content: "获取订单信息失败" + res.msg});
    }
  });
  $("#weixinpay").on("click", () => {
    $("#weixinpay").attr({"disabled": "disabled"}).addClass("disabled");
    restApi.get("/v1/wxpay/pay?id=" + orderId)
      .then((res) => {
        if (!res.code) {
          let data = res.data;
          $("#qrcode").empty();
          new QRCode(document.getElementById("qrcode"), data);
          checkPayed(restApi, orderId);
        }
        $("#weixinpay").removeAttr("disabled").removeClass("disabled");
      }, (res, err) => {
        if (res.status == 403) {//用户未登录, 跳转到登录页面
          auth.deleteUserInfo();
          return window.location.href = "./login.html?ref=" + window.location.href;
        }
        let json = JSON.parse(res.responseText);
        if (json.code == 2) {//拍卖结束
          $("#weixinpay").attr({"disabled": "disabled"}).addClass("disabled");
        } else {
          $("#weixinpay").removeAttr("disabled").removeClass("disabled");
        }
        new Toast().show({content: json.msg});
      });
  });

  $("#quick-payment").on("click", function (e) {
    let pwd = $("#pay-pwd").val().trim();
    if (pwd == null || pwd.length < 1) {
      return new Toast().show({content: "支付密码不能为空."});
    }
    restApi.post("/v1/balance/pay", {id: orderId, password: pwd})
      .then((res) => {
        if (!res.code) {
          checkPayed(restApi, orderId);
        }
        $("#quick-payment").removeAttr("disabled").removeClass("disabled");
      }, (res, err) => {
        if (res.status == 403) {//用户未登录, 跳转到登录页面
          auth.deleteUserInfo();
          return window.location.href = "./login.html?ref=" + window.location.href;
        }
        let json = JSON.parse(res.responseText);
        if (json.code == 2) {//拍卖结束
          $("#quick-payment").attr({"disabled": "disabled"}).addClass("disabled");
        } else {
          $("#quick-payment").removeAttr("disabled").removeClass("disabled");
        }
        new Toast().show({content: json.msg});
      });
  });
};

$(function () {
  loadModule();
  initEvent();
});
