import { AppModule } from "@infrastructure/modules";
import { CommandFactory } from "nest-commander";

async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, ["warn", "error", "debug", "log"]);
}

void bootstrap();
