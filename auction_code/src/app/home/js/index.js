// reference css
require('bootstrapcss');
require('indexcss');

var pageDatas = {
  params: {}, // params
  routes:["home","hmr","menu1","menu2","menu3","menu5","menu6"]
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

 // loadHtml(modName);
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
    //loadHtml(modName);
  });
}

function loadHtml(modName) {

  pageDatas.params = null;
  var htmlPath = './home/html/' + modName + '.html';
  var jsPath = './' + modName;
  $.get(htmlPath, [], function (html) {
    $("#container").html(html);
    loadJs(jsPath);
  });
}


function loadJs(jsPath) {
  var currentMod;
  var route = jsPath.substring(jsPath.lastIndexOf('/') + 1);
  if (route === 'home') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init();
    }, 'home');
  }
  else if (route === 'hmr') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init(pageDatas.params);
    }, 'hmr');
  }
  else if (route === 'menu1') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init(pageDatas.params);
    }, 'menu1');
  }
  else if (route === 'menu2') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init(pageDatas.params);
    }, 'menu2');
  }
  else if (route === 'menu3') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init(pageDatas.params);
    }, 'menu3');
  }
  else if (route === 'menu5') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init(pageDatas.params);
    }, 'menu5');
  }
  else if (route === 'menu6') {
    require.ensure([], function (require) {
      currentMod = require(jsPath);
      currentMod.init(pageDatas.params);
    }, 'menu6');
  }
  else {
   /* if (__DEV__) {
      console.log('no request mod');
    }*/
  }
}

function initRoute() {
  require.ensure([], function (require) {
    routers = require('./../../providers/js/routes');
    for(var i=0; i<pageDatas.routes.length;++i){
      routers.map(pageDatas.routes[i], function (transition) {
          loadHtml(transition.path);
      });
    }
    routers.init(pageDatas.routes[0]);
  }, 'routes');
}


function initialize() {
  initMenu();

  bindMenu();
  initRoute();
}

$(function () {
  initialize();
});

