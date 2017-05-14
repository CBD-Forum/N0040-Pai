/**
 * Created by yongli.chen on 2017/1/9.
 */
/**
 * 地址信息接口
 **/

export interface AddressInfo {
  id?: string;//id号
  receivername?: string;//姓名
  receiverphone?: string;//电话号码
  provincecode?: string;//省级代码
  provincename?: string;//省级名称
  citycode?: string;//市级代码
  cityname?: string;//市级名称
  districtcode?: string;//区级代码
  districtname?: string;//区级名称
  detailaddress?: string;//街道地址
  status?: number;//默认地址状态：1为默认
}
