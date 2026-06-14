const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const { codeInspectorPlugin } = require('code-inspector-plugin');
const entries = require('./entry.js');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const baseClientConfig = {
  mode: process.env.NODE_ENV,
  target: 'web',
  devtool: 'eval-cheap-module-source-map',
  context: path.resolve(__dirname, '..'),
  entry: entries,
  output: {
    path: path.resolve(__dirname, `../dist/onepiece/client`),
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: `http://${process.env.DEV_HOST}:${process.env.WDS_PORT}/dist/onepiece/`,
    assetModuleFilename: '[name]-[contenthash][ext]',
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [require.resolve('react-refresh/babel')],
            },
          },
        ],
      },
      {
        test: /\.[s]?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                mode: 'global',
                localIdentName: '[path][name]__[local]',
              },
            },
          },
          { loader: 'postcss-loader' },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(woff2?|ttf|eot|svg|jpe?g|png|gif|ico)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: 'css/[id].css',
    }),
    new LoadablePlugin({
      filename: `loadable-stats.json`,
      writeToDisk: true,
      // outputAsset:path.resolve(__dirname, `../dist/${process.env.PLATFORM}/server`),
    }),
    // new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshPlugin(),
    // new BundleAnalyzerPlugin({
    //   analyzerPort: 9999,
    // }),
    codeInspectorPlugin({
      bundler: 'webpack',
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        storyblokSetup: {
          test: /[\\/]path[\\/]to[\\/]storyblok[\\/]setup\.js/,
          chunks: 'async',
          priority: 120,
        },
        // dev 模式下所依赖的包
        refresh_vendor: {
          test: /[\\/]node_modules[\\/](react-refresh|\@pmmmwh\/react-refresh-webpack-plugin)/,
          name: 'refresh_vendor',
          chunks: 'all',
          priority: 101,
        },
        // pro 模式下所依赖的包
        // redux 只有 main 入口依赖，所以独立拆分
        redux_vendor: {
          test: /[\\/]node_modules[\\/](react-redux)/,
          name: 'redux_vendor',
          chunks: 'all',
          priority: 101,
        },
        // 以下拆分是三个入口都依赖的
        react_vendors: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-helmet|create-react-class|react-is|react-fast-compare|react-side-effect)[\\/]/,
          name: 'react_vendors',
          chunks: 'all',
          priority: 100,
        },
        // lodash_vendor: {
        //   test: /[\\/]node_modules[\\/](lodash)/,
        //   name: 'lodash_vendor',
        //   chunks: 'all',
        //   priority: 100,
        // },
        other_vendor: {
          test: /[\\/]node_modules[\\/](sockjs-client|html-entities|)[\\/]/,
          name: 'other_vendor',
          chunks: 'all',
          priority: 100,
        },
        // lazysizes 是通过 import() 导入的，webpack 会自动把这个库拆分出来
        // lazysizes: {
        //   test: /\/node_modules\/lazysizes/,
        //   name: 'lazysizes',
        //   chunks: 'all',
        //   enforce: true,
        // },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
        },
        // vendors: false,
        // default: false,
      },
    },
  },
};

module.exports = merge(baseConfig, baseClientConfig);
