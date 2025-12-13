import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { getConfig } from '@config/index';
import * as process from 'process';
import { HttpModule } from '@nestjs/axios';
import { HealthcheckController } from '@infrastructure/controllers';
import { AppLoggerMiddleware } from '@infrastructure/middlewares';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [getConfig],
      isGlobal: true,
    }),
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