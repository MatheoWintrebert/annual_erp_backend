import 'module-alias/register';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { SnakeCaseNamingStrategy } from '@libs/helpers';
import { Environment } from '@domain/types';

config();

ConfigModule.forRoot({
  envFilePath: `.env.ormconfig`,
});

const configService = new ConfigService();
const isProduction = configService.get('NODE_ENV') === Environment.Production;

export default new DataSource({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USER'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DATABASE'),
  namingStrategy: new SnakeCaseNamingStrategy(),
  logging: false,
  synchronize: false,
  entities: [(isProduction ? 'dist/' : '') + 'src/infrastructure/**/**.entity{.ts,.js}'],
  migrations: [(isProduction ? 'dist/' : '') + 'src/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
});
