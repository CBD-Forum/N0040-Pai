# 表结构设计
    这里表结构使用json格式，　因为没有存在mysql里面 

* 用户表: 
```{
    "name": "goods_assist", 
    "createTime": 1481033648477, 
    "salt": "4MHtXUV1/sxPSKu6ogLYSB9qFAtGP7Go82/CdvXaFxdlN9ZlB401/lFa+g3A2Nfgc6gqVa6RMV7MFmENcGlKaMkHEUwabzAfYFWq8dsEDvOdx9d+/anynxAmx0QayB4ZLiBsbHt26noFbxlFmfebnEDkLhMNMwSlwqvtY0bq4+I=", 
    "hash": "ggSOiZV4SjDji0iM9Ar003oOJAEUrZEQNhAI8je3CCpsimz0/hoVmihOep9a65LwCSls7/mQllglzEAuJBGM7TTTtZNx7rhpZal/EsE+Mn4UiSlbSu9LzELP7QZNf1ZNX7r1x+cbdFmbK4WeM47CNznpP0R+BjlNzEG5sddRflA=", 
    "phone": "18600653783", 
    "email": "heipackermail@gmail.com", 
    "wallet": {
        "address": "jpzbdV46WPBHaJHMhk5YKaW87tJniUbZTc", 
        "secret": "spmXTVqSPuz94B8zHHQotGCitHJW1"
    }
}
```

* 商品表:
```
{
    "name": "紫砂壶2", //商品名称
    "code": "zsh2", //商品代码
    "images": ["test.jpg"],//商品相关图片列表
    "description": "这是一个历史悠久的紫砂壶, 现在拍卖.", //商品描述
    "starttime": 1481124979, //商品拍卖开始时间
    "baseprice": 12, //商品拍卖基准价格
    "fixincprice": 2, //拍卖固定加价
    "bidinterval": 5, //拍卖出价时间间隔(秒)
    "totalAuction": 300, //拍卖持续时间(秒)
    "marketvalue": 130,//商品市场价
    "auctionValue": 240, //最后拍卖价格
    "ended": true,
    "counterparty": "jB9kFX93AgdHtrPDCE8iy86rDkAN2K4U2",//最后中标用户, 如果没有人中标是null, undefined, ''
    "createTime": 1481125009450, //创建时间
    "salt": "WnJvRusmt7XZi/v3M0TmlEp3ZEcSSiMc15W5S7hHJInv7tVpu/uRyeiZTCShLzqhOIHmWh1gBQolCJ67tXvH5+Et+XOsuzu5RNbBUcJ46tALACvxvsaRDWWNGZgWhEot/b3nE14SFVMJ0lS0m6Mh7Uxvlxd+6fqhyI1tn8+NrEE=", 
    "hash": "MMOeclp8w2/CwkMNQiXeOOikWBRRUWFdN5qBoXmTYYzzKI8jJ0GKnCeKQYPuUY7yOPR4QPwaPsUbMzQxYCGpqm1imJuOLbOQSsCgC5m93AaveRqgIZutZdIIpHXwxn6kpKKMih+0Ro94LXXP9T0FRmWxeRa7hk7Q6hlzYIBJ4fE=", 
    "wallet": {
        "address": "jB9kFX93AgdHtrPDCE8iy86rDkAN2K4U2", 
        "secret": "sh1WLwTaJYKKAfNZ52cgPaW9HS2DH"
    }
}
```
