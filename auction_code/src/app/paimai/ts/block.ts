import {RestApi} from "../../providers/ts/rest/rest-api";
/**
 * Created by yongli.chen on 2016/11/25.
 */
export class Block {
  private selector: string = "block";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private restAPI: RestApi = null;
  private goodsId: number = 0;

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

  get restApi() {
    return this.restAPI;
  }

  set restApi(restApi: RestApi) {
    this.restAPI = restApi;
  }

  public init() {
    let self = this;
    this.goodsId = this.restAPI.getParameter("id");
    this.restAPI.getBlockChainGoodsLogicCode("id=" + this.goodsId)
      .then((res) => {
        if (res.code != 0 || res.data == null)
          return;
        self.setComputeLogic(res.data);
      }, (err) => {
        console.log(err);
      });

    this.restAPI.getBlockChainGoods("id=" + this.goodsId)
      .then((res) => {
        if (res.code != 0 || res.data == null)
          return;
        self.setGoodsInfo(res.data);
      }, (err) => {
        console.log(err);
      });

    this.restAPI.getBlockChainGoodsBidInfo("id=" + this.goodsId)
      .then((res) => {
        if (res.code != 0 || res.data == null)
          return;
        self.setGoodsBidInfo(res.data);
      }, (err) => {
        console.log(err);
      });
  }

  private setGoodsBidInfo(data: any) {
    if (!data || data.length == 0) {
      return;
    }
    let len = data.length;
    for (let i = 0; i < len; ++i) {
      let item = data[i];
      let record = `
        <tr>
          <td class="col-md-2" style="word-break: break-all;">` + item.amount.value + `(` + item.amount.currency + `)` + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + item.counterparty + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + item.date + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + item.fee + `</td>
          <td class="col-md-2" style="word-break: break-all;" >` + item.hash + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + item.memos[0].MemoData + `</td>
        </tr>  
      `;
      $("#price-list").append(record);
    }
  }

  setGoodsInfo(data: any) {
    if (!data || data.length == 0) {
      return;
    }
    let goodsRecord = data[0];
    let record = `
        <tr >
          <td class="col-md-2" style="word-break: break-all;">` + goodsRecord.amount.value + `(` + goodsRecord.amount.currency + `)` + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + goodsRecord.counterparty + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + goodsRecord.date + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + goodsRecord.fee + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + goodsRecord.hash + `</td>
          <td class="col-md-2" style="word-break: break-all;">` + goodsRecord.memos[0].MemoData + `</td>
        </tr>       `;
    $("#commodity-list").append(record);
  }

  setComputeLogic(data: any) {
    $("#block-chain-logic-code").append(`<textarea class="col-md-12" style="height: 1200px; word-break: break-all;">` + data + `</textarea>`);
  }
}
