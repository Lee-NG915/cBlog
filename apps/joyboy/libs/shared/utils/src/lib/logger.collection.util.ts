// @ts-nocheck
// DOCS: https://github.com/stripe/stripe-terminal-js-demo/tree/master

// 安全的 JSON.stringify，防止循环引用
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
};

class Logger {
  static collectors = [];
  static serializer = Promise.resolve;

  static setCollectors(collectors) {
    this.collectors = collectors;
  }

  static async forwardToCollectors(log) {
    this.collectors.forEach((collector) => collector.collect(log));
  }

  static log(log) {
    Logger.forwardToCollectors(log);
  }

  static tracedFn(methodName, docsUrl, fn) {
    return async function (...args) {
      const method = methodName || fn.name;
      const requestString = safeStringify(args);
      const UUID = Math.floor(Math.random() * 10000000).toString();
      const trace = {
        id: UUID,
        start_time_ms: new Date().valueOf(),
        method: method,
        docsUrl: docsUrl,
        request: requestString,
        response: null,
        exception: null,
      };

      try {
        const response = await fn.apply(this, args);
        trace.response = safeStringify(response);
        return response;
      } catch (e) {
        trace.exception = e.message;
        throw e;
      } finally {
        Logger.log(trace);
      }
    };
  }

  static watchObject(obj, objName, methodsMetadata) {
    const objPrototype = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(objPrototype)
      .filter((property) => methodsMetadata[property] !== undefined)
      .forEach((instanceMethodName) => {
        obj[instanceMethodName] = Logger.tracedFn(
          objName + '.' + instanceMethodName,
          methodsMetadata[instanceMethodName].docsUrl,
          objPrototype[instanceMethodName]
        );
      });
  }
}

export default Logger;
