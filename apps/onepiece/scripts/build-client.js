const webpack = require('webpack');
const clientConfig = require('../webpack/webpack.prod.client.config');

const compiler = webpack(clientConfig);
compiler.run();

compiler.hooks.done.tap('done', function (stats) {
  
  if (stats.hasErrors()) {
    console.log('production client code compiler failed');
    process.stdout.write(stats.toString({
      colors: true,
      chunks: false,
      errorDetails: false,
      errors: true,
      logging: 'error',
    }));
    process.exit(1);
  }
  console.log('\nproduction client code compiler done');
});

compiler.hooks.failed.tap('failed', function (err) {
  console.log('production client code compiler failed', err);
  process.exit(1);
});

