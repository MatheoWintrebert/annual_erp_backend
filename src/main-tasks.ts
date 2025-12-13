import { AppModule } from '@infrastructure/modules';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error', 'debug', 'log']);
}

bootstrap();