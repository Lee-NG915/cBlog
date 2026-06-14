import { Logger } from './logging-types';
import { EcEnv } from '@castlery/config';
import { createLogLevelFilter } from './log-level-utils';
import { sanitizeLogObject } from './sanitize-log-object';

let logger: Logger;

function getConsoleFallback(): Logger {
  const configuredLevel = EcEnv.NEXT_PUBLIC_LOG_LEVEL ?? 'info';
  const shouldLog = createLogLevelFilter(configuredLevel);
  return {
    debug(msg, obj) {
      if (!shouldLog('debug')) return;
      console.debug(
        JSON.stringify({ level: 'debug', time: new Date().toISOString(), msg, ...sanitizeLogObject(obj ?? {}) })
      );
    },
    info(msg, obj) {
      if (!shouldLog('info')) return;
      console.info(
        JSON.stringify({ level: 'info', time: new Date().toISOString(), msg, ...sanitizeLogObject(obj ?? {}) })
      );
    },
    warn(msg, obj) {
      if (!shouldLog('warn')) return;
      console.warn(
        JSON.stringify({ level: 'warn', time: new Date().toISOString(), msg, ...sanitizeLogObject(obj ?? {}) })
      );
    },
    error(msg, obj) {
      if (!shouldLog('error')) return;
      console.error(
        JSON.stringify({ level: 'error', time: new Date().toISOString(), msg, ...sanitizeLogObject(obj ?? {}) })
      );
    },
  };
}

export function cLog() {
  if (!logger && isClient()) {
    logger = initLogger();
  }
  return logger ?? getConsoleFallback();
}

function initLogger() {
  // 🔑 创建日志级别过滤器（初始化时计算一次，性能优化）
  const configuredLevel = EcEnv.NEXT_PUBLIC_LOG_LEVEL ?? 'info';
  const shouldLog = createLogLevelFilter(configuredLevel);

  // 在客户端使用增强的 console 日志，添加上下文信息；先 sanitize 再输出，避免 Error/循环引用
  const clientLogger: Logger = {
    debug(msg, obj) {
      if (shouldLog('debug')) {
        console.debug(`[${getTimestamp()}] [DEBUG] ${msg}`, addClientContext(sanitizeLogObject(obj ?? {})));
      }
    },
    info(msg, obj) {
      if (shouldLog('info')) {
        console.info(`[${getTimestamp()}] [INFO] ${msg}`, addClientContext(sanitizeLogObject(obj ?? {})));
      }
    },
    warn(msg, obj) {
      if (shouldLog('warn')) {
        console.warn(`[${getTimestamp()}] [WARN] ${msg}`, addClientContext(sanitizeLogObject(obj ?? {})));
      }
    },
    error(msg, obj) {
      if (shouldLog('error')) {
        console.error(`[${getTimestamp()}] [ERROR] ${msg}`, addClientContext(sanitizeLogObject(obj ?? {})));
      }
    },
  };

  return clientLogger;
}

function addClientContext(obj?: object) {
  return {
    service: getServiceName(),
    env: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    country: EcEnv.NEXT_PUBLIC_COUNTRY,
    channel: EcEnv.NEXT_PUBLIC_CHANNEL,
    version: EcEnv.NEXT_PUBLIC_VERSION,
    timestamp: getTimestamp(),
    ...obj,
  };
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function getServiceName() {
  const channel = EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase();
  return `joyboy-${channel}`;
}

function isClient() {
  return typeof window !== 'undefined';
}
