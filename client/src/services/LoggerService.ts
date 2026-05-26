export const LogLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export class LoggerService {
  private static instance: LoggerService | null = null;
  private minLevel: LogLevel = LogLevel.Debug;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  debug(message: string, context?: unknown): void {
    this.log(LogLevel.Debug, message, context);
  }

  info(message: string, context?: unknown): void {
    this.log(LogLevel.Info, message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log(LogLevel.Warn, message, context);
  }

  error(message: string, context?: unknown): void {
    this.log(LogLevel.Error, message, context);
  }

  private log(level: LogLevel, message: string, context?: unknown): void {
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

  private shouldLog(level: LogLevel): boolean {
    const order = [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error];
    return order.indexOf(level) >= order.indexOf(this.minLevel);
  }
}
