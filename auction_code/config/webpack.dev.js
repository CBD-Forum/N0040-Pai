const webpack = require('webpack');

const helpers = require('./helpers');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.common.js');

const METADATA = webpackMerge(commonConfig.metadata, {
  publicPath: '/',
  host: 'localhost',
  port: 3000
});

var output = {
  publicPath: METADATA.publicPath,
  filename: 'asset/js/[name].js',
  chunkFilename: 'asset/js/[name].js'
};
var plugins = [
  //公共js
  new webpack.optimize.CommonsChunkPlugin(
    {name: "common", filename: "asset/js/common.js"}
  ),

  new ExtractTextPlugin("css/[name].css"),

  new webpack.HotModuleReplacementPlugin({
    multiStep: true
  }),

  new OpenBrowserPlugin({url: 'http://' + METADATA.host + ':' + METADATA.port + METADATA.publicPath + 'index.html'})
];

var devServer = {
  historyApiFallback: true,
  hot: true,
  inline: true,
  stats: 'errors-only',
  host: METADATA.host,
  port: METADATA.port
};

var config = {
  output: output,
  devtool: 'cheap-module-source-map',
  plugins: plugins,
  devServer: devServer
};


module.exports = webpackMerge(commonConfig, config);





