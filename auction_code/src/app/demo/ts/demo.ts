/**
 * Created by yongli.chen on 2016/11/28.
 */
require('bootstrapcss');
require('indexcss');
import {Routes} from "../../providers/ts/routes";

import {Panel1} from "./panel1";
import {Panel2} from "./panel2";
import * as Component  from "./index";

var pageDatas = {
  params: {}, // params
  routes: ["panel1", "panel2"],
  defaultRoute: 'panel1' // default Route
};

var loadComponent = function (name) {
  if (name === 'panel1') {
    let panel1 = new Panel1("demo","#container");
  }
  else if (name === 'panel2') {
    let panel2 = new Panel2("demo","#container");
  }
  else {
  }

};

var initRoute = function () {
  let routes = new Routes();
  for (let i = 0; i < pageDatas.routes.length; ++i) {
    routes.map(pageDatas.routes[i], function (transition) {
      let str = transition.path.toLowerCase();
      let name = str.replace(/\b(\w)|\s(\w)/g, function(m){
        return m.toUpperCase();
      });
      debugger;
      let instance = new Component[name]("demo", "#container");
    });
  }
  routes.init(pageDatas.routes[0]);
};


var demo = function () {
   initRoute();
};

$(function () {
  debugger;
  demo();
});
