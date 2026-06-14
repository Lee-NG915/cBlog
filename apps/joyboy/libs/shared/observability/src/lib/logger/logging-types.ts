export interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

export interface LogFn {
  (msg: string, obj?: object): void;
}
