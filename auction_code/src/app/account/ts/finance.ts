import {RestApi} from "../../providers/ts/rest/rest-api";
/**
 * Created by yongli.chen on 2016/11/25.
 */
export class Finance {
  private selector: string = "finance";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private restApi: RestApi = new RestApi();
  private username: string = "";

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
    let self = this;
    this.restApi.get("/v1/user/balance").then((res) => {
      if (res.code != 0 || res.data == null)
        return;
      self.setBalance(res.data);
      self.setOrderHistoryList(res.data);
    }, (res, err) => {
      console.log(err);
    });
  }

  private setBalance(data: any) {
    $.when($.getJSON("./asset/config/config.json"))
      .then((res) => {
        let currency = res.coins.currency;
        let flag = false;
        for (let i = 0; i < data.length; ++i) {
          let item = data[i];
          if (item.currency == currency) {
            $('#lbl-balance').text(item.value + "COINS");
            flag = true;
            break;
          }
        }
        if (!flag) {
          $('#lbl-balance').text("0.00COINS");
        }
      }, (err) => {
        console.log(err);
      });
  }

  private setOrderHistoryList(data: any) {
    let curSheet = $("#cur-balance-sheet1");
    curSheet.empty();
    let html = `
      <tr>
          <td class="text-center ">2016-11-02 16:06:18</td>
          <td class="text-center ">￥0.00</td>
          <td class="text-center ">
            -
          </td>
          <td class="text-left ">
            订单<42372699543>的退款申请财务已受理完毕，正在向银行提交退款申请，请等待款项到账。
          </td>
        </tr>
    `;
    curSheet.append(html);
  }

}
