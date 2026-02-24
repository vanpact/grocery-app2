import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadTargetProfilesFromConfig, resolveTargetProfile } from '../src/runtime/targetProfiles';
import { resolveRequiredConfigPath } from './lib/configPath';
import { runCommittedVerification, type RuleStatusOverride } from './lib/runCommittedVerification';

export type FullVerificationInput = {
  targetAlias?: string;
  releaseId: string;
  gateId: string;
  bundleId: string;
  approvals?: string[];
  requiredOwners?: string[];
  statusOverrides?: RuleStatusOverride;
  targetsConfigPath?: string;
  evidenceRootDir?: string;
  now?: () => Date;
};

export type FullVerificationOutput = ReturnType<typeof runCommittedVerification>;

function parseArgValue(flag: string): string | undefined {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index < 0) {
    return undefined;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    return undefined;
  }

  return value;
}

function requireArg(flag: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required argument: ${flag}`);
  }

  return value;
}

function parsePositionalArgs(): string[] {
  return process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
}

export function runFullVerification(input: FullVerificationInput): FullVerificationOutput {
  const targetsConfigPath =
    input.targetsConfigPath ??
    resolveRequiredConfigPath('config/firebase-targets.json', 'config/firebase-targets.example.json');

  const profiles = loadTargetProfilesFromConfig(targetsConfigPath);
  const targetProfile = resolveTargetProfile(profiles, input.targetAlias);

  return runCommittedVerification({
    targetAlias: targetProfile.targetAlias,
    releaseId: input.releaseId,
    gateId: input.gateId,
    bundleId: input.bundleId,
    approvals: input.approvals,
    requiredOwners: input.requiredOwners,
    statusOverrides: input.statusOverrides,
    evidenceRootDir: input.evidenceRootDir ?? resolve(process.cwd(), '..', 'evidence'),
    now: input.now,
  });
}

function main() {
  const positional = parsePositionalArgs();
  const targetAlias = parseArgValue('--target') ?? positional[0];
  const releaseId = requireArg('--release', parseArgValue('--release') ?? positional[1]);
  const gateId = requireArg('--gate', parseArgValue('--gate') ?? positional[2]);
  const bundleId = requireArg('--bundle', parseArgValue('--bundle') ?? positional[3]);

  const output = runFullVerification({
    targetAlias,
    releaseId,
    gateId,
    bundleId,
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output.runResult, null, 2));

  if (output.runResult.status !== 'passed') {
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
