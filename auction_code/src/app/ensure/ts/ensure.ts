import {RestApi} from "../../providers/ts/rest/rest-api";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {Contract} from "./contract";
import {Order} from "./order";
import {Auth} from "../../providers/ts/auth";
/**
 * Created by yongli.chen on 2017/1/9.
 */
require('bootstrapcss');
require('bootstrap_glyphicons_css');
require('indexcss');
require('ensurecss');

let loadModule = function () {
  let header = new Header("module", ".header", () => {
    $("#top-nav-login").hide();
    $("div[class=webNav] .page-title").text("保证金").show();
  });
  let footer = new Footer("module", ".footer");

  let contract = new Contract("ensure", "#contract");
  let order = new Order("ensure", "#order");

  return {
    header: header,
    contract: contract,
    order: order,
    footer: footer
  }
};

let bindEvent = function (module) {
  let order = module.order;

  $("#submit-tips").hide();
  $("#submit-ensure").on("click", function (e) {
    let b = false;
    b = $('#agree').prop('checked');
    if (!b) {
      $("#submit-tips").text("您还没有同意《用户竞拍服务协议》!").show();
      return;
    }
    let receiveNode = $("#add-list").find(".add-selected");
    if(receiveNode == null || receiveNode.length < 1){
      $("#submit-tips").text("您还没有选择收获地址, 如果是新增的地址需要选中地址!").show();
      return;
    }
    let addressIdStr =receiveNode.attr("id");
    this.addressId = parseInt(addressIdStr.substr("name-".length));

    $("#submit-tips").hide();
    let restApi = new RestApi();
    let goodsId = restApi.getParameter("id");
    restApi.createDepositOrder({
      goodsid: goodsId,
      addressid: order.addressId,
      ordercomment: goodsId + "保证金",
      paymenttypeid: 1,
      deliverywayid: 1
    }).then((res) => {
      if (res.code != 0 || res.data == null) {
        return;
      }
      window.location.href = "/pay.html?id=" + res.data;
    }, (res, err) => {
      if (res.status == 403) {//用户未登录, 跳转到登录页面
        let auth = new Auth();
        auth.deleteUserInfo();
        return window.location.href = "./login.html?ref=" + window.location.href;
      }
      console.log(err);
    });

  });
};

$(function () {
  let module = loadModule();
  bindEvent(module);
});
