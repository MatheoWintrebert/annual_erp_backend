import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

export function validate<K, T extends object>(config: K, ValidationClass: new () => T): T {
  const validatedConfig = plainToClass(ValidationClass, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}