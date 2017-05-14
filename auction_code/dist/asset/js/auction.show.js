/**
 * Created by weijia on 17-1-5.
 */
(function (global, factory) {

  if (typeof module === "object" && typeof module.exports === "object") {
    // For CommonJS and CommonJS-like environments where a proper `window`
    // is present, execute the factory and get jQuery.
    // For environments that do not have a `window` with a `document`
    // (such as Node.js), expose a factory as module.exports.
    // This accentuates the need for the creation of a real `window`.
    // e.g. var jQuery = require("jquery")(window);
    // See ticket #14549 for more info.
    module.exports = global.document ?
      factory(global, true) :
      function (w) {
        if (!w.document) {
          throw new Error("jQuery requires a window with a document");
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

  // Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function (window, noGlobal) {

  function start(){
      var data = {"code":0,"data":{"list":[{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484544253737,"bidindex":15,"bidprice":720,"biduserindex":1,"winner":true},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484544206536,"bidindex":14,"bidprice":690,"biduserindex":1},{"address":"jBZBRTqTUSXBCDUukbuMFzXLrTCBJtvYRR","nickname":"awbu**","userbid":false,"timestamp":1484544120373,"bidindex":13,"bidprice":660,"biduserindex":1},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484544100287,"bidindex":12,"bidprice":630,"biduserindex":2},{"address":"j9k3UCAza7fKz3EXEE5XWazrovfC3ewbTh","nickname":"Weij**","userbid":true,"timestamp":1484544078448,"bidindex":12,"bidprice":630,"biduserindex":1},{"address":"jBZBRTqTUSXBCDUukbuMFzXLrTCBJtvYRR","nickname":"awbu**","userbid":false,"timestamp":1484544051495,"bidindex":11,"bidprice":600,"biduserindex":2},{"address":"j9k3UCAza7fKz3EXEE5XWazrovfC3ewbTh","nickname":"Weij**","userbid":true,"timestamp":1484544048878,"bidindex":11,"bidprice":600,"biduserindex":1},{"address":"j9k3UCAza7fKz3EXEE5XWazrovfC3ewbTh","nickname":"Weij**","userbid":true,"timestamp":1484543980805,"bidindex":10,"bidprice":570,"biduserindex":1},{"address":"j9k3UCAza7fKz3EXEE5XWazrovfC3ewbTh","nickname":"Weij**","userbid":true,"timestamp":1484543916500,"bidindex":9,"bidprice":540,"biduserindex":2},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484543884218,"bidindex":9,"bidprice":540,"biduserindex":1},{"address":"j9k3UCAza7fKz3EXEE5XWazrovfC3ewbTh","nickname":"Weij**","userbid":true,"timestamp":1484543845936,"bidindex":8,"bidprice":510,"biduserindex":1},{"address":"j9k3UCAza7fKz3EXEE5XWazrovfC3ewbTh","nickname":"Weij**","userbid":true,"timestamp":1484543802089,"bidindex":7,"bidprice":480,"biduserindex":2},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484543781125,"bidindex":7,"bidprice":480,"biduserindex":1},{"address":"jaV9xvE5ZsU1KTVB8R23qTPrSJzVWura7X","nickname":"alfa**","userbid":false,"timestamp":1484543652135,"bidindex":5,"bidprice":420,"biduserindex":1},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484543632112,"bidindex":4,"bidprice":390,"biduserindex":1},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484543524824,"bidindex":3,"bidprice":360,"biduserindex":3},{"address":"jNvmMB546eDPkRiK4JEU9Cq9iqNJUDk8er","nickname":"maom**","userbid":false,"timestamp":1484543520735,"bidindex":3,"bidprice":360,"biduserindex":1},{"address":"jNvmMB546eDPkRiK4JEU9Cq9iqNJUDk8er","nickname":"maom**","userbid":false,"timestamp":1484543487853,"bidindex":2,"bidprice":330,"biduserindex":3},{"address":"jaV9xvE5ZsU1KTVB8R23qTPrSJzVWura7X","nickname":"alfa**","userbid":false,"timestamp":1484543481281,"bidindex":2,"bidprice":330,"biduserindex":2},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484543478044,"bidindex":2,"bidprice":330,"biduserindex":1},{"address":"jNvmMB546eDPkRiK4JEU9Cq9iqNJUDk8er","nickname":"maom**","userbid":false,"timestamp":1484543442894,"bidindex":1,"bidprice":300,"biduserindex":3},{"address":"jaV9xvE5ZsU1KTVB8R23qTPrSJzVWura7X","nickname":"alfa**","userbid":false,"timestamp":1484543432345,"bidindex":1,"bidprice":300,"biduserindex":2},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484543409370,"bidindex":1,"bidprice":300,"biduserindex":1}],"maxbidindex":15,"minbiduserindex":1,"auctionaddress":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","auctioned":false,"goods":{"id":"9","goodsname":"测试商品2004","code":"ceshipaimai2004","address":"jswJj7E3fDfMuyALfEMRykMJoYBLux4z9C","description":"测试商品, 大家快来参加哦","starttime":1484543400,"baseprice":300,"fixincprice":30,"bidinterval":60,"totalauction":1800,"marketvalue":30000,"visitcount":202,"bidindex":15,"status":1,"locked":1484544480,"counterparty":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","createtime":"2017-01-16T04:53:18.199Z","userid":"0","price":"720.00","deposit":"10.00","images":["http://pai.skyfromwell.com/v1/obj-store?id=1285997748.jpg","http://pai.skyfromwell.com/v1/obj-store?id=1285997748.jpg"],"started":true,"lefttime":0,"bidprice":630,"bidtimes":7,"attendnum":5,"payeddeposit":true,"bidedgoods":false,"payed":false},"bidprice":720,"bidtimes":7,"attendnum":5}};
      // var data = {"code":0,"data":{"list":[{"address":"j4mWDFBKf9xXXorgnQhAXvU2rcJrqTfXgD","nickname":"test**","userbid":false,"timestamp":1484471224954,"bidindex":3,"bidprice":360,"biduserindex":2},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484471160415,"bidindex":3,"bidprice":360,"biduserindex":1,"winner":true},{"address":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","nickname":"heip**","userbid":false,"timestamp":1484470789503,"bidindex":1,"bidprice":300,"biduserindex":1}],"maxbidindex":3,"minbiduserindex":1,"auctionaddress":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","auctioned":false,"goods":{"id":"6","goodsname":"测试商品2001","code":"ceshipaimai2001","address":"jnQxvNQTj9QGPD37KWmJx5vpH9bbK7emT1","description":"测试商品, 大家快来参加哦","starttime":1484470740,"baseprice":300,"fixincprice":30,"bidinterval":180,"totalauction":1800,"marketvalue":30000,"visitcount":57,"bidindex":3,"status":1,"locked":1484471820,"counterparty":"jJfH9Vyh7S4jvRxFfFQRi9jcGQTUoykfiW","createtime":"2017-01-15T08:58:28.468Z","userid":"0","price":"360.00","deposit":"10.00","images":["http://pai.skyfromwell.com/v1/obj-store?id=1285997748.jpg","http://pai.skyfromwell.com/v1/obj-store?id=1285997748.jpg"],"started":true,"lefttime":0,"bidprice":-1,"bidtimes":0,"attendnum":2,"payeddeposit":false,"bidedgoods":false,"payed":false},"bidprice":360,"bidtimes":0,"attendnum":2}};
      show(data);
  }

  function createMarker(color){
    var p = layer.path('M0,0L8,4L0,8');
    p.attr({
      fill:'none',
      stroke:color
    });
    var m = p.marker(0, 0, 8, 8, 8, 4);
    return m;
  }

  function lineTo(layer, color, fromX, fromY, toX, toY, toRadius, animation){
    var line;
    var m = createMarker(color);
    if(toRadius && toRadius > 0){
      var fx = parseInt(fromX);
      var fy = parseInt(fromY);
      var tx = parseInt(toX);
      var ty = parseInt(toY);

      var dist = Math.sqrt((tx - fx) * (tx - fx) + (ty - fy) * (ty - fy));
      var ratio = toRadius / dist;
      toX = fx + (tx - fx) * (1.0 - ratio);
      toY = fy + (ty - fy) * (1.0 - ratio);
    }
    if(animation){
      line = layer.line(fromX, fromY, fromX, fromY);
      line.attr({
        stroke:color,
        markerEnd:m
      });
      line.animate({
        'x2': toX,
        'y2': toY
      }, 800);
    }else{
      line = layer.line(fromX, fromY, toX, toY);
      line.attr({
        stroke:color,
        markerEnd:m
      });
    }
    return line;
  }

  function connect(layer, user, fromLevel, toLevel, targetObject, levelMap, animation){
    var circle = user.circle;
    var targetCircle = targetObject.circle;
    var fromLine = levelMap[fromLevel];
    var toLine = levelMap[toLevel];
    var lineColor = getUserColor(user);

    var fx = (fromLevel == -1 ? circle.attr('cx') : fromLine.attr('x1'));
    var fy =  circle.attr('cy');
    var tx = (toLine == null ? targetCircle.attr('cx') : toLine.attr('x1'));
    var ty = (toLine == null ? targetCircle.attr('cy') : fy);
    var r = (toLine == null ? targetCircle.attr('r') : 0);

    var line = lineTo(layer, lineColor, fx, fy, tx, ty, r, animation);
    user.connects.push(line);
  }

  function getUserColor(user){
    if(user.winner){
      return '#990000';
    }else if(user.current){
      return '#009900';
    }else{
      return '#9c9c9c';
    }
  }

  function createUser(layer, user, x, y){
    var name = user.name;
    var userColor = getUserColor(user);

    var text = layer.text(10, y + 5, name);
    text.attr({
      'fontSize':10,
      'fill':userColor
    });
    if(user.current){
      var currentText = layer.text(2, y + 5, '>');
      currentText.attr({
        'fontSize':10,
        'fill':userColor
      });
      user.currentIndicator = currentText;
    }
    var userCircle = layer.circle(x, y, 6);
    userCircle.attr({
      fill:userColor,
      stroke:userColor,
      strokeWidth: 1
    });
    user.text = text;
    user.circle = userCircle;
  }

  function target(layer, name, price, bounds, maxLevel){
    var targetX = getLevelX(bounds, maxLevel, maxLevel);
    var y = bounds.y + bounds.height/2;
    var nameText = layer.text(targetX + 15, y - 3, name);
    nameText.attr({
      'fontSize':10
    });
    var priceText = layer.text(targetX + 15, y + 9, '市场价: ' + price);
    priceText.attr({
      'fontSize':10
    });

    var targetCircle = layer.circle(targetX, y, 10);
    targetCircle.attr({
      fill:'#990000',
      stroke:'#990000',
      strokeWidth: 2
    });
    return {
      circle:targetCircle,
      nameText:nameText,
      priceText:priceText
    };
  }

  function getLevelSpace(rect, max){
    return (rect.width - 120) / (max + 2);
  }

  function getLevelX(rect, current, max){
    return parseInt(rect.x + (current + 1) * getLevelSpace(rect, max));
  }

  function level(layer, rect, current, max, axisData){
    var x1 = getLevelX(rect, current, max);
    var y1 = rect.y;
    var x2 = x1;
    var y2 = rect.y + rect.height;
    var text = layer.text(x1, y1 - 2, (axisData.basePrice + axisData.priceInterval * current) + '');
    text.attr({
      'text-anchor':'middle',
      'fontSize':10
    });
    var line = layer.line(x1, y1, x2, y2);
    line.attr({
      stroke:'#9c9c9c',
      strokeWidth:0.5
    });
    return line;
  }

  function getAxisData(data){
    return {
      startTime:data.data.goods.starttime,
      timeInterval:data.data.goods.bidinterval,
      basePrice:data.data.goods.baseprice,
      priceInterval:data.data.goods.fixincprice
    };
  }

  function getGoodName(data){
    return data.data.goods.goodsname;
  }

  function getGoodPrice(data){
    return data.data.goods.marketvalue + '元';
  }

  function maxBidIndex(data){
    return data.data.maxbidindex;
  }

  function getWinner(data){
    return data.data.goods.counterparty;
  }

  function bidList(data){
    return data.data.list;
  }

  function update(item){
    var userState = addUser(item);
    var user = userState.user;
    var isCreated = userState.isCreated;

    var bounds = resize();
    if(isCreated){
      var i = users.length - 1;
      createUser(nodeLayer, user, bounds.x, bounds.y + lineHeight/2 + lineHeight * i);

      for(var i = 0; i < maxLevel; i ++) {
        var line = levelMap[i];
        line.attr('y2', bounds.y + bounds.height);
      }

      var cy = bounds.y + bounds.height/2;
      targetObject.nameText.attr('y', cy - 3);
      targetObject.priceText.attr('y', cy + 9);
      targetObject.circle.attr('cy', cy);
    }
    addConnect(item, true);
  }

  function showWinner(winner){
    var winnerUser = userMap[winner];
    if(winnerUser != null){
      winnerUser.winner = true;
      var color = getUserColor(winnerUser);
      if(winnerUser.currentIndicator){
        winnerUser.currentIndicator.attr('stroke', color);
      }
      winnerUser.text.attr('fill', color);
      winnerUser.circle.attr('fill', color);
      var m = createMarker(color);
      for(var i = 0; i < winnerUser.connects.length; i ++){
        var line = winnerUser.connects[i];
        line.attr('stroke', color);
        line.attr('markerEnd', m);
      }
      var winnerLastIndex = lastUserIndexMap[winner];
      connect(edgeLayer, winnerUser, winnerLastIndex, maxLevel + 1, targetObject, levelMap, true);
    }
  }

  var userMap = {};
  var users = [];
  var levelMap = {};
  var lastUserIndexMap = {};
  var lineHeight = 24;
  var maxLevel;
  var layer;
  var nodeLayer, edgeLayer;
  var targetObject;

  function resize(){
    var svg = document.getElementById('svg');
    var pdiv = svg.parentNode;
    var bounds = {
      x:250,
      y:12,
      width:Math.max(480, pdiv.clientWidth - 300),
      height:Math.max(36, users.length * lineHeight)
    };
    balance._.$(document.getElementById('svg'), {width:bounds.x + bounds.width, height:bounds.y + bounds.height});
    return bounds;
  }

  function addUser(item){
    var name = item.address;
    var user = userMap[name];
    var isCreated = false;
    if(user == null){
      isCreated = true;
      user = {
        name:name,
        text:null,
        circle:null,
        connects:[],
        current:item.userbid,
        winner:false
      };
      users.push(user);
      userMap[name] = user;
    }
    return {
      user:user,
      isCreated:isCreated
    }
  }

  function addConnect(item, animation){
    var name = item.address;
    var user = userMap[name];
    var index = item.bidindex - 1;
    var lastIndex = lastUserIndexMap[name] == null ? -1 : lastUserIndexMap[name];
    lastUserIndexMap[name] = index;
    connect(edgeLayer, user, lastIndex, index, targetObject, levelMap, animation);
  }

  function show(data){
    maxLevel = maxBidIndex(data);
    var list = bidList(data);
    for(var i = 0; i < list.length; i ++){
      var item = list[i];
      addUser(item);
    }

    layer = balance.layer('#svg');
    layer.clear();
    edgeLayer = layer.group();
    nodeLayer = layer.group();

    var levelLayer = layer.group();
    var bounds = resize();

    var axisData = getAxisData(data);
    for(var i = 0; i < maxLevel; i ++) {
      var levelLine = level(levelLayer, bounds, i, maxLevel, axisData);
      levelMap[i] = levelLine;
    }

    var text = layer.text(bounds.x, bounds.y - 2, '单位: 元');
    text.attr({
      'text-anchor':'middle',
      'fontSize':10
    });
    for(var i = 0; i < users.length; i ++){
      var user = users[i];
      createUser(nodeLayer, user, bounds.x, bounds.y + lineHeight/2 + lineHeight * i);
    }

    list.sort(function(a, b){
      if(a.bidindex == b.bidindex){
        return a.bid_timestamp - b.bid_timestamp;
      }else{
        return a.bidindex - b.bidindex;
      }
    });

    var targetName = getGoodName(data);
    var targetPrice = getGoodPrice(data);
    targetObject = target(nodeLayer, targetName, targetPrice, bounds, maxLevel);

    for(var i = 0; i < list.length; i ++){
      var item = list[i];
      addConnect(item);
    }

    var winner = getWinner(data);
    showWinner(winner);
  }

  var Shower = {
    show:show,
    update:update,
    showWinner:showWinner,
    start:start
  };
  if (!noGlobal) {
    window.Shower = Shower;
  }

  return Shower;
}));
