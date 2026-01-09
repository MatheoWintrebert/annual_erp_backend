import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export interface IMySqlConfig {
  host: string;
  user: string;
  password?: string;
  port: number;
  database: string;
  dropSchema: boolean;
  migrationsRun: boolean;
}

export class DatabaseConfigValidator implements IMySqlConfig {
  @IsString()
  readonly host!: string;

  @IsString()
  readonly user!: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsNumber()
  readonly port!: number;

  @IsString()
  readonly database!: string;

  @IsBoolean()
  readonly dropSchema!: boolean;

  @IsBoolean()
  readonly migrationsRun!: boolean;
}

export const getMySqlConfig = (): IMySqlConfig => ({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  database: process.env.MYSQL_DATABASE,
  dropSchema: process.env.MYSQL_DROP_SCHEMA === 'true',
  migrationsRun: process.env.MYSQL_MIGRATIONS_RUN === 'true',
});
