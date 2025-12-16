import { Environment } from '@domain/types';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import * as process from 'process';

export interface IAppConfig {
  env?: Environment;
  port: number;
  appHost?: string;
  storageHost?: string;
}

export class AppConfigValidator implements IAppConfig {
  @IsOptional()
  @IsEnum(Environment)
  readonly env?: Environment;

  @IsInt()
  readonly port!: number;

  @IsOptional()
  readonly appHost?: string;

  @IsOptional()
  readonly storageHost?: string;
}

export const getAppConfig = (): IAppConfig => ({
  env: (process.env.NODE_ENV as Environment) ?? Environment.Local,
  port: parseInt(`${process.env.PORT || 3333}`, 10),
  appHost: process.env.APP_HOST,
  storageHost: process.env.STORAGE_HOST,
});