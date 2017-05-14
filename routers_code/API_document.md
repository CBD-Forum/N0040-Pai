
# routers App API文档

## 出价模块

### 1、出价接口

#### 请求URL

/v1/do-auction

#### 请求方式

POST

#### 参数

| 参数名 | 必选 | 类型 | 说明 |
| ------------ | ------------- | ------------ | ------------ |
| goodsCode | 是  | string | 商品代码 |


#### 返回示例

````
{
  "code": 0,
  "data": {
    "list": [
      {
        "address": "j4UKoMEfK5gXPC91zJVKLHkupkra4JSRur",
        "userBid": true,
        "timestamp": 1481794950,
        "bidindex": 1,
        "bidPrice": "2000",
        "bidUserIndex": 1
      }
    ],
    "maxBidIndex": 1,
    "minBidUserIndex": 1,
    "auctionAddress": "j4UKoMEfK5gXPC91zJVKLHkupkra4JSRur",
    "auctioned": true
  }
}
````

#### 返回参数说明

<a id="do_auction_return_example"></a>

| 参数名 | 类型 | 说明 | 备注 |
| ------------ | ------------ | ------------ | ------------ |
| code | int | 返回状态码 | 0说明正常 |
| list | list | 出价列表 |
| address | string | 用户地址 |
| userBid | bool | 是否是当前用户的出价 |
| timestamp | long | 出价时间戳 |
| bidindex | int | 拍卖轮次 |
| bidPrice | int | 出价价格 |
| bidUserIndex | int | 用户出价序号 |
| maxBidIndex | int | 最大出价轮次 |
| minBidUserIndex | int | 最大出价轮次中最小出价序号 |
| auctionAddress | string | 中标地址 |
| auctioned | bool | 是否成功中标 |

