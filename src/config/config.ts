import * as dotenv from "dotenv";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AppConfigValidator, getAppConfig, IAppConfig } from "./app";
import {
  DatabaseConfigValidator,
  getMySqlConfig,
  IMySqlConfig,
} from "./database";
import { validate } from "./validate";

dotenv.config();

export interface IConfig {
  app: IAppConfig;
  database: IMySqlConfig;
}

export class ConfigValidator implements IConfig {
  @ValidateNested()
  @Type(() => AppConfigValidator)
  readonly app!: AppConfigValidator;

  @ValidateNested()
  @Type(() => DatabaseConfigValidator)
  readonly database!: DatabaseConfigValidator;
}

export const getConfig = (): IConfig => {
  const config: IConfig = {
    app: getAppConfig(),
    database: getMySqlConfig(),
  };

  return validate<ConfigValidator>(
    config as unknown as Record<string, unknown>,
    ConfigValidator
  );
};
