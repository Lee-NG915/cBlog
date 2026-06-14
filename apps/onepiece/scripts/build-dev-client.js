const chalk = require('chalk');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { spawn } = require('child_process');
const clientConfig = require('../webpack/webpack.dev.client.config');

const PORT = process.env.WDS_PORT;
const HOST = process.env.DEV_HOST;

const webpackDevServerOptions = {
  host: HOST,
  quiet: true,
  port: PORT,
  contentBase: path.resolve(__dirname, '../static'),
  publicPath: clientConfig.output.publicPath,
  hot: true,
  inline: true,
  clientLogLevel: 'error',
  open: false,
  compress: true,
  watchOptions: {
    ignored: [path.resolve(__dirname, `../node_modules/`), path.resolve(__dirname, `../dist/`)],
    aggregateTimeout: 200,
    // poll: 1000,
  },

  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};


const compiler = webpack(clientConfig);


compiler.hooks.watchRun.tap('watchRun' , () => {
  console.log(chalk.yellow('waiting......'));
})

compiler.hooks.done.tap('done', (stats) => {
  if (stats.hasErrors()) {
    process.stdout.write(stats.toString({ 
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      assets: false,
      errorDetails: false,
    }) + '\n');
  }
  console.log(chalk.green('client compiler done!'));

});

WebpackDevServer.addDevServerEntrypoints(clientConfig, webpackDevServerOptions);

const server = new WebpackDevServer(compiler, webpackDevServerOptions);

server.listen(PORT, HOST, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(chalk.blue('Starting the development node server,please wait....\n'));
});




