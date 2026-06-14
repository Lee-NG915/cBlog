/**
 * 日志对象安全化（可序列化）
 *
 * 供 client / server 共用，确保：
 * 1. Error 转为 { type, message, stack }，换行替换为单行（或透传给 pino，见 passthroughError）
 * 2. 字符串内换行替换，避免多行破坏单行日志
 * 3. 循环引用检测，避免 JSON.stringify 抛错
 * 4. 递归处理数组与普通对象
 *
 * 与原有 Edge Runtime 逻辑兼容：
 * - Edge / fallback / client：不传 passthroughError，Error 与 err/error 字段一律序列化
 * - Node + pino：传 { passthroughError: true }，Error 及对象的 err/error 透传，由 pino serializer 处理
 */

const CIRCULAR_PLACEHOLDER = '[Circular]';

export interface SanitizeLogOptions {
  /**
   * 为 true 时 Error 及对象的 err/error 字段不序列化，透传给 pino 等 serializer 处理（仅 Node + pino 使用）。
   * Edge Runtime / console fallback / client 不传，保持完整序列化。
   */
  passthroughError?: boolean;
  /** 内部递归用（循环引用检测），调用方一般不传 */
  seen?: WeakSet<object>;
}

interface SanitizeContext extends Required<Pick<SanitizeLogOptions, 'passthroughError'>> {
  seen: WeakSet<object>;
}

function replaceNewlines(s: string): string {
  return s.replace(/\n/g, ' | ').replace(/\r/g, '');
}

function getContext(optionsOrSeen?: SanitizeLogOptions | WeakSet<object>): SanitizeContext {
  if (optionsOrSeen instanceof WeakSet) {
    return { seen: optionsOrSeen, passthroughError: false };
  }
  if (
    optionsOrSeen &&
    typeof optionsOrSeen === 'object' &&
    !('add' in optionsOrSeen) &&
    ('passthroughError' in optionsOrSeen || 'seen' in optionsOrSeen)
  ) {
    const opts = optionsOrSeen as SanitizeLogOptions;
    return {
      seen: opts.seen instanceof WeakSet ? opts.seen : new WeakSet(),
      passthroughError: opts.passthroughError ?? false,
    };
  }
  return { seen: new WeakSet(), passthroughError: false };
}

export function sanitizeLogObject(obj: any, optionsOrSeen?: SanitizeLogOptions | WeakSet<object>): any {
  const ctx = getContext(optionsOrSeen);

  if (obj == null) {
    return obj;
  }

  if (obj instanceof Error) {
    if (ctx.passthroughError) return obj;
    return {
      type: obj.name,
      message: replaceNewlines(obj.message ?? ''),
      stack: obj.stack ? replaceNewlines(obj.stack).replace(/\s+/g, ' ').trim() : undefined,
    };
  }

  if (typeof obj === 'string') {
    return replaceNewlines(obj);
  }

  if (Array.isArray(obj)) {
    if (ctx.seen.has(obj)) return CIRCULAR_PLACEHOLDER;
    ctx.seen.add(obj);
    return obj.map((item) => sanitizeLogObject(item, ctx));
  }

  if (typeof obj === 'object') {
    if (ctx.seen.has(obj)) return CIRCULAR_PLACEHOLDER;
    ctx.seen.add(obj);
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (ctx.passthroughError && (key === 'err' || key === 'error')) {
        result[key] = value;
      } else {
        result[key] = sanitizeLogObject(value, ctx);
      }
    }
    return result;
  }

  return obj;
}
