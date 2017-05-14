/**
 * Created by yongli.chen on 2016/11/25.
 */
import {RestApi} from "../../providers/ts/rest/rest-api";
import {Auth} from "../../providers/ts/auth";
import {Desc} from "./desc";
import {GoodsParams} from "../../providers/ts/common.def";
import {PayNotice} from "../../module/pay-notice/pay-notice";
import {Toast} from "../../providers/ts/toast";
import {WebSocketClient} from "../../providers/ts/websocket-client";

declare var Shower;

export class Product {
  private selector: string = "product";
  private template: string = "";
  private container: string = "";//装载组件的父ID或class
  private isSelectorLoaded: boolean = false;
  private restAPI: RestApi = null;
  private _descClass: Desc = null;
  private goodsId: number = 0;
  private auth: Auth = new Auth();
  private goods: GoodsParams = {} as GoodsParams;
  private bidIndex: number = 1;
  private leaderFlag: number = 0;
  private timestamp: number = 0;//当前时间(服务器)
  private counter: any = -1;
  private payNotice: PayNotice = null;
  private toast: Toast = new Toast();
  private webSocket: WebSocketClient = null;
  private pullFinished: boolean = false;
  private pushList: Array<any> = [];

  constructor(module: string, container: string) {
    this.container = container;
    this.template = './' + module + '/' + this.selector + '.html';
    $.when($.ajax(this.template))
      .then((html) => {
        $("#pm-header").html(html);
        this.isSelectorLoaded = true;
        this.init();
      }, (err) => {
        console.log(err);
      });
    this.payNotice = new PayNotice("module");
  }

  get restApi() {
    return this.restAPI;
  }

  set restApi(restApi: RestApi) {
    this.restAPI = restApi;
  }

  get descClass() {
    return this._descClass;
  }

  set descClass(desc: Desc) {
    this._descClass = desc;
  }

  public init() {
    this.goodsId = this.restAPI.getParameter("id");
    if (!this.goodsId) {
      return this.toast.show({content: "商品不存在!"});
    }
    let userInfo = this.auth.getUserInfo();
    let userId = 0;
    if (userInfo != null) {
      userId = userInfo.userid;
    }
    let self = this;
    this.webSocket = new WebSocketClient({
      userid: userId,
      roomid: self.goodsId,
      callback: function (version, body) {
        self.messageCallback(version, body);
      }
    });
    this.restAPI.getGoodDetail("id=" + this.goodsId).then((res) => {
      if (res.code != 0 || res.data == null)
        return;
      self.goods = res.data;
      self.timestamp = res.timestamp;
      Shower.show({
        data: {
          goods: self.goods,
          list: [],
          maxbidindex: self.goods.totalauction / self.goods.bidinterval
        }
      });
      self.setBidContent(self.goods, res.timestamp);
      self.descClass.init(self.goods);
      self.getBidInfoList();
      self.bindEvent();
    }, (res, err) => {
      console.log(err);
    });
  }

  /**
   * 后端推送的消息处理函数
   * @param version
   * @param body
   */
  private messageCallback(version: number, body: string) {
    let msg = JSON.parse(body);
    if (msg.type == 0) {//出价数据
      this.setBidInfoList(msg);
    } else if (msg.type == 1) {//中标信息
      this.setBidResult(msg);
    } else if (msg.type == 2) {//其他信息推送
      this.setOther(msg);
    }
  }

  private requestBidInfoList(pagination: any): any {
    let self = this;
    let params = "id=" + this.goodsId + "&page=" + pagination.page + "&pageSize=" + pagination.pageSize;
    this.restAPI.getGoodBidInfo(params).then((res) => {
      if (res.code != 0) {
        return self.toast.show({content: "获取拍卖品出价记录失败" + "code=" + res.code});
      }
      let bidInfoList = res.data.list;
      if (bidInfoList != null && bidInfoList.length > 0) {
        if (bidInfoList.length < pagination.pageSize) {
          self.pullFinished = true;
          self.setBidInfoList(res.data);
          return;
        }
        self.setBidInfoList(res.data);

        pagination.page = pagination.page + 1;
        self.requestBidInfoList(pagination);
      } else {
        self.pullFinished = true;
        self.setBidInfoList(null);
      }
    }, (res, err) => {
      console.log(err);
    });
  }

  /**
   * 获取出价记录列表信息
   * */
  private getBidInfoList() {
    this.requestBidInfoList({page: 1, pageSize: 20});
  }

  private setCountDown(bidIndex: number) {
    let html = `
        <span >` + bidIndex + `</span>
        <span >00</span>
        <span >00</span>
        <span >00</span>
        `;
    $("#tiles").html(html);
  }

  /**
   * 格式化竞拍周期信息
   * @param bidInterval：竞拍周期(秒)
   * @param totalTime:总共持续时间(秒)
   * @param startTime:拍品开始时间(秒)
   * @param timestamp:当前服务器时间(秒)
   */
  public startCountDown(bidInterval: number, totalTime: number, startTime: number, timestamp: number) {
    let bidIndex = 0;
    let leftTime;
    if (timestamp >= startTime) {
      bidIndex = Math.floor((timestamp - startTime) / bidInterval + 1);
      leftTime = startTime + bidIndex * bidInterval - timestamp;
    } else {
      leftTime = startTime - timestamp;
    }
    if (this.counter > 0) {
      clearInterval(this.counter);
      this.counter = -1;
    }
    let self = this;
    this.counter = setInterval(() => {
      if (leftTime >= 0) {
        setTimeout(function () {
          self.getCountdown(bidIndex, leftTime);
        }, 1);
      }
      leftTime = leftTime - 1;
      if (leftTime <= 0) {
        bidIndex = bidIndex + 1;
        leftTime = bidInterval;
        if (bidIndex * bidInterval >= totalTime) {//如果已经结束则清除倒计时
          self.toast.show({content: "拍卖已经结束!"});
          clearInterval(this.counter);
          window.location.reload();
        }
      }
    }, 1000);
  }

  private getCountdown(bidTimes: number, leftTime: number) {
    let timeArrays = Product.formatAuctionCircle(leftTime);
    let hours = this.pad(timeArrays[1]);
    let minutes = this.pad(timeArrays[2]);
    let seconds = this.pad(timeArrays[3]);
    let html = `
        <span >` + bidTimes + `</span>
        <span >` + hours + `</span>
        <span >` + minutes + `</span>
        <span >` + seconds + `</span>
        `;
    $("#tiles").html(html);
  }

  private pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /**
   * 根据商品接口设置商品信息
   * @param data
   * @param timestamp
   */
  private setBidContent(data: GoodsParams, timestamp: number) {
    this.setTitle(data.goodsname);
    this.setImages(data);
    this.setStatus(data.status, data.payeddeposit, data.bidedgoods, data.payed);

    $(".btn-bid").show();
    $("#my-auction-price").show();

    this.setBidInterval(data.bidinterval);
    this.setDeposit(data.deposit);
    this.setBasePrice(data.baseprice);
    this.setFixIncPrice(data.fixincprice);
    this.setLeftTime(data.lefttime);
    this.setBidTimes(data.bidtimes);
    this.setAttendNum(data.attendnum);
    this.setVisitCount(data.visitcount);
    this.setBidPrice(data.bidprice, data.baseprice);
    if (data.status == 0) {
      this.startCountDown(data.bidinterval, data.totalauction, data.starttime, Math.floor(timestamp / 1000));
    } else {//设置默认值
      this.setCountDown(data.bidindex);
    }
  }

  private setOther(data: any) {
    if (data.visitcount) {//设置访问人数
      this.setVisitCount(data.visitcount);
    }
  }

  /**
   * 设置中标结果
   * @param bidResult
   */
  private setBidResult(bidResult: any): void {
    clearInterval(this.counter);
    this.setCountDown(this.bidIndex);
    $("#auction-status").removeClass("auction-status-mark-on").addClass("auction-status-mark-over").text("竞拍结束");
    Shower.showWinner(bidResult.address);
    let userInfo = this.auth.getUserInfo();
    if (userInfo != null) {
      if (userInfo.userid == bidResult.userid) {//竞拍中标
        this.goods.bidedgoods = true;
        $(".btn-bid").val("去付款").removeAttr("disabled").removeClass("disabled");
        return;
      }
    }
    //未登录, 没中标的用户
    $(".btn-bid").val("出价竞拍").attr({"disabled": "disabled"}).addClass("disabled");
    $("#" + bidResult.userid + "-" + bidResult.bidindex).val("中标");
  }

  /**
   *
   * @param data
   */
  private setBidInfoList(data: any) {
    if (data) {
      this.pushList.push(data);
    }
    if (!this.pullFinished) {//如果pull还没结束
      return;
    }
    let list = this.pushList;
    this.pushList = [];
    let set = {};
    let len = list.length;
    for (let i = 0; i < len; ++i) {
      let element = list[i];
      let key = element.userid + element.bidindex;
      if (set[key] != null) {//当前一次处理有出现重复的, 继续下一个
        continue;
      }
      set[key] = 1;//标记已经处理
      if (element.visitcount) {//设置访问人数
        this.setVisitCount(element.visitcount);
      }
      if (element.attendnum) {//设置参加人数
        this.setAttendNum(element.attendnum);
      }
      if (element.bidtimes) {//设置出价次数
        this.setBidTimes(element.bidtimes);
      }
      this.appendBidInfoList(element.list);
    }
  }

  /**
   * 设置用户的出价信息
   * @param bidInfo
   */
  private setUserBidPrice(bidInfo: any) {
    if (this.isCurrentUser(bidInfo.userid)) {
      $("#current-price").text("¥" + bidInfo.bidprice.toFixed(2));
    }
  }

  private isCurrentUser(userid: number): boolean {
    let userInfo = this.auth.getUserInfo();
    return userInfo != null && userInfo.userid == userid;
  }

  /**
   * 设置用户的出价信息
   * @param bidInfo
   */
  private setBidIndex(bidInfo: any) {
    this.bidIndex = bidInfo.bidindex;
  }

  private isLeader(bidInfo: any): boolean {
    if (this.leaderFlag == 0) {
      this.leaderFlag = 1;
      return true;
    }
    return bidInfo.bidindex != this.bidIndex;
  }

  private isWinner(bidInfo: any): boolean {
    let counterParty = this.goods.counterparty;
    if (counterParty == null || counterParty == '') {//还未产生中标用户
      return false;
    }
    return bidInfo.address == counterParty && bidInfo.bidindex == this.goods.bidindex;//地址相同且轮次也相同, 则为中标用户
  }

  private appendBidInfoList(bidInfoList: any) {
    if (bidInfoList == null || bidInfoList.length == 0) {
      return;
    }
    let len = bidInfoList.length;
    for (let i = 0; i < len; ++i) {
      let bidInfo = bidInfoList[i];
      bidInfo.userbid = this.isCurrentUser(bidInfo.userid);
      this.setUserBidPrice(bidInfo);//更新用户的出价
      let bidResultId = (bidInfo.userid + "-" + bidInfo.bidindex);
      let record = `
        <tr>
          <td>` + Product.customTimeFormat(bidInfo.timestamp) + `</td>
          <td>¥` + bidInfo.bidprice.toFixed(2) + `</td>
          <td>` + bidInfo.nickname + `</td>
          <td>` + bidInfo.bidindex + `</td>
          <td>` + (bidInfo.userbid ? "是" : "否") + `</td>
          <td id="` + bidResultId + `" class="bid-result">` + (this.isLeader(bidInfo) ? (this.isWinner(bidInfo) ? "中标" : "领先") : "出局") + `</td>
        </tr>
      `;
      if (this.isLeader(bidInfo)) {
        $(".bid-result").each(function (index) {
          if (this.id != bidResultId) {
            $(this).text("出局");
          }
        });
      }
      $("#last-record").after(record);
      Shower.update(bidInfo);
      if (this.isWinner(bidInfo)) {
        Shower.showWinner(bidInfo.address);
      }
      this.setBidIndex(bidInfo);
    }
  }

  private bindEvent() {
    let self = this;
    //交保证金或竞拍或者支付
    $(".btn-bid").on("click", () => {
      let userInfo = self.auth.getUserInfo();
      if (userInfo == null) {
        return window.location.href = "./login.html?ref=" + window.location.href;
      }
      if (self.goods.payeddeposit) {//缴纳保证金
        if (self.goods.bidedgoods) {//竞拍中标,跳转到支付页面
          self.toPay();
        } else {
          self.doAuction();
        }
      } else {
        self.payBond();
      }
    });
  }

  //支付
  private toPay() {
    let self = this;
    this.restApi.createOrderFromDeposit({goodsid: this.goodsId}).then((res) => {
      if (res.code != 0 || res.data == null)
        return;
      let userOrder = res.data;
      window.location.href = "./pay.html?id=" + userOrder.id;
    }, (res, err) => {
      if (res.status == 403) {//用户未登录, 跳转到登录页面
        self.auth.deleteUserInfo();
        return window.location.href = "./login.html?ref=" + window.location.href;
      }
      console.log(err);
    });
  }

  //竞拍出价
  private doAuction() {
    let self = this;
    this.restAPI.doAuction({"goodsid": this.goodsId}).then((res) => {
      if (res.code != 0) {
        return self.toast.show({content: "竞拍失败!"});
      }
      console.log(res.data);
    }, (res, err) => {
      if (res.status == 403) {//用户未登录, 跳转到登录页面
        self.auth.deleteUserInfo();
        return window.location.href = "./login.html?ref=" + window.location.href;
      }
      let json = JSON.parse(res.responseText);
      if (json.code == 5) {//拍卖结束
        self.goods.bidedgoods = res.bidedgoods;
        if (res.bidedgoods) {//中标
          self.setStatus(self.goods.status, self.goods.payeddeposit, self.goods.bidedgoods, self.goods.payed);
        }
      }
      self.toast.show({content: json.msg});
    });
  }

  //交保证金
  private payBond() {
    let self = this;
    window.open("./ensure.html?id=" + this.goodsId, "_blank");
    this.payNotice.show((res) => {
      if (res.status == null || res.status.code)
        return;
      //通过后台请求判断是否缴纳保证金
      self.restAPI.getGoodDetail("id=" + self.goodsId).then((res) => {
        if (res.code != 0 || res.data == null)
          return;
        self.goods = res.data;
        self.setStatus(self.goods.status, self.goods.payeddeposit, self.goods.bidedgoods, self.goods.payed);
      }, (res, err) => {
        console.log(err);
      });
    });
  }

  /**
   * 自定义时间格式化
   * 1.< 60s, 显示为“刚刚”
   * 2.>= 1min && < 60 min, 显示与当前时间差“XX分钟前”
   * 3.>= 60min && < 1day, 显示与当前时间差“今天 XX:XX”
   * 4.>= 1day && < 1year, 显示日期“XX月XX日 XX:XX”
   * 5.>= 1year, 显示具体日期“XXXX年XX月XX日 XX:XX”
   * @param timestamp
   * @returns {any}
   */
  private static customTimeFormat(timestamp: number) {
    let date = new Date(timestamp);
    let curDate = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let curYear = curDate.getFullYear();
    let timeStr;

    if (year < curYear) {
      timeStr = year + '年' + month + '月' + day + '日 ' + Product.formatDateNumber(hour) + ':' + Product.formatDateNumber(minute);
    } else {
      let pastTime = Date.now() - timestamp;
      let pastH = pastTime / (60 * 60 * 1000);
      if (pastH > 24) {
        timeStr = month + '月' + day + '日 ' + Product.formatDateNumber(hour) + ':' + Product.formatDateNumber(minute);
      } else if (pastH >= 1) {
        if (new Date().getHours() < hour) {
          timeStr = '昨天 ' + Product.formatDateNumber(hour) + ':' + Product.formatDateNumber(minute) + '分';
        } else {
          timeStr = '今天 ' + Product.formatDateNumber(hour) + ':' + Product.formatDateNumber(minute) + '分';
        }
      } else {
        let pastM = pastTime / (60 * 1000);
        if (pastM > 1) {
          timeStr = Math.floor(pastM) + '分钟前';
        } else {
          timeStr = '刚刚';
        }
      }
    }
    return timeStr;
  }

  private static formatDateNumber(num: number) {
    return ((num < 10) ? ("0" + num) : num)
  }

  private static formatLeftTime(value) {
    let totalSeconds: number = parseInt(value);// 秒
    let minutes: number = 0;// 分
    let hour: number = 0;// 小时
    let day: number = 0;//天
    if (totalSeconds > 60) {
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds = totalSeconds % 60;
      if (minutes >= 60) {
        hour = Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      if (hour >= 24) {
        day = Math.floor(hour / 24);
        hour = hour % 24;
      }
    }
    let result = "距离结束仅剩:";
    if (day > 0) {
      result += '<font color="#a56322">' + ((day < 10) ? ("0" + day) : day) + "</font>天";
    }
    if (hour > 0) {
      result += '<font color="#a56322">' + ((hour < 10) ? ("0" + hour) : hour) + '</font>时';
    }
    if (minutes > 0) {
      result += '<font color="#a56322">' + ((minutes < 10) ? ("0" + minutes) : minutes) + "</font>分";
    }
    if (totalSeconds > 0) {
      result += '<font color="#a56322">' + ((totalSeconds < 10) ? ("0" + totalSeconds) : totalSeconds) + "</font>秒";
    }

    return result;
  }

  /**
   * 格式化竞拍周期信息
   * @param value
   * @returns {Array<number>}
   */
  private static formatAuctionCircle(value): Array<number> {
    let theTime = parseInt(value);// 秒
    let theTime1: number = 0;// 分
    let theTime2: number = 0;// 小时
    let theTime3: number = 0;//天
    let timeArrays: Array<number> = [];
    if (theTime > 60) {
      theTime1 = theTime / 60;
      theTime = theTime % 60;
      if (theTime1 >= 60) {
        theTime2 = theTime1 / 60;
        theTime1 = theTime1 % 60;
      }
    }
    if (theTime2 >= 24) {
      theTime3 = theTime2 / 24;
      theTime2 = theTime2 % 24;
    }
    timeArrays.push(parseInt(theTime3.toString()));
    timeArrays.push(parseInt(theTime2.toString()));
    timeArrays.push(parseInt(theTime1.toString()));
    timeArrays.push(parseInt(theTime.toString()));

    return timeArrays;
  }

  private setBidInterval(bidInterval: number) {
    let timeArray = Product.formatAuctionCircle(bidInterval);
    let auctionCircleStr = timeArray[0] > 0 ? timeArray[0] + "天" : "";
    auctionCircleStr += timeArray[1] > 0 ? timeArray[1] + "时" : "";
    auctionCircleStr += timeArray[2] > 0 ? timeArray[2] + "分" : "";
    auctionCircleStr += timeArray[3] > 0 ? timeArray[3] + "秒" : "";
    $("#auction-circle").text(auctionCircleStr + "/次");
  }

  private setStatus(status: number, payedDeposit: boolean, bidedGoods: boolean, payed: boolean) {
    if (status == 1) {//已结束
      $("#auction-status").removeClass("auction-status-mark-on").addClass("auction-status-mark-over").text("竞拍结束");
      if (bidedGoods) {//竞拍中标
        if (payed) {
          $(".btn-bid").val("去付款").attr({"disabled": "disabled"}).addClass("disabled");
        } else {
          $(".btn-bid").val("去付款").removeAttr("disabled").removeClass("disabled");
        }
      } else {
        $(".btn-bid").val("出价竞拍");
      }
    } else {//未结束
      $("#auction-status").removeClass("auction-status-mark-over").addClass("auction-status-mark-on").text("正在进行");
      if (payedDeposit) {//
        $(".btn-bid").val("出价竞拍");
      } else {
        $(".btn-bid").val("交保证金");
      }
    }
  }

  private setImages(data: any) {
    if (data.images != null && data.images.length > 0) {
      let img = data.images[0];
      $("#current-auction-img").attr({"src": img});
    }
  }

  private setTitle(goodsName: string) {
    $("#bid-title").text(goodsName);//设置标题
  }

  private setFixIncPrice(fixIncPrice: number) {
    fixIncPrice = Number(fixIncPrice);
    if (fixIncPrice > 0) {//固定加价
      $("#fix-add-price").text("¥" + fixIncPrice.toFixed(2));
      $("#fix-add-price1").text(fixIncPrice.toFixed(2));
    }
  }

  private setLeftTime(leftTime: number) {
    if (leftTime > 0) {
      $("#left-time").html(Product.formatLeftTime(leftTime));
    }
  }

  private setBidPrice(bidPrice: number, basePrice: number) {
    if (bidPrice && bidPrice > 0) {
      $("#current-price").text("¥" + bidPrice.toFixed(2));
    } else {
      $("#current-price").text("¥" + basePrice.toFixed(2));//如果用户没有参与　则他的竞价为基准价格
    }
  }

  private setBidTimes(bidTimes: number) {
    $("#auction-times").text(bidTimes ? bidTimes : 0);//出价次数
  }

  private setAttendNum(attendNum: number) {
    $("#bid-count").text(attendNum ? attendNum : 0);//参与竞拍人数
  }

  private setVisitCount(visitCount: number) {
    $("#bid-total-count").text(visitCount ? visitCount : 0);//围观次数
  }

  private setDeposit(deposit: number) {
    $("#ensure-price").text("¥" + Number(deposit).toFixed(2));
  }

  private setBasePrice(basePrice: number) {
    basePrice = Number(basePrice);//基价
    if (basePrice > 0) {
      $("#base-price").text("¥" + basePrice.toFixed(2));
    }
  }
}
