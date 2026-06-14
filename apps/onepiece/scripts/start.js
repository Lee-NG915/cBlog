// entry file to start production
require('dotenv').config();
const { spawn } = require('child_process');

const feCodeWatchProcess = spawn('node', ['./scripts/build-client'], {
  stdio: 'inherit',
  shell: true,
});

const svrCodeWatchProcess = spawn('node', ['./scripts/build-server'], {
  stdio: 'inherit',
  shell: true,
});

const killChild = () => {
  svrCodeWatchProcess && svrCodeWatchProcess.kill();
  feCodeWatchProcess && feCodeWatchProcess.kill();
};

feCodeWatchProcess.on('exit', (exitCode) => {
  if(exitCode){
    console.log('client build exit', exitCode);
    killChild();
    process.exit(exitCode);
  }
});

svrCodeWatchProcess.on('exit', (exitCode) => {
  if(exitCode){
    console.log('server build exit', exitCode);
    killChild();
    process.exit(exitCode);
  }
});

process.on('close', (code) => {
  console.log('main process  close', code);
  killChild();
});
process.on('exit', (code) => {
  console.log('main process  exit', code);
  killChild();
});
