/**
 * Created by yongli.chen on 2017/1/4.
 */

/**
 * 交易订单信息
* */
export interface TradeInfo{
  id?:string;
  createtime?:string;//订单日期
  images?:Array<string>;//图片地址
  goodsname?:string;//交易名称
  amount?:number;//数量
  price?:number;//单价
  totalprice?:number;//实际付款
  paymenttypename?:string;//支付方式：网银支付、井通支付、微信支付、支付宝支付、货到付款
  status?:number;//0等待付款、1等待收货、2完成交易、3取消订单
}


