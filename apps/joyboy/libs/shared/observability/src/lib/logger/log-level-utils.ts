/**
 * 🔑 日志级别工具函数
 *
 * 统一的日志级别管理，确保客户端和服务端行为一致
 * 优先级体系与 pino 完全兼容
 */

/**
 * 日志级别优先级（与 pino 一致）
 *
 * - fatal: 60 (最高)
 * - error: 50
 * - warn:  40
 * - info:  30 (默认)
 * - debug: 20
 * - trace: 10 (最低)
 */
export const LOG_LEVEL_PRIORITY: Record<string, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

/**
 * 默认日志级别
 */
export const DEFAULT_LOG_LEVEL = 'info';

/**
 * 创建日志级别过滤函数
 *
 * @param configuredLevel - 配置的日志级别（如 'warn', 'info', 'debug'）
 * @returns 判断某个日志级别是否应该输出的函数
 *
 * @example
 * const shouldLog = createLogLevelFilter('warn');
 * shouldLog('debug') // false - debug(20) < warn(40)
 * shouldLog('warn')  // true  - warn(40) >= warn(40)
 * shouldLog('error') // true  - error(50) >= warn(40)
 */
export function createLogLevelFilter(configuredLevel: string): (logLevel: string) => boolean {
  const configuredPriority = LOG_LEVEL_PRIORITY[configuredLevel] ?? LOG_LEVEL_PRIORITY[DEFAULT_LOG_LEVEL];

  return (logLevel: string) => {
    const logPriority = LOG_LEVEL_PRIORITY[logLevel] ?? 0;
    return logPriority >= configuredPriority;
  };
}

/**
 * 直接判断某个日志级别是否应该输出（无缓存版本）
 *
 * @param logLevel - 要输出的日志级别
 * @param configuredLevel - 配置的最低日志级别
 * @returns 是否应该输出
 */
export function shouldLogLevel(logLevel: string, configuredLevel: string): boolean {
  const configuredPriority = LOG_LEVEL_PRIORITY[configuredLevel] ?? LOG_LEVEL_PRIORITY[DEFAULT_LOG_LEVEL];
  const logPriority = LOG_LEVEL_PRIORITY[logLevel] ?? 0;
  return logPriority >= configuredPriority;
}
