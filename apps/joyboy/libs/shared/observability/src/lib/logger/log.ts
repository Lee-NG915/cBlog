import pino from 'pino';
import { Logger } from './logging-types';
import { EcEnv } from '@castlery/config';
import { createLogLevelFilter } from './log-level-utils';
import { sanitizeLogObject } from './sanitize-log-object';

/**
 * 🔑 生产级日志配置
 *
 * 重要特性：
 * - ✅ 保证单行 JSON 输出（DataDog 友好）
 * - ✅ Error stack 转换为单行（使用 | 分隔）
 * - ✅ 防止多行日志浪费 DataDog 配额
 * - ✅ 统一的日志级别过滤（客户端/服务端/Edge Runtime 一致）
 */

let logger: Logger;

export function sLog() {
  if (!logger && isServer()) {
    // 🔑 检测 Edge Runtime - pino 不支持
    if (isEdgeRuntime()) {
      logger = getEdgeRuntimeLogger();
    } else {
      logger = initLogger();
    }
  }
  // 🔑 如果 logger 未初始化，使用安全的 console fallback（JSON 格式）
  return logger ?? getSafeConsoleFallback();
}

// 检测是否在 Edge Runtime 中运行
function isEdgeRuntime(): boolean {
  try {
    // Edge Runtime 有特殊的全局对象和环境变量
    // @ts-ignore - EdgeRuntime 是 Edge Runtime 的全局对象
    if (typeof EdgeRuntime !== 'undefined') {
      return true;
    }
    // @ts-ignore - process.env.NEXT_RUNTIME 在 Edge Runtime 中会被设置
    if (typeof process !== 'undefined' && process.env?.NEXT_RUNTIME === 'edge') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Edge Runtime 专用 logger（不依赖 pino）
function getEdgeRuntimeLogger(): Logger {
  // 🔑 实现日志级别过滤（与 pino 行为一致）
  const configuredLevel = EcEnv.NEXT_PUBLIC_LOG_LEVEL ?? 'info';
  const shouldLog = createLogLevelFilter(configuredLevel);

  return {
    debug(msg, obj) {
      if (!shouldLog('debug')) return; // 🔑 过滤
      const sanitized = sanitizeLogObject(obj || {});
      const log = JSON.stringify({ level: 'debug', time: new Date().toISOString(), msg, ...sanitized });
      console.debug(log);
    },
    info(msg, obj) {
      if (!shouldLog('info')) return; // 🔑 过滤
      const sanitized = sanitizeLogObject(obj || {});
      const log = JSON.stringify({ level: 'info', time: new Date().toISOString(), msg, ...sanitized });
      console.info(log);
    },
    warn(msg, obj) {
      if (!shouldLog('warn')) return; // 🔑 过滤
      const sanitized = sanitizeLogObject(obj || {});
      const log = JSON.stringify({ level: 'warn', time: new Date().toISOString(), msg, ...sanitized });
      console.warn(log);
    },
    error(msg, obj) {
      if (!shouldLog('error')) return; // 🔑 过滤
      const sanitized = sanitizeLogObject(obj || {});
      const log = JSON.stringify({ level: 'error', time: new Date().toISOString(), msg, ...sanitized });
      console.error(log);
    },
  };
}

// 安全的 console fallback，确保输出单行 JSON（先 sanitize 再序列化，避免 Error/循环引用报错）
function getSafeConsoleFallback(): Logger {
  const configuredLevel = EcEnv.NEXT_PUBLIC_LOG_LEVEL ?? 'info';
  const shouldLog = createLogLevelFilter(configuredLevel);

  return {
    debug(msg, obj) {
      if (!shouldLog('debug')) return;
      const sanitized = sanitizeLogObject(obj ?? {});
      console.debug(JSON.stringify({ level: 'debug', msg, ...sanitized }));
    },
    info(msg, obj) {
      if (!shouldLog('info')) return;
      const sanitized = sanitizeLogObject(obj ?? {});
      console.info(JSON.stringify({ level: 'info', msg, ...sanitized }));
    },
    warn(msg, obj) {
      if (!shouldLog('warn')) return;
      const sanitized = sanitizeLogObject(obj ?? {});
      console.warn(JSON.stringify({ level: 'warn', msg, ...sanitized }));
    },
    error(msg, obj) {
      if (!shouldLog('error')) return;
      const sanitized = sanitizeLogObject(obj ?? {});
      console.error(JSON.stringify({ level: 'error', msg, ...sanitized }));
    },
  };
}

function initLogger() {
  const jsonLogger = pino({
    base: null,
    level: EcEnv.NEXT_PUBLIC_LOG_LEVEL ?? 'info',
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  const serverLogger: Logger = {
    debug(msg, obj) {
      jsonLogger.debug(addDefaultContext(obj), msg);
    },
    info(msg, obj) {
      jsonLogger.info(addDefaultContext(obj), msg);
    },
    warn(msg, obj) {
      jsonLogger.warn(addDefaultContext(obj), msg);
    },
    error(msg, obj) {
      jsonLogger.error(addDefaultContext(obj), msg);
    },
  };
  return serverLogger;
}

function addDefaultContext(obj?: object) {
  if (!obj) return {};

  // Node + pino：Error 与 err/error 透传，由 pino serializer 处理；其余照常序列化
  const sanitized = sanitizeLogObject(obj, { passthroughError: true });

  return {
    // service: getServiceName(),
    // env: EcEnv.NEXT_PUBLIC_APPLICATION_ENV,
    // country: EcEnv.NEXT_PUBLIC_COUNTRY,
    // channel: EcEnv.NEXT_PUBLIC_CHANNEL,
    // locale: EcEnv.NEXT_PUBLIC_LOCALE,
    // version: EcEnv.NEXT_PUBLIC_VERSION,
    ...sanitized,
  };
}

function getServiceName() {
  const channel = EcEnv.NEXT_PUBLIC_CHANNEL?.toLowerCase();
  return `joyboy-${channel}`;
}

function isServer() {
  return typeof window === 'undefined';
}
