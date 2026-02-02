import { IsEnum } from 'class-validator';

export enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface ILoggerConfig {
  logLevel: string;
}

export class LoggerConfigValidator implements ILoggerConfig {
  @IsEnum(LogLevel)
  readonly logLevel!: LogLevel;
}

export const getLoggerConfig = (): ILoggerConfig => ({
  logLevel: process.env.LOGGER_LEVEL ?? LogLevel.DEBUG,
});