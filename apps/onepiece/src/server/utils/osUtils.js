const os = require('os');

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class OsUtils {
  /**
   * 获取某一时间段内的 CPU 利用率
   * @param { Number } Options.ms 默认是 1000ms
   * @param { Boolean } Options.percentage true（以百分比结果返回）| false(小数返回)
   * @returns { Promise } CPU 利用率
   */
  async getCPULoadavg(options = {}) {
    const that = this;
    const { cpuUsageMS = 1000, percentage = false } = options;
    const t1 = that._getCPUMetric();
    await sleep(cpuUsageMS);
    const t2 = that._getCPUMetric();
    const idle = t2.idle - t1.idle;
    const total = t2.total - t1.total;
    let usage = 1 - idle / total;

    percentage && (usage = `${(usage * 100.0).toFixed(2)}%`);

    return usage;
  }

  /**
   * 获取 内存 信息
   * @param { Boolean } percentage true（以百分比结果返回）| false(小数返回)
   * @returns { Object } 内存 信息
   */
  getMemoryUsage(percentage = false) {
    const { rss, heapUsed, heapTotal } = process.memoryUsage();
    const sysFree = os.freemem();
    const sysTotal = os.totalmem();
    return {
      sys: percentage ? `${(1 - sysFree / sysTotal).toFixed(2) * 100}%` : 1 - sysFree / sysTotal,
      heap: percentage ? `${(heapUsed / heapTotal).toFixed(2) * 100}%` : heapUsed / heapTotal,
      node: percentage ? `${(rss / sysTotal).toFixed(2) * 100}%` : rss / sysTotal,
    };
  }

  /**
   * 获取 CPU 信息
   * @returns { Object } CPU 信息
   */
  _getCPUMetric() {
    const cpus = os.cpus();
    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    // eslint-disable-next-line guard-for-in
    for (const cpu in cpus) {
      const times = cpus[cpu].times;
      user += times.user;
      nice += times.nice;
      sys += times.sys;
      idle += times.idle;
      irq += times.irq;
    }

    total += user + nice + sys + idle + irq;

    return {
      user,
      sys,
      idle,
      total,
    };
  }
}
export default OsUtils;
