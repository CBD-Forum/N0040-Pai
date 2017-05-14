/**
 * Created by yongli.chen on 2016/11/25.
 */
import {RestApi} from "../../providers/ts/rest/rest-api";

export class Transaction {
  private selector: string = "transaction";
  private template: string = "";
  private containerId: string = "";//装载组件的父ID
  private isSelectorLoaded: boolean = false;
  private restApi = new RestApi();
  private serverTime: number = null;//毫秒
  private typeId: number = -1;
  private page: number = 1;
  private pageSize: number = 4;

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
    $(".typeid-btn").on("click", function (event) {
      $(".auction-list").empty();
      self.typeId = $(this).data("typeid");
      self.requestGoodsList(
        {
          typeid: self.typeId
        },
        {
          page: 1,
          pageSize: self.pageSize
        });
    });
    this.requestGoodsList(null, {
      page: 1,
      pageSize: this.pageSize
    });
    this.scrollBottomRequest();
  }

  private scrollBottomRequest() {
    let self = this;
    let BOTTOM_OFFSET = 500;
    $(document).ready(function () {
      $(window).scroll(function () {
        let $currentWindow = $(window);
        //当前窗口的高度
        let windowHeight = $currentWindow.height();
        //当前滚动条从上往下滚动的距离
        let scrollTop = $currentWindow.scrollTop();
        //当前文档的高度
        let docHeight = $(document).height();
        //当 滚动条距底部的距离 + 滚动条滚动的距离 >= 文档的高度 - 窗口的高度
        //换句话说：（滚动条滚动的距离 + 窗口的高度 = 文档的高度）  这个是基本的公式
        if ((BOTTOM_OFFSET + scrollTop) >= docHeight - windowHeight) {
          self.page += 1;
          let params = null;
          if (self.typeId >= 0) {
            params = {typeid: self.typeId};
          }
          self.requestGoodsList(params, {
            page: self.page,
            pageSize: self.pageSize
          });
        }
      });
    });
  }

  private requestGoodsList(query, pagination) {
    let params = '';
    if (query && query.typeid) {
      params += "typeid=" + query.typeid;
    }
    if (params != '') {
      params += "&";
    }
    params += "page=" + pagination.page + "&pageSize=" + pagination.pageSize;
    this.restApi.getGoodsList(params).then((res) => {
      if (res == null || res.code != 0 || res.data == null)
        return;
      let index = 0;
      this.serverTime = res.timestamp;
      for (let i = 0; i < res.data.length; i = i + 2) {
        let html = "<div class='row default-margin'>";
        index = i;
        html += this.addGoods(res.data[i]);
        if ((i + 1) < res.data.length) {
          html += this.addGoods(res.data[i + 1]);
          index = i + 1;
        }
        html += "</div>";
        $(".auction-list").append(html);
      }
    }, (res, err) => {
      console.log(err);
    });
  }

  public addGoods(good: any): string {
    let startTime = good.starttime * 1000;
    let endTime = startTime + good.totalauction * 1000;

    let startTimeDate = new Date(startTime);//毫秒
    let fullYear = startTimeDate.getFullYear();
    let month = startTimeDate.getMonth();
    let day = startTimeDate.getDate();
    let hours = startTimeDate.getHours();
    let minutes = startTimeDate.getMinutes();
    let seconds = startTimeDate.getSeconds();
    let startTimeStr = fullYear + "-" + (month + 1 ) + "-" + day + " " + Transaction.formatDateNumber(hours) + ":" + Transaction.formatDateNumber(minutes) + ":" + Transaction.formatDateNumber(seconds);
    let basePrice = Number(good.baseprice).toFixed(2);
    let status = "";
    if (this.serverTime < startTime) {
      status = "即将开始";
    } else if (good.status == 0 && this.serverTime >= startTime && this.serverTime <= endTime) {
      status = "进行中";
    } else if (good.status == 1 || this.serverTime > endTime) {
      status = "已结束";
    }
    let img = (good.images && good.images.length > 0) ? good.images[0] : "";

    return `
    <div class="col-md-6 text-left default-margin">
      <a href="./paimai.html?id=` + good.id + `" target="_blank">
        <img src="` + img + `" class="auction-img-normal">
      </a>

      <div class="text-center auction-time-span">
        <span ></span>
        <span>开始时间:</span>
        <span>` + startTimeStr + `</span>
      </div>
      <div class="title">` + good.goodsname + `</div>
      <div class="col-md-3 text-left price">￥` + basePrice + `</div>
      <div class="col-md-4 text-left visit-count">
        <span>围观人数:</span>
        <span>` + good.visitcount + `</span>
      </div>
      <div class="col-md-5 text-right status">
        <div class="triangle-left"></div>
        <div class="rectangle">` + status + `</div>
      </div>
    </div>
    `;
  }

  private static formatDateNumber(num: number) {
    return ((num < 10) ? ("0" + num) : num)
  }
}
