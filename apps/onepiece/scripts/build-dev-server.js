const chalk = require('chalk');
const webpack = require('webpack');
const config = require('../webpack/webpack.dev.server.config');
const path = require('path');

const compiler = webpack(config);
const initNodeServer = require('./init-dev-server');

compiler.watch(
  {
    aggregateTimeout: 200,
    // poll: 1000,
    ignored: [path.resolve(__dirname, `../node_modules/`), path.resolve(__dirname, `../dist/`), path.resolve(__dirname, `../log/`)],
    // 'info-verbosity': 'verbose',
  },
  (err, stats) => {
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
);

let isInit = false;
let serverProcess;
compiler.hooks.done.tap('done', (stats) => {
  
  console.log(chalk.green('server compiler done!'));
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

  if (!isInit) {
    // start node server to run app
    serverProcess =  initNodeServer();
    isInit = true;
  } else {
    // Manual restart
      serverProcess.send('restart');
  }
});

process.stdin.on('data', (data) => {
  if (data.toString() === 'exit') {
    process.exit();
  }
});