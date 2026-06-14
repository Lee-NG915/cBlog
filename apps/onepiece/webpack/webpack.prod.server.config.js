const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const baseConfig = require('./webpack.base.config');

// webpack base config

const assetsPath = path.resolve(__dirname, `../static/onepiece/server`);

const baseServerConfig = {
  mode: process.env.NODE_ENV,
  target: 'node14',
  devtool: 'source-map', // Source map generation must be turned on
  context: path.resolve(__dirname, '..'),
  entry: './src/server/app.js',
  output: {
    filename: 'app.js',
    path: assetsPath,
    assetModuleFilename: '[name]-[contenthash][ext]',
    publicPath: `${process.env.ASSET_HOST || '/static'}/onepiece/client/`,
  },
  externals: [
    nodeExternals({
      allowlist: [/^redux\/module/, /^redux\/middleware/, /^redux\/create/],
    }),
  ],
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
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                mode: 'global',
                localIdentName: '[hash:base64:6]',
                exportOnlyLocals: true,
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
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: false,
      __SERVER__: true,
      __DEVELOPMENT__: false,
    }),
  ],
};

// add source map support for sentry
if (process.env.APP_NAME && process.env.APP_ENV && process.env.APP_VERSION) {
  baseServerConfig.plugins.push(
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

module.exports = merge(baseConfig, baseServerConfig);
