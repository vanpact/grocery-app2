import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolveRequiredConfigPath(configPath: string, templatePath: string): string {
  if (existsSync(configPath)) {
    return resolve(configPath);
  }

  if (existsSync(templatePath)) {
    throw new Error(
      `Missing required config "${configPath}". Create it from "${templatePath}" before running this command.`,
    );
  }

  throw new Error(`Missing required config "${configPath}" and template "${templatePath}".`);
}
