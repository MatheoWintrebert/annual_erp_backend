import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { getConfig, IAppConfig, IMySqlConfig } from '@config/index';
import * as process from 'process';
import { HttpModule } from '@nestjs/axios';
import { HealthcheckController } from '@infrastructure/controllers';
import { AppLoggerMiddleware } from '@infrastructure/middlewares';
import { TableTypeormEntity } from '@infrastructure/entities/table.typeorm.entity';
import { Environment } from '@domain/types';
import { SnakeCaseNamingStrategy } from '@libs/helpers/snake-case-naming-strategy.helper';

const entities = [
  TableTypeormEntity,
]

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [getConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return getTypeORMOptions(configService);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
    JwtModule,
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [
    HealthcheckController,
  ],
  providers: [
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}

function getTypeORMOptions(configService: ConfigService): TypeOrmModuleOptions {
  const mySqlConfig: IMySqlConfig = configService.get('database') as IMySqlConfig;
  const appConfig: IAppConfig = configService.get('app') as IAppConfig;

  const defaultOptions: TypeOrmModuleOptions = {
    type: 'mysql',

    host: mySqlConfig.host,
    port: mySqlConfig.port,
    username: mySqlConfig.user,
    password: mySqlConfig.password,
    database: mySqlConfig.database,
    namingStrategy: new SnakeCaseNamingStrategy(),

    entities,
    synchronize: false,
    autoLoadEntities: true,
    dropSchema: false,
    migrationsRun: false,

    logging: [Environment.Develop, Environment.Local].includes(appConfig.env as Environment),
    logger: 'advanced-console',
  };
  if (appConfig.env === Environment.E2E) {
    return {
      ...defaultOptions,
      dropSchema: true,
      migrationsRun: true,
      migrationsTableName: 'migrations',
      migrations: ['./src/migrations/**/**.ts'],
    };
  }
  return defaultOptions;
}