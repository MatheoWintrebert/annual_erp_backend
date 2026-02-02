import * as dotenv from 'dotenv';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppConfigValidator, getAppConfig, IAppConfig } from './app';
import { validate } from './validate';


dotenv.config();

export interface IConfig {
  app: IAppConfig;

}

export class ConfigValidator implements IConfig {
  @ValidateNested()
  @Type(() => AppConfigValidator)
  readonly app!: AppConfigValidator;


}

export const getConfig = (): IConfig => {
  const config: IConfig = {
    app: getAppConfig(),

  };

  return validate<IConfig, ConfigValidator>(config, ConfigValidator);
};