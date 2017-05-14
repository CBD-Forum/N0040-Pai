/**
 * Created by yongli.chen on 2016/12/8.
 */

require('bootstrapcss');
require('indexcss');
require('paimaicss');

import {Header} from "../../module/header/header";
import {Footer} from "../../module/footer/footer";
import {Product, Desc, Promise, Record, Block} from "./index";
import {RestApi} from "../../providers/ts/rest/rest-api";
let loadModule = function () {
  let header = new Header("module", ".header", () => {
    /* $("div[class=webNav]").children().each(function (e) {
     $(this).hide();
     });*/
    $("div[class=webNav] ul").hide();
    $("#top-nav-login").hide();
  });
  let rest = new RestApi();
  let footer = new Footer("module", ".footer");

  let pro = new Product("paimai", "#pm-header");
  pro.restApi = rest;

  let desc = new Desc("paimai", "#pro-desc");
  pro.descClass = desc;
  let record = new Record("paimai", "#price-record");
  let promise = new Promise("paimai", "#seller-promise");

  let block = new Block("paimai", "#block-chain");
  block.restApi = rest;
};

$(function () {
  loadModule();
});
