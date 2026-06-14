const webpack = require('webpack');
const serverConfig = require('../webpack/webpack.prod.server.config');

const compiler = webpack(serverConfig);
compiler.run();

compiler.hooks.done.tap('done', function (stats) {

  if (stats.hasErrors()) {
    console.log('production server code compiler failed');
    process.stdout.write(stats.toString({
      colors: true,
      chunks: false,
      errorDetails: false,
      errors: true,
      logging: 'error',
    }));
    process.exit(1);
  } 
  console.log('\nproduction server code compiler done');
});

compiler.hooks.failed.tap('failed', function (err) {
  console.log('production client code compiler failed', err);
  process.exit(1);
});