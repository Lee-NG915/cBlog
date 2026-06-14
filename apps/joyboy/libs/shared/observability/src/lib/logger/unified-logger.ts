import { Logger } from './logging-types';
import { cLog } from './client-logging';

/**
 * 主入口轻量 logger：仅使用 console 实现，不拉取 pino。
 * 服务端需使用 @castlery/observability/server 获取 pino。
 */
export function getLogger(): Logger {
  return cLog();
}

/**
 * 便捷的日志函数，可以直接使用（主入口为 console 实现）
 */
export const logger = {
  debug: (msg: string, obj?: object) => getLogger().debug(msg, obj),
  info: (msg: string, obj?: object) => getLogger().info(msg, obj),
  warn: (msg: string, obj?: object) => getLogger().warn(msg, obj),
  error: (msg: string, obj?: object) => getLogger().error(msg, obj),
} as const;
