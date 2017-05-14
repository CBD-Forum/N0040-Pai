const path = require('path');

const webpack = require('webpack');
const helpers = require('./helpers');
/*
 * verify config
 * （验证config文件是否正确）
 * */
const validate = require('webpack-validator');

/*
 * clean publishing directory
 * （清空发布目录）
 * */
const CleanWebpackPlugin = require('clean-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');

/*
 * （创建html文件）
 * */
const HtmlWebpackPlugin = require('html-webpack-plugin');

/*
 * 提取css文件
 * */
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const HtmlElementsPlugin = require('./html-elements-plugin/index');

const METADATA = {
  title: '区块链杂货铺',
  /*
   * public resource path
   * （公共资源目录）
   * */
  libsPath: path.resolve(process.cwd(), './libs'),
  /*
   * resource path
   * （src 目录）
   * */
  srcPath: path.resolve(process.cwd(), './src'),
  /*
   * node_modules path
   */
  node_modulesPath: helpers.root('node_modules')
};

var resolve = {
  /*
   * An array of extensions that should be used to resolve modules
   * （引用时可以忽略后缀）
   * */
  extensions: ['', '.js', '.ts', ".webpack.js", ".web.js", '.json', '.css', '.less', '.scss', '.ejs', '.png', '.jpg'],

  /*
   * The directory (absolute path) that contains your modules
   * */
  root: [
    METADATA.node_modulesPath
  ],

  /*
   * Replace modules with other modules or paths.
   * （别名，引用时直接可以通过别名引用）
   * */
  alias: {
    /*
     * js
     */
    jquery: path.join(METADATA.libsPath, "js/jquery/jquery"),
    underscore: path.join(METADATA.libsPath, "js/underscore/underscore.js"),
    /*balance: path.join(METADATA.libsPath, "js/svg/snap.svg.js"),
    show: path.join(METADATA.libsPath, "js/svg/auction.show.js"),*/


    /*
     * css
     */
    bootstrapcss: path.join(METADATA.libsPath, "css/bootstrap-3.3.5.css"),
    bootstrap_glyphicons_css: path.join(METADATA.libsPath, "css/bootstrap-glyphicons.css"),
    indexcss: path.join(METADATA.srcPath, "asset/css/index.css"),
    registercss: path.join(METADATA.srcPath, "asset/css/register.css"),

    logincss: path.join(METADATA.srcPath, "asset/css/login.css"),
    slidercss: path.join(METADATA.srcPath, "asset/css/slider.css"),
    homecss: path.join(METADATA.srcPath, "asset/css/home.css"),
    paimaicss: path.join(METADATA.srcPath, "asset/css/paimai.css"),
    accountcss: path.join(METADATA.srcPath, "asset/css/account.css"),
    paycss: path.join(METADATA.srcPath, "asset/css/pay.css"),
    ensurecss: path.join(METADATA.srcPath, "asset/css/ensure.css"),
    ordercss: path.join(METADATA.srcPath, "asset/css/order.css"),
    withdrawcss: path.join(METADATA.srcPath, "asset/css/withdraw.css"),
    confirmcss: path.join(METADATA.srcPath, "asset/css/confirm.css")
  }
};

/*
 * The entry point for the bundle.
 * （入口）
 * */
var entry = {
  /* index: helpers.root('/src/app/home/js/auction.show.js'),
   login: helpers.root('/src/app/login/js/login.js'),
   demo: helpers.root('/src/app/demo/js/demo.js'),*/
  register: helpers.root('/src/app/register/ts/register.ts'),
  login: helpers.root('/src/app/login/ts/login.ts'),
  home: helpers.root('/src/app/home/ts/home.ts'),
  paimai: helpers.root('/src/app/paimai/ts/paimai.ts'),
  account: helpers.root('/src/app/account/ts/account.ts'),
  pay: helpers.root('/src/app/pay/ts/pay.ts'),
  ensure: helpers.root('/src/app/ensure/ts/ensure.ts'),
  order: helpers.root('/src/app/order/ts/order.ts'),
  withdraw: helpers.root('/src/app/withdraw/ts/withdraw.ts'),
  confirm: helpers.root('/src/app/confirm/ts/confirm.ts'),
  common: [
    path.join(METADATA.libsPath, "js/jquery/jquery.js")
  ]
};

var plugins = [

  /*
   * gloabal flag
   * （全局标识）
   * */
  /* new webpack.DefinePlugin({
   __DEV__: false
   }),
   */
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    "window.jQuery": "jquery",
    "_": "underscore"
  }),
  //删除重复依赖的文件）
  new webpack.optimize.DedupePlugin(),

  //避免在文件不改变的情况下hash值不变化
  new webpack.optimize.OccurenceOrderPlugin(),

  new CleanWebpackPlugin(['dist'], {
    root: helpers.root('/'),
    verbose: true,
    dry: false
  }),

  new CopyWebpackPlugin([{
    from: 'src/asset/config',
    to: 'asset/config'
  }]),

  new CopyWebpackPlugin([{
    from: 'src/asset/icon',
    to: 'asset/icon'
  }]),
  new CopyWebpackPlugin([{
    from: path.join(METADATA.libsPath, "js/qrcode/qrcode.min.js"),
    to: 'asset/js'
  }]),
  new CopyWebpackPlugin([{
    from: path.join(METADATA.libsPath, "js/svg/snap.svg.js"),
    to: 'asset/js'
  }]),
  new CopyWebpackPlugin([{
    from: path.join(METADATA.libsPath, "js/svg/auction.show.js"),
    to: 'asset/js'
  }]),
  /*创建html文件*/
  //注册页
  new HtmlWebpackPlugin({
    filename: 'register.html',
    template: helpers.root('/src/app/register/html/register.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'register', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  //登录页
  new HtmlWebpackPlugin({
    filename: 'login.html',
    template: helpers.root('/src/app/login/html/login.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'login', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  //home页
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: helpers.root('/src/app/index.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'true',
    // 需要依赖的模块
    chunks: ['common', 'home', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'home/pro.html',
    template: helpers.root('/src/app/home/html/pro.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'home/transaction.html',
    template: helpers.root('/src/app/home/html/transaction.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'home/faq.html',
    template: helpers.root('/src/app/home/html/faq.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'home/about.html',
    template: helpers.root('/src/app/home/html/about.html'),
    inject: false,
    hash: true
  }),
  //module
  new HtmlWebpackPlugin({
    filename: 'module/header.html',
    template: helpers.root('/src/app/module/header/header.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'module/footer.html',
    template: helpers.root('/src/app/module/footer/footer.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'module/address-editor.html',
    template: helpers.root('/src/app/module/address-editor/address-editor.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'module/pay-notice.html',
    template: helpers.root('/src/app/module/pay-notice/pay-notice.html'),
    inject: false,
    hash: true
  }),
  //竞拍页面
  new HtmlWebpackPlugin({
    filename: 'paimai.html',
    template: helpers.root('/src/app/paimai/html/paimai.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['balance','common', 'paimai', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'paimai/product.html',
    template: helpers.root('/src/app/paimai/html/product.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'paimai/desc.html',
    template: helpers.root('/src/app/paimai/html/desc.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'paimai/promise.html',
    template: helpers.root('/src/app/paimai/html/promise.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'paimai/record.html',
    template: helpers.root('/src/app/paimai/html/record.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'paimai/block.html',
    template: helpers.root('/src/app/paimai/html/block.html'),
    inject: false,
    hash: true
  }),
  //帐号页面
  new HtmlWebpackPlugin({
    title: "帐号信息",
    filename: 'account.html',
    template: helpers.root('/src/app/account/html/account.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'account', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'account/activity.html',
    template: helpers.root('/src/app/account/html/activity.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'account/address.html',
    template: helpers.root('/src/app/account/html/address.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'account/finance.html',
    template: helpers.root('/src/app/account/html/finance.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'account/msg.html',
    template: helpers.root('/src/app/account/html/msg.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'account/setting.html',
    template: helpers.root('/src/app/account/html/setting.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'account/trade.html',
    template: helpers.root('/src/app/account/html/trade.html'),
    inject: false,
    hash: true
  }),
  /**
   * 支付页面
  * */
  new HtmlWebpackPlugin({
    filename: 'pay.html',
    template: helpers.root('/src/app/pay/html/pay.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'pay', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  /**
   * 保证金页面
   * */
  new HtmlWebpackPlugin({
    filename: 'ensure.html',
    template: helpers.root('/src/app/ensure/html/ensure.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'ensure', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'ensure/contract.html',
    template: helpers.root('/src/app/ensure/html/contract.html'),
    inject: false,
    hash: true
  }),
  new HtmlWebpackPlugin({
    filename: 'ensure/order.html',
    template: helpers.root('/src/app/ensure/html/order.html'),
    inject: false,
    hash: true
  }),
  /**
   * 所有订单详情
   * */
  new HtmlWebpackPlugin({
    filename: 'order.html',
    template: helpers.root('/src/app/order/html/order.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'order', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  /**
   * 资金转出
   * */
  new HtmlWebpackPlugin({
    filename: 'withdraw.html',
    template: helpers.root('/src/app/withdraw/html/withdraw.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'withdraw', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),

  /**
   * 确认订单
  * */
  new HtmlWebpackPlugin({
    filename:"confirm.html",
    template: helpers.root('/src/app/confirm/html/confirm.html'),
    //注入所有的资源到特定的 template 或者 templateContent 中
    inject: 'body',
    // 需要依赖的模块
    chunks: ['common', 'confirm', 'webpackAssets'],
    // 根据依赖自动排序
    chunksSortMode: 'dependency',
    hash: true
  }),
  new HtmlElementsPlugin({
    headTags: require('./head-config.common')
  })
];

/*
 * output options tell Webpack how to write the compiled files to disk
 * （webpack 编译后输出标识）
 * */
var output = {
  path: helpers.root('dist')

};

var preLoaders = [
  {test: /\.js$/, loader: "source-map-loader"}
];

var loaders = [
  {
    test: /\.html$/,
    loader: "html"
  },

  {
    test: /\.(png|gif|jpe?g)$/,
    loader: 'url-loader',
    query: {
      //图片大小小于10kb 采用内联的形式，否则输出图片
      limit: 10000,
      publicPath: "../../",
      //name: 'img/[name]-[hash:8].[ext]'
      //name: '[path][name]-[hash:8].[ext]'
      name: 'img/[name]-[hash:8].[ext]'
    }
  },

  {
    test: /\.(eot|woff|woff2|ttf|svg)$/,
    loader: 'url-loader',
    query: {
      limit: 5000,
      publicPath: "../../",
      /*name: 'asset/fonts/[name].[ext]'*/
      name: 'fonts/[name]-[hash:8].[ext]'
    }
  },

  {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract("style", "css", 'resolve-url',
      {
        publicPath: "../"
      })
  },

  {
    test: /\.ts$/,
    loaders: ['ts-loader'],//,'awesome-typescript-loader'
    exclude: [/\.(spec|e2e)\.ts$/]
  },
  {
    test: /\.json$/,
    loader: 'json-loader'
  }
];

var externals = {
  'qrcode':true
};

var config = {
  metadata: METADATA,
  entry: entry,
  resolveLoader: {root: METADATA.node_modulesPath},
  output: output,
  externals:externals,
  module: {
    preLoaders: preLoaders,
    loaders: loaders
  },
  resolve: resolve,
  plugins: plugins
};

module.exports = validate(config);




