const webpack = require('webpack');

const helpers = require('./helpers');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const webpackMerge = require('webpack-merge');

const commonConfig = require('./webpack.common.js');

const METADATA = webpackMerge(commonConfig.metadata, {
  publicPath: './'
});

var output = {
  publicPath: METADATA.publicPath,
  filename: 'asset/js/[name]-[chunkhash:8].js',
  chunkFilename: 'asset/js/[name]-[chunkhash:8].js'
};
var plugins = [
  //公共js
  new webpack.optimize.CommonsChunkPlugin(
    {names: ["common", "webpackAssets"]}
  ),

  new ExtractTextPlugin("asset/css/[name]-[chunkhash:8].css", {allChunks: true}),
  //js、css、html进行压缩
  new webpack.optimize.UglifyJsPlugin({
    mangle: {
      except: ['$super', '$', 'exports', 'require', 'module', '_']
    },
    compress: {
      warnings: false
    },
    output: {
      comments: false
    }
  })

];


var config = {
  output: output,
  devtool: 'cheap-module-source-map',
  plugins: plugins
};


module.exports = webpackMerge(commonConfig, config);





