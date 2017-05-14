/**
 * Created by yongli.chen on 2016/11/25.
 */
import {TradeInfo} from "./account.def";
import {RestApi} from "../../providers/ts/rest/rest-api";
import {Auth} from "../../providers/ts/auth";
import {Toast} from "../../providers/ts/toast";
export class Trade {
  private selector: string = "trade";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private username: string = "";
  private tradeInfo: TradeInfo = {} as TradeInfo;
  private restApi = new RestApi();
  private toast: Toast = new Toast();

  constructor(module: string, containerId: string) {
    this.containerId = containerId;
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $(containerId).html(html);
        this.isSelectorLoaded = true;
        this.init();
      }, (err) => {
        console.log(err);
      });
  }

  public init() {
    this.getTradeList();
  }

  private getTradeList() {
    let self = this;
    this.restApi.get("/v1/orders").then((res) => {
      if (!res.code) {
        let tradeList = res.data;
        for (let i = 0; i < tradeList.length; ++i) {
          let orderItem = self.appendOrderHtml(tradeList[i]);
          if (orderItem) {
            $("#trade-list").append(orderItem);
          }
        }
      } else {
        self.toast.show({content: "获取地址列表失败" + res.msg});
      }
    }, (res, err) => {
      if (res.status == 403) {//用户未登录, 跳转到登录页面
        let auth = new Auth();
        auth.deleteUserInfo();
        return window.location.href = "./login.html?ref=" + window.location.href;
      }
      console.log(err);
    });
  }

  private appendOrderHtml(orderInfo: any): string {
    let statusNode = this.adopterStatus(orderInfo);
    let userSubOrderList = orderInfo.userSubOrderList;
    if (!userSubOrderList) {
      return null;
    }
    let userSubOrder = userSubOrderList[0];
    if (!userSubOrder) {
      return null;
    }
    let goods = userSubOrder.goods;
    if (!goods) {
      return null;
    }
    return `
        <tbody id=' ` + orderInfo.id + `'>
          <tr style="height: 20px;border: none;">
          </tr>
          <tr>
            <td colspan="5" style="color:grey;border: 1px solid #ccc;">
              <span>` + orderInfo.createtime + `</span>
              <span style="margin-left: 10px;">订单号：` + orderInfo.ordercode + `</span>
            </td>
          </tr>
          <tr style="border:1px solid #ccc;border-radius:5px;text-align: left; margin:10px auto;">
            <td>
              <div class="row col-md-2" style="width: 100px;">
                <a href="javascript:void(0);">
                  <img src="` + goods.images[0] + `" width="80" height="80">
                </a>
              </div>
              <div class="col-md-10">` + goods.goodsname + (orderInfo.ordercomment != '' ? "(" + orderInfo.ordercomment + ")" : '') + `</div>
            </td>
            <td class="text-center">￥` + (userSubOrder.ordertype == 1 ? goods.deposit : goods.price - goods.deposit) + `</td>
            <td class="text-center">` + userSubOrder.amount + `</td>
            <td class="text-center">
              <div class="row">￥` + userSubOrder.subtotalprice + `</div>
            </td>
            <td class="text-center">
              <div class="row">
                ` + statusNode + `
              </div>
              <div class="row">
                <a href="/order.html?id=` + orderInfo.id + `" style="color:#a56322;" data-id="` + orderInfo.id + `">
                  订单详情
                </a>
              </div>
            </td>
          </tr>
        </tbody>
    `;
  }

  private adopterStatus(orderInfo: any): string {
    let statusNode = ``;
    switch (orderInfo.status) {
      case 0:
        statusNode = `
            <a href="/pay.html?id=` + orderInfo.id + `" style="color:red;" data-id="` + orderInfo.id + `">
                  等待付款
            </a>
          `;
        break;
      case 1:
        statusNode = `
            <span style="color:red;" data-id="` + orderInfo.id + `">
                  等待收货
            </span>
          `;
        break;
      case 2:
        statusNode = `
            <span style="color: #67b168;" data-id="` + orderInfo.id + `">
                  完成交易
            </span>
          `;
        break;
      case 3:
        statusNode = `
            <span data-id="` + orderInfo.id + `">
                  取消订单
            </span>
          `;
        break;
      default:
        break;
    }
    return statusNode;
  }
}
