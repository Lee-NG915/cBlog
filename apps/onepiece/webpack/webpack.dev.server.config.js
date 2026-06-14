const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const baseConfig = require('./webpack.base.config');

const assetsPath = path.resolve(__dirname, `../dist/onepiece/server`);

const baseServerConfig = {
  mode: process.env.NODE_ENV,
  target: 'node14',
  devtool: 'eval-cheap-source-map',
  context: path.resolve(__dirname, '..'),
  entry: './src/server/app.js',
  output: {
    filename: 'app.js',
    path: assetsPath,
    publicPath: `http://${process.env.DEV_HOST}:${process.env.WDS_PORT}/dist/onepiece/`,
    assetModuleFilename: '[name]-[contenthash][ext]',
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
        use: ['babel-loader'],
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
                localIdentName: '[path][name]__[local]',
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
      __DEVELOPMENT__: true,
    }),
  ],
};

module.exports = merge(baseConfig, baseServerConfig);
