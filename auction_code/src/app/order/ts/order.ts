/**
 * Created by yongli.chen on 2017/1/10.
 */
import {RestApi} from "../../providers/ts/rest/rest-api";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {Auth} from "../../providers/ts/auth";
import {Toast} from "../../providers/ts/toast";

require('bootstrapcss');
require('bootstrap_glyphicons_css');
require('indexcss');
require('ordercss');

let restApi = new RestApi();
let orderId = restApi.getParameter("id");

let loadModule = function () {
  let header = new Header("module", ".header", () => {
    $("#top-nav-login").hide();
    $("div[class=webNav] .page-title").text("订单详情").show();
  });
  let footer = new Footer("module", ".footer");
};

let setPaymentType = function (paymentTypeId: number) {
  if (paymentTypeId == 1) {
    $("#payment-type-id").text("付款(微信)")
  }
};

let setAddressContent = function (address: any) {
  if (address == null) {
    return;
  }
  $("#address-user-name").text(address.receivername + "(" + address.receiverphone + ")");
  let content = address.provincename + address.cityname + address.districtname + address.detailaddress;
  $("#address").text(content);
};

let setOrderContent = function (order: any) {
  setPaymentType(order.paymenttypeid);
  setAddressContent(order.address);

  $("#total-price").text("¥" + order.totalprice);

  let userSubOrderList = order.userSubOrderList;
  let userSubOrder = userSubOrderList[0];
  let html = `<tr>
        <td colspan="4" style="color:grey;border: 1px solid #ccc;">
          <span>` + order.createtime + `</span>
          <span style="margin-left: 10px;">订单号：` + order.ordercode + `</span>
        </td>
      </tr>
      <tr style="border:1px solid #ccc;border-radius:5px;text-align: left; margin:10px auto;">
        <td>
          <div class="row col-md-2" style="width: 100px;">
            <a href="javascript:void(0);">
              <img src="` + userSubOrder.images[0] + `" width="80" height="80">
            </a>
          </div>
          <div class="col-md-10">` + userSubOrder.goodsname + (order.ordercomment != '' ? "(" + order.ordercomment + ")" : '') + `</div>
        </td>
        <td class="text-center">￥` + userSubOrder.price + `</td>
        <td class="text-center">` + userSubOrder.amount + `</td>
        <td class="text-center">
          <div class="row">￥` + userSubOrder.subtotalprice + `</div>
        </td>
      </tr>`;
  $("#trade-list").append(html);
  $("#total-price1").text("¥" + order.totalprice);
  $("#last-total-price").text("¥" + order.totalprice);
  $("#actual-amount").text("¥" + order.totalprice);
};

let bindEvent = function () {
  restApi.get("/v1/order?id=" + orderId).then((res) => {
    if (res.code != 0) {
      return new Toast().show({content: "获取订单信息失败!"});
    }
    let order = res.data;
    setOrderContent(order);
  }, (res, err) => {
    if (res.status == 403) {//用户未登录, 跳转到登录页面
      let auth = new Auth();
      auth.deleteUserInfo();
      return window.location.href = "./login.html?ref=" + window.location.href;
    }
    console.log(err);
  });
};
$(function () {
  loadModule();
  bindEvent();
});
