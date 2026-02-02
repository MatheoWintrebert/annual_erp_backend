
import { LogLevel } from '@config/logger';
import { LogLevel as NestLogLevel } from '@nestjs/common/services/logger.service';

export function getLoggerLevels(logLevel?: LogLevel | string): NestLogLevel[] {
  switch (logLevel) {
    case LogLevel.VERBOSE:
      return ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'];
    case LogLevel.DEBUG:
      return ['debug', 'log', 'warn', 'error', 'fatal'];
    case LogLevel.INFO:
      return ['log', 'warn', 'error', 'fatal'];
    case LogLevel.WARN:
      return ['warn', 'error', 'fatal'];
    case LogLevel.ERROR:
      return ['error', 'fatal'];
    default:
      return ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'];
  }
}