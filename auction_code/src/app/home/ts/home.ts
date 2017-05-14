require('bootstrapcss');
require('indexcss');
require('homecss');
import {Routes} from "../../providers/ts/routes";
//import {Auth} from "../../providers/ts/auth";
import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import * as Component from "./index";

var pageDatas = {
  params: {}, // params
  routes: ["transaction", "faq", "about"],
  defaultRoute: 'transaction' // default Route
};

var initMenu = function () {
  let modName = window.location.href.split('#')[1];
  modName = modName || pageDatas.defaultRoute;

  $("div[class=webNav] ul li a").each(function (e) {
    if ('#' + modName === $(this).attr('href')) {
      $("div[class=webNav] ul").children(".selected").removeClass("selected");
      $(this).parent().addClass("selected");
    }
  });
};

var bindMenu = function () {
  $("div[class=webNav] ul li a").on('click', function (e) {
    e.stopPropagation();
    if ($(this).parent().hasClass("selected")) {
      return false;
    }
    $("div[class=webNav] ul").children(".selected").removeClass("selected");
    $(this).parent().addClass("selected");
  });

};

var initRoute = function () {
  let routes = new Routes();
  for (let i = 0; i < pageDatas.routes.length; ++i) {
    routes.map(pageDatas.routes[i], function (transition) {
      let str = transition.path.toLowerCase();
      let name = str.replace(/\b(\w)|\s(\w)/g, function (m) {
        return m.toUpperCase();
      });
      let instance = new Component[name]("home", "#router-outlet");
    });
  }
  routes.init(pageDatas.defaultRoute);
};

var loadModule = function () {
  let header = new Header("module", ".header", () => {
    let  html = `
       <ul>
          <li class="selected"><a href="#transaction">首页</a></li>
          <li class=""><a href="#faq">常见问题</a></li>
          <li class=""><a href="#about">关于</a></li>
       </ul>
    `;
    $("div[class=webNav]").append(html);
    initMenu();
    bindMenu();


  });
  let footer = new Footer("module", ".footer");
};

$(function () {
  initRoute();

  loadModule();
});
