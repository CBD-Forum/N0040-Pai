// reference css
require('bootstrapcss');
require('indexcss');

var pageDatas = {
  params: {}, // params
  routes: ["panel1", "panel2"],
  defaultRoute: 'panel1' // default Route
};

function initMenu() {
  var modName = window.location.href.split('#')[1];
  modName = modName || pageDatas.defaultRoute;
  $("ul[class=sub-menu] li a").each(function (e) {
    if ('#' + modName === $(this).attr('href')) {
      $(this).addClass("active");
      $(this).parent().parent().show(300);
    }
  });

  loadHtml(modName);
}

function bindMenu() {
  $(document).on('click', '.sidebar .nav .has-sub', function (e) {
    e.stopPropagation();
    $(this).children(".sub-menu").toggle(300);
  });


  $("ul[class=sub-menu] li a").on('click', function (e) {
    e.stopPropagation();

    if ($(this).hasClass("active")) {
      return false;
    }

    $("ul[class=sub-menu] li a").removeClass("active");
    $(this).addClass("active");

    var modName = $(this).attr('href');
    modName = modName.split('#')[1];

    loadHtml(modName);
  });

}

function loadHtml(modName) {
  pageDatas.params = null;
  var htmlPath = '../html/' + modName + '.html';
  var jsPath = './' + modName;

  $.get(htmlPath, [], function (html) {
    $("#container").html(html);
    loadJs(jsPath);
  });
}


function loadJs(jsPath) {

  var currentMod;
  var route = jsPath.substring(jsPath.lastIndexOf('/') + 1);

  if (route === 'panel1') {
   require.ensure([], function (require) {
   currentMod = require(jsPath);
   currentMod.init();
   }, 'panel1');
   }
   else if (route === 'panel2') {
   require.ensure([], function (require) {
   currentMod = require(jsPath);
   currentMod.init(pageDatas.params);
   }, 'panel2');
   }
   else {
   }
}

function initRoute() {
  require.ensure([], function (require) {
    routers = require('./../../providers/js/routes');
    for (var i = 0; i < pageDatas.routes.length; ++i) {
      routers.map(pageDatas.routes[i], function (transition) {
        loadHtml(transition.path);
      });
    }

    routers.init(pageDatas.routes[0]);

  }, 'routes');
}

function initialize() {
  // initMenu();
  // bindMenu();
  initRoute();
}

$(function () {
  initialize();
});

