/**
 * Created by yongli.chen on 2016/12/8.
 */
export class RestApi {
  public baseUrl: string = "";

  constructor() {
  }

  public ajax(url: string): JQueryPromise<any> {
    return $.when($.ajax(url));
  }

  public get(url: string): JQueryPromise<any> {
    return $.when($.get(url));
  }

  public post(url: string, data: any): JQueryPromise<any> {
    return $.when($.post(url, data));
  }

  public getParameter(key): any {
    let reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if (r != null)
      return (r[2]);
    return null;
  };

  public register(data: any, path: string = "/v1/register"): JQueryPromise<any> {
    return this.post(this.baseUrl + path, data);
  }

  public sendCode(data: any, path: string = "/v1/sendCode"): JQueryPromise<any> {
    return this.post(this.baseUrl + path, data);
  }

  /*登录*/
  public login(data: any, path: string = "/v1/login"): JQueryPromise<any> {
    return this.post(this.baseUrl + path, data);
  }

  /*登出*/
  public logout(path: string = "/v1/logout"): JQueryPromise<any> {
    return this.post(this.baseUrl + path, {});
  }

  /*获取商品列表*/
  public getGoodsList(params: string, path: string = "/v1/goods/list"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path + "?" + params);
  }

  /*获取商品详细信息*/
  public getGoodDetail(params: string, path: string = "/v1/goods"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path + "?" + params);
  }

  /*获取商品计算代码*/
  public getBlockChainGoodsLogicCode(params: string, path: string = "/v1/block-chain/compute-script"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path + "?" + params);
  }

  public getBlockChainGoods(params: string, path: string = "/v1/block-chain/goods"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path + "?" + params);
  }

  public getBlockChainGoodsBidInfo(params: string, path: string = "/v1/block-chain/bid-info"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path + "?" + params);
  }

  /*竞拍商品*/
  public doAuction(data: any, path: string = "/v1/do-auction"): JQueryPromise<any> {
    return this.post(this.baseUrl + path, data);
  }

  /*获取商品的出价信息*/
  public getGoodBidInfo(params: string, path: string = "/v1/auction-list"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path + "?" + params);
  }

  /*修改用户信息*/
  public updateUser(data: any, path: string = "/v1/user"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path,
      type: 'PUT',
      data: data
    }));
  }
  /**
   * 获取地址列表
   * */
  public getAddressList(path:string="/v1/addresses"): JQueryPromise<any> {
    return this.ajax(this.baseUrl + path);
  }
  //删除地址
  public deleteAddress(params: string, path: string = "/v1/address"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path + "?" + params,
      type: 'DELETE'
    }));
  }

  //设置默认地址
  public setDefaultAddress(params: string, path: string = "/v1/default-address"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path + "?" + params,
      type: 'PUT'
    }));
  }

  //添加新地址
  public addAddress(data: any, path: string = "/v1/address"): JQueryPromise<any> {
    return this.post(this.baseUrl + path, data);
  }

  //更新地址
  public updateAddress(data: any, path: string = "/v1/address"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path,
      type: 'PUT',
      data: data
    }));
  }

  //创建保证金订单
  public createDepositOrder(data: any, path: string = "/v1/order/deposit"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path,
      type: 'POST',
      data: data
    }));
  }

  //创建订单
  public createOrderFromDeposit(data: any, path: string = "/v1/order/fromdeposit"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path,
      type: 'POST',
      data: data
    }));
  }

  //转账
  public transfer(data: any, path: string = "/v1/user/transfer"): JQueryPromise<any> {
    return $.when($.ajax({
      url: this.baseUrl + path,
      type: 'POST',
      data: data
    }));
  }
}
