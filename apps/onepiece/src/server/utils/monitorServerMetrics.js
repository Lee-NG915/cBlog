import OsUtils from './osUtils';
import logger from './logger';

// const os = require('os');

// 设置阈值，根据实际需求进行调整
const cpuThreshold = 75; // CPU使用率阈值，超过这个值设置global.ENABLE_CSR为true
const memoryThreshold = 75; // 内存使用率阈值，超过这个值设置global.ENABLE_CSR为true

// 定时器的间隔，单位为毫秒
const monitoringInterval = 10000; // 10秒钟检查一次

// 设置一个全局变量，用于标识是否启用CSR
global.ENABLE_CSR = false;

export default () => {
  // 定时器，定期检查系统状态
  setInterval(() => {
    // const cpuUsage =
    //   (os.cpus().reduce((acc, core) => acc + core.times.user, 0) / os.cpus().length / 1000 / monitoringInterval) * 100;
    // const memoryUsage = (os.freemem() / os.totalmem()) * 100;

    // console.log(`CPU 使用率: ${cpuUsage.toFixed(2)}%, 内存 使用率: ${memoryUsage.toFixed(2)}%`);

    // // 根据情况设置全局变量
    // if (cpuUsage > cpuThreshold || memoryUsage > memoryThreshold) {
    //   global.ENABLE_CSR = true;
    //   console.log('启用 CSR!');
    // } else {
    //   global.ENABLE_CSR = false;
    //   console.log('未启用 CSR.');
    // }

    const osUtils = new OsUtils();
    osUtils.getCPULoadavg({ percentage: false, cpuUsageMS: 2000 }).then((res) => {
      const usage = (res * 100).toFixed(2);
      if (usage > cpuThreshold) {
        global.ENABLE_CSR = true;
        logger.log('warn', 'cpu usage:', { message: usage });
      } else {
        if (global.ENABLE_CSR) {
          logger.log('info', 'close csr:', { message: usage });
        }
        global.ENABLE_CSR = false;
      }

      // logger.log('info', 'cpu usage:', { message: res * 100 });
    });
    // const memoryUsage = osUtils.getMemoryUsage(false);
    // if (memoryUsage > memoryThreshold) {
    //   global.ENABLE_CSR = true;
    // } else {
    //   global.ENABLE_CSR = false;
    // }
    // logger.log('info', 'memory usage: ', memoryUsage);
  }, monitoringInterval);
};
