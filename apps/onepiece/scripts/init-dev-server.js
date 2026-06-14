const { spawn } = require('child_process');
const chalk = require('chalk');


/**
 * @description init dev node server
 */
function initNodeServer() {
  console.log(chalk.green('init node server...'));
  const nodemonCp = spawn(
    'nodemon',
    ['./bin/server.js','--watch', false, '--verbose', '--delay', 1], // watch false for Manual restart 
    // ['./bin/server.js','--watch',`./dist/${process.env.PLATFORM}/server`, '--delay', 1, '--verbose'], // watch false for Manual restart 
    {
      stdio: ['inherit', 'inherit', 'pipe', 'ipc'],
      shell: true,
    }
  );
  console.log(chalk.green('init node server OK!'));

  // listen message
  nodemonCp.on('message', function (event) {
    // console.log(event);
    if (event.type === 'start') {
      console.log(chalk.green('node server started!'));
    } else if (event.type === 'crash') {
      console.log(chalk.yellow('script crashed for some reason'));
    }
  });
  process.on('close', (code) => {
    console.log('node server process  close', code);
    nodemonCp && nodemonCp.kill();
  });
  process.on('exit', (code) => {
    console.log('node server process  exit', code);
    nodemonCp && nodemonCp.kill();
  });
  
  return nodemonCp;
}

module.exports = initNodeServer;