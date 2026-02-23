import { pathToFileURL } from 'node:url';
import { runReleaseReadiness, type RunReleaseReadinessInput, type RunReleaseReadinessOutput } from './lib/releaseReadinessRunner';

function parseArgValue(flag: string): string | undefined {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index < 0) {
    return undefined;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--') || value === '--') {
    return undefined;
  }

  return value;
}

function parsePositionalArgs(): string[] {
  return process.argv.slice(2).filter((arg) => !arg.startsWith('--') && arg !== '--');
}

function requireArg(flag: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required argument: ${flag}`);
  }

  return value;
}

export function runReleaseReadinessCommand(input: RunReleaseReadinessInput): RunReleaseReadinessOutput {
  return runReleaseReadiness(input);
}

function main() {
  const positional = parsePositionalArgs();
  const releaseId = requireArg('--release', parseArgValue('--release') ?? positional[0]);
  const scope = parseArgValue('--scope') ?? positional[1];

  const output = runReleaseReadinessCommand({
    releaseId,
    scope,
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output.report, null, 2));

  if (output.report.status !== 'ready') {
    process.exitCode = 1;
  }
}

const isMainModule = (() => {
  const entryPath = process.argv[1];
  if (!entryPath) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryPath).href;
})();

if (isMainModule) {
  try {
    main();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
