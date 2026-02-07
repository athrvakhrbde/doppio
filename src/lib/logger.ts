export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, userId, ip, userAgent } = entry;
    
    let logString = `[${timestamp}] ${level}: ${message}`;
    
    if (userId) logString += ` (user: ${userId})`;
    if (ip) logString += ` (ip: ${ip})`;
    
    if (context) {
      logString += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }
    
    return logString;
  }

  private createEntry(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      // These will be populated by middleware in production
    };
  }

  error(message: string, context?: any): void {
    const entry = this.createEntry(LogLevel.ERROR, message, context);
    const formatted = this.formatLog(entry);
    
    if (this.isDevelopment) {
      console.error(formatted);
    } else {
      // In production, you might send this to a logging service
      console.error(formatted);
    }
  }

  warn(message: string, context?: any): void {
    const entry = this.createEntry(LogLevel.WARN, message, context);
    const formatted = this.formatLog(entry);
    
    if (this.isDevelopment) {
      console.warn(formatted);
    } else {
      console.warn(formatted);
    }
  }

  info(message: string, context?: any): void {
    const entry = this.createEntry(LogLevel.INFO, message, context);
    const formatted = this.formatLog(entry);
    
    if (this.isDevelopment) {
      console.info(formatted);
    } else {
      console.info(formatted);
    }
  }

  debug(message: string, context?: any): void {
    if (!this.isDevelopment) return;
    
    const entry = this.createEntry(LogLevel.DEBUG, message, context);
    const formatted = this.formatLog(entry);
    
    console.debug(formatted);
  }

  // Log API requests
  logRequest(method: string, url: string, userId?: string, ip?: string): void {
    this.info(`${method} ${url}`, { userId, ip });
  }

  // Log authentication events
  logAuth(event: string, userId?: string, email?: string, ip?: string): void {
    this.info(`Auth: ${event}`, { userId, email, ip });
  }

  // Log errors with context
  logError(error: Error, context?: any): void {
    this.error(error.message, {
      stack: error.stack,
      ...context
    });
  }
}

export const logger = new Logger();
