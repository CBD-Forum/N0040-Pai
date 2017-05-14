/**
 * Created by yongli.chen on 2016/12/8.
 */

require('bootstrapcss');
require('bootstrap_glyphicons_css');
require('indexcss');
require('accountcss');

import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {Routes} from "../../providers/ts/routes";
import * as Component from "./index";

let pageDatas = {
  params: {}, // params
  routes: ["activity", "address","finance", "msg", "setting", 'trade'],
  defaultRoute: 'setting' // default Route
};

let loadModule = function () {
  let header = new Header("module", ".header", () => {
    $("#top-nav-login").hide();
    $("div[class=webNav] .page-title").text("帐号设置").show();
  });
  let footer = new Footer("module", ".footer");
};

let initRoute = function () {
  let routes = new Routes();
  for (let i = 0; i < pageDatas.routes.length; ++i) {
    routes.map(pageDatas.routes[i], function (res) {
      let str = res.path.toLowerCase();
      $("nav a").each(function (e) {
        if ('#' + str === $(this).attr('href')) {
          $("nav").children(".selected").removeClass("selected");
          $(this).addClass("selected");
          $("#panel-title").text($(this).text());
        }
      });

      let name = str.replace(/\b(\w)|\s(\w)/g, function (m) {
        return m.toUpperCase();
      });
      let instance = new Component[name]("account", "#router-outlet");
      instance.username = "张三";
    });
  }
  routes.init(pageDatas.defaultRoute);
};

$(function () {
  loadModule();

  initRoute();
});
