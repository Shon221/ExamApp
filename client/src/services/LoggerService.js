export const LogLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
};

export class LoggerService {
  static instance = null;

  constructor() {
    this.minLevel = LogLevel.Debug;
  }

  static getInstance() {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  setMinLevel(level) {
    this.minLevel = level;
  }

  debug(message, context) {
    this.log(LogLevel.Debug, message, context);
  }

  info(message, context) {
    this.log(LogLevel.Info, message, context);
  }

  warn(message, context) {
    this.log(LogLevel.Warn, message, context);
  }

  error(message, context) {
    this.log(LogLevel.Error, message, context);
  }

  log(level, message, context) {
    if (!this.shouldLog(level)) return;
    const prefix = `[${level.toUpperCase()}] ${new Date().toISOString()}`;
    const payload = context !== undefined ? [message, context] : [message];
    switch (level) {
      case LogLevel.Debug:
        console.debug(prefix, ...payload);
        break;
      case LogLevel.Info:
        console.info(prefix, ...payload);
        break;
      case LogLevel.Warn:
        console.warn(prefix, ...payload);
        break;
      case LogLevel.Error:
        console.error(prefix, ...payload);
        break;
    }
  }

  shouldLog(level) {
    const order = [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error];
    return order.indexOf(level) >= order.indexOf(this.minLevel);
  }
}
