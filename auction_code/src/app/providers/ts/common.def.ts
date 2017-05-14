/**
 * Created by yongli.chen on 2017/1/13.
 */
/*
 * 说明：商品信息字段
 */
export interface GoodsParams {
  address?: string;//商品钱包地址
  attendnum?: number; //参与人数
  baseprice?: number;//商品拍卖基准价格
  bidindex?: number;//当前出价轮次
  bidinterval?: number ;//拍卖出价时间间隔(秒)
  bidprice?: number;//我的竞拍价
  bidtimes?: number;//总出价次数
  code?: string;//商品编码
  counterparty?: string;//中标用户钱包地址
  createtime?: string ;//商品创建时间
  deposit?: number;//保证金数额
  description?: string;//描述
  fixincprice?: number;//拍卖固定加价
  goodsname?: string;//商品名称
  id?: string;//ID
  images?: Array<string>;//商品图片
  lefttime?: number;//剩余时间
  locked?: number;//锁定字段, 前端暂时没有用
  marketvalue?: number;//市场价
  price?: string;// 拍卖成交价格
  started?: boolean;//是否开始 这个只是通过时间判断, 有些拍卖提前结束了, 这个不准确, 只是用来辅助展示倒计时
  starttime?: number;//商品拍卖开始时间
  status?: number;//商品状态, 0未结束, 1结束
  totalauction?: number ;//拍卖持续时间(秒)
  userid?: string;//用户ID
  visitcount?: number;//围观次数
  payeddeposit?:boolean;//是否缴纳保证金
  bidedgoods?:boolean;//竞拍是否中标
  payed?:boolean;//是否支付
}
