const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const baseConfig = require('./webpack.base.config');
const LoadablePlugin = require('@loadable/webpack-plugin');
const entries = require('./entry.js');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const assetsPath = path.resolve(__dirname, `../static/onepiece/client`);

const baseClientConfig = {
  mode: process.env.NODE_ENV,
  target: 'web',
  devtool: 'source-map', // Source map generation must be turned on
  context: path.resolve(__dirname, '..'),
  entry: entries,
  output: {
    path: assetsPath,
    filename: '[name]-[contenthash].js',
    chunkFilename: '[name]-[contenthash].js',
    assetModuleFilename: '[name]-[contenthash][ext]',
    publicPath: (process.env.ASSET_HOST || '/static') + '/onepiece/' + 'client/',
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
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
                localIdentName: '[contenthash:base64:6]',
              },
            },
          },
          { loader: 'postcss-loader' },
          {
            loader: 'sass-loader',
            // options: {
            //   additionalData: '$platform: ' + process.env.PLATFORM + ';',
            // },
          },
        ],
      },
      {
        test: /\.(woff2?|ttf|eot|svg|jpe?g|png|gif|ico)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
    ],
  },
  stats: 'normal',
  optimization: {
    runtimeChunk: 'single',
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        storyblokSetup: {
          test: /[\\/]path[\\/]to[\\/]storyblok[\\/]setup\.js/,
          chunks: 'async',
          priority: 120,
        },
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
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
    }),
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new LoadablePlugin({ filename: `loadable-stats.json`, writeToDisk: true }),
    // new BundleAnalyzerPlugin()
  ],
};

// add source map support for sentry
if (process.env.APP_NAME && process.env.APP_ENV && process.env.APP_VERSION) {
  baseClientConfig.plugins.push(
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG || 'castlery',
      project: process.env.SENTRY_PROJECT || 'onepiece',
      sourcemaps: {
        assets: [`${assetsPath}/**`],
        deleteFilesAfterUpload: [`${assetsPath}/*.map`],
      },
      release: {
        name: `${process.env.APP_NAME}@${process.env.APP_ENV}@${process.env.APP_VERSION}`,
      },
      // https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-thirdpartyerrorfilterintegration
      applicationKey: process.env.APP_NAME,
    })
  );
}

module.exports = merge(baseConfig, baseClientConfig);
