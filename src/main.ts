import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createApp } from "./app.utils";
import { IAppConfig } from "@config/app";
import { Environment } from "@domain/types";

async function bootstrap(): Promise<void> {
  const app = await createApp();

  const configService = app.get(ConfigService);
  const { port, env } = configService.get<IAppConfig>("app") ?? {
    port: 3333,
    env: Environment.Local,
  };

  if (env !== Environment.E2E) {
    app.enableShutdownHooks();
  }

  await app.listen(port, () => {
    Logger.log(
      `Listening at http://localhost:${String(port)}/api/docs`,
      "Server"
    );
  });
}

void bootstrap();
