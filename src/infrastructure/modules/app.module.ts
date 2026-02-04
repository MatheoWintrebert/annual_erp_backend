import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { getConfig, IAppConfig, IMySqlConfig } from "@config/index";
import * as process from "process";
import { HttpModule } from "@nestjs/axios";
import {
  CompanySettingsController,
  HealthcheckController,
  PalettierController,
  PalettierTypeController,
} from "@infrastructure/controllers";
import { AppLoggerMiddleware } from "@infrastructure/middlewares";
import {
  CompanySettingsTypeormEntity,
  LotTypeormEntity,
  PaletteLotTypeormEntity,
  PaletteTypeormEntity,
  PalettierTypeormEntity,
  PalettierTypeTypeormEntity,
  ProductRuleTypeormEntity,
  ProductTypeormEntity,
  RulePlacementConstraintConfigTypeormEntity,
  RuleProductIncompatibilityConfigTypeormEntity,
  RuleStorageConditionConfigTypeormEntity,
  RuleStorageConditionPalettierTypeormEntity,
  RuleTypeormEntity,
  RuleZonePriorityConfigTypeormEntity,
  RuleZonePriorityPalettierTypeormEntity,
  TableTypeormEntity,
  UnitOfMeasureTypeormEntity,
} from "@infrastructure/entities";
import {
  CompanySettingsMysqlRepository,
  PalettierMysqlRepository,
  PalettierTypeMysqlRepository,
} from "@infrastructure/repositories";
import {
  CompanySettingsRepository,
  PalettierRepository,
  PalettierTypeRepository,
} from "@domain/repositories";
import {
  CreatePalettiersUseCase,
  CreatePalettierTypeUseCase,
  GetCompanySettingsUseCase,
  GetPalettierByIdUseCase,
  GetPalettierTypeByIdUseCase,
  GetPalettiersUseCase,
  GetPalettierTypesUseCase,
  UpdateCompanySettingsUseCase,
  UpdatePalettierTypeUseCase,
  UpdatePalettierUseCase,
} from "@application/use-cases";
import { Environment } from "@domain/types";
import { SnakeCaseNamingStrategy } from "@libs/helpers";

const entities = [
  TableTypeormEntity,
  CompanySettingsTypeormEntity,
  UnitOfMeasureTypeormEntity,
  ProductTypeormEntity,
  LotTypeormEntity,
  PalettierTypeTypeormEntity,
  PalettierTypeormEntity,
  PaletteTypeormEntity,
  PaletteLotTypeormEntity,
  RuleTypeormEntity,
  ProductRuleTypeormEntity,
  RuleZonePriorityConfigTypeormEntity,
  RuleZonePriorityPalettierTypeormEntity,
  RuleProductIncompatibilityConfigTypeormEntity,
  RuleStorageConditionConfigTypeormEntity,
  RuleStorageConditionPalettierTypeormEntity,
  RulePlacementConstraintConfigTypeormEntity,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV ?? "local"}`,
      load: [getConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
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
    CompanySettingsController,
    PalettierController,
    PalettierTypeController,
  ],
  providers: [
    {
      provide: CompanySettingsRepository,
      useClass: CompanySettingsMysqlRepository,
    },
    {
      provide: PalettierRepository,
      useClass: PalettierMysqlRepository,
    },
    {
      provide: PalettierTypeRepository,
      useClass: PalettierTypeMysqlRepository,
    },
    GetCompanySettingsUseCase,
    UpdateCompanySettingsUseCase,
    CreatePalettiersUseCase,
    GetPalettiersUseCase,
    GetPalettierByIdUseCase,
    UpdatePalettierUseCase,
    CreatePalettierTypeUseCase,
    GetPalettierTypesUseCase,
    GetPalettierTypeByIdUseCase,
    UpdatePalettierTypeUseCase,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}

function getTypeORMOptions(configService: ConfigService): TypeOrmModuleOptions {
  const mySqlConfig = configService.get<IMySqlConfig>("database");
  const appConfig = configService.get<IAppConfig>("app");

  if (!mySqlConfig) {
    throw new Error("Database configuration is missing");
  }

  const env = appConfig?.env ?? Environment.Local;

  const defaultOptions: TypeOrmModuleOptions = {
    type: "mysql",

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

    logging: [Environment.Develop, Environment.Local].includes(env),
    logger: "advanced-console",
  };
  if (env === Environment.E2E) {
    return {
      ...defaultOptions,
      dropSchema: true,
      migrationsRun: true,
      migrationsTableName: "migrations",
      migrations: ["./src/migrations/**/**.ts"],
    };
  }
  return defaultOptions;
}
