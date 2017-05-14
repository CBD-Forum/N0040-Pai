# 拍卖业务流程：
* 1.对每一个需要拍卖的商品创建一个商品帐号(紫砂壶)goods_account1, 一个辅助帐号goods_assist_account2(这里如果可以自己给自己支付可以不用这个帐号)
* 2.帐号goods_account1调用/accounts/goods_account1/payments?validated=true给goods_account1做一次支付, 将拍卖规则信息存储到memo里面, 
    拍卖规则信息主要包括:
    ```
    trans_type(类型, auction),
    description(规则描述),
    start_time(开始时间), 
    base_price(低价), 
    fix_inc_price(固定加价), 
    bid_interval(出价间隔), 
    total_auction(拍卖持续时间),
    computer_script(计算脚本)
    ```

* 3.帐号goods_account1调用/accounts/goods_account1/payments?validated=true给goods_account1做多次支付, 将拍卖的计算脚本存储到memo里面, 
    拍卖规则信息主要包括:
    ```
    trans_type(类型, auction_script),
    index(在计算脚本范围内的索引顺序),
    function_name(函数名字),
    function(函数脚本)
    ```

* 4.用户user002出价base_price(底价) + fix_inc_price(固定加价) * bid_index(第几次出价), 调用/accounts/user002/payments?validated=true给goods_account1支付, 
    出价数据放在memos, 主要包括:
    ```
    trans_type(类型, auction),
    bid_price(出价),
    bid_index(出价轮次),
    bid_user_index(用户出价的顺序),
    bid_timestamp(用户出价时间)
    ```

* 5.查看每次出价结果/accounts/account1/transactions, 显示每次竞价结果(用户的出价顺序, 出价时间, 出价列表)


* 6.拍卖结束执行步骤2, 3中交易里的memo里的computer_script(计算脚本).


* 7.计算脚本逻辑: 
    * 7.1 通过/accounts/account1/transactions接口获取当前商品的所有拍卖交易, 找到出价轮次最高, 当前轮次出价序号最小的中标用户user0019; 
    * 7.2 调用/accounts/goods_account1/payments?validated=true接口给user0019做一次支付, 说明这个用户已经中标了;
    ```
    trans_type(类型, auction_bid),
    bid_index(论次),
    bid_user_index(出价序号)
    ```
    * 7.3 调用/accounts/user0019/payments?validated=true给goods_account1做一次支付transaction_price(成交价格), 用户支付他的出价;
    * 7.4 最后将goods_account1帐号下的井通全部转移给black_account1(某个固定帐号), 这样交易完成.


* 8.拍卖结束.
