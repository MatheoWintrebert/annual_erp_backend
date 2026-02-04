import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import {
  INestApplication,
  ValidationError as NestValidationError,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import * as packageJson from "../package.json";
import * as process from "process";
import { IAppConfig } from "@config/app";
import { ValidationError } from "@domain/errors";
import { Environment, ErrorCode, ERRORS } from "@domain/types";
import { AppModule } from "@infrastructure/modules";
import { getLoggerLevels } from "@libs/helpers";
import { HttpExceptionFilter } from "@infrastructure/filters";

export function createOpenAPIObjectDocs(app: INestApplication): OpenAPIObject {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(packageJson.name)
    .setDescription(packageJson.description)
    .setVersion(packageJson.version)
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLoggerLevels(process.env.LOGGER_LEVEL),
    rawBody: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors: NestValidationError[]): ValidationError =>
        new ValidationError(ERRORS[ErrorCode.DTO_VALIDATION_FAILED].message, {
          code: ErrorCode.DTO_VALIDATION_FAILED,
          details: { validationErrors: errors },
        }),
    })
  );

  app.enableCors({
    credentials: true,
    origin: true,
  });

  const configService = app.get(ConfigService);
  const { env } = configService.get<IAppConfig>("app") ?? {};

  if (env !== Environment.Production) {
    const document = createOpenAPIObjectDocs(app);

    SwaggerModule.setup("/api/docs", app, document);
  }

  return app;
}
