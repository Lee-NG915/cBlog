// Node.js 内置模块 polyfill for Storybook
// 根据导入路径返回对应的 polyfill
const polyfills = {
  crypto: {
    createHash: () => ({ update: () => ({ digest: () => '' }) }),
    randomBytes: () => new Uint8Array(0),
    createHmac: () => ({ update: () => ({ digest: () => '' }) }),
  },
  stream: {},
  buffer: { from: () => new Uint8Array(0) },
  util: { inspect: (obj) => String(obj), format: (...args) => args.join(' ') },
};

// 默认导出 crypto（最常用）
export default polyfills.crypto;

// 命名导出所有 polyfills
export const crypto = polyfills.crypto;
export const stream = polyfills.stream;
export const buffer = polyfills.buffer;
export const util = polyfills.util;
