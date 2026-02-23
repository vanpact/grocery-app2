import { pathToFileURL } from 'node:url';
import { type SetupCommandInput, type SetupCommandResult, type SetupMode } from '../src/runtime/contracts';
import { loadTargetProfilesFromConfig, resolveTargetProfile } from '../src/runtime/targetProfiles';
import {
  assertNonDefaultTargetConfirmed,
  assertResetConfirmed,
  buildNonDefaultTargetConfirmationToken,
  buildResetConfirmationToken,
} from './lib/commandGuards';
import { createAdminClient } from './lib/adminClient';
import { loadFixtureManifest, buildBaselineOwnedFixtureKeys, buildResetDeletionPlan, assertResetDeletionPlanInBaselineScope } from './lib/fixtureSetup';
import { loadVerificationAccounts, prepareVerificationAccounts, type AccountDirectory } from './lib/accountProvisioning';
import { resolveRequiredConfigPath } from './lib/configPath';
import { formatSetupResult } from './lib/setupResult';

export type RuntimeSetupState = {
  fixturesByTarget: Record<string, string[]>;
  nonTargetRecordsByTarget: Record<string, string[]>;
  accountDirectoryByTarget: Record<string, AccountDirectory>;
};

export type RunDbSetupInput = SetupCommandInput & {
  targetsConfigPath?: string;
  fixturesConfigPath?: string;
  accountsConfigPath?: string;
  state?: RuntimeSetupState;
};

const DEFAULT_SETUP_PASSWORD = 'RunnableSetup#1234';

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

function hasArgFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function getDefaultTargetAlias(targetsConfigPath: string): string {
  const profiles = loadTargetProfilesFromConfig(targetsConfigPath);
  const defaultProfile = profiles.find((profile) => profile.isDefault);
  if (!defaultProfile) {
    throw new Error('No default target profile configured.');
  }

  return defaultProfile.targetAlias;
}

function createRuntimeSetupState(): RuntimeSetupState {
  return {
    fixturesByTarget: {},
    nonTargetRecordsByTarget: {},
    accountDirectoryByTarget: {},
  };
}

async function hydrateDirectoryFromAuth(
  auth: NonNullable<ReturnType<typeof createAdminClient>['auth']>,
  requirements: Awaited<ReturnType<typeof loadVerificationAccounts>>,
): Promise<AccountDirectory> {
  const hydrated: AccountDirectory = {};

  for (const requirement of requirements) {
    try {
      const user = await auth.getUserByEmail(requirement.email);
      const claims = (user.customClaims ?? {}) as { role?: string; householdId?: string };

      hydrated[requirement.key] = {
        email: requirement.email,
        role: (claims.role as 'suggest' | 'validate') ?? requirement.requiredRole,
        householdId: claims.householdId ?? requirement.requiredHouseholdId,
      };
    } catch {
      // Missing users are handled by account preparation rules.
    }
  }

  return hydrated;
}

function upsertFixtureKeys(targetAlias: string, fixtureKeys: string[], state: RuntimeSetupState): number {
  const current = new Set(state.fixturesByTarget[targetAlias] ?? []);
  for (const key of fixtureKeys) {
    current.add(key);
  }
  state.fixturesByTarget[targetAlias] = [...current].sort();
  return fixtureKeys.length;
}

function resetFixtureKeys(targetAlias: string, fixtureKeys: string[], state: RuntimeSetupState): number {
  const current = new Set(state.fixturesByTarget[targetAlias] ?? []);
  let deleted = 0;
  for (const key of fixtureKeys) {
    if (current.delete(key)) {
      deleted += 1;
    }
  }
  state.fixturesByTarget[targetAlias] = [...current].sort();
  return deleted;
}

export async function runDbSetup(input: RunDbSetupInput = {}): Promise<{
  result: SetupCommandResult;
  state: RuntimeSetupState;
}> {
  const targetsConfigPath =
    input.targetsConfigPath ??
    resolveRequiredConfigPath('config/firebase-targets.json', 'config/firebase-targets.example.json');
  const fixturesConfigPath =
    input.fixturesConfigPath ??
    resolveRequiredConfigPath('config/fixtures.manifest.json', 'config/fixtures.manifest.example.json');
  const accountsConfigPath =
    input.accountsConfigPath ??
    resolveRequiredConfigPath('config/verification-accounts.json', 'config/verification-accounts.example.json');

  const state = input.state ?? createRuntimeSetupState();
  const profiles = loadTargetProfilesFromConfig(targetsConfigPath);
  const profile = resolveTargetProfile(profiles, input.targetAlias);
  const defaultTargetAlias = getDefaultTargetAlias(targetsConfigPath);
  const mode: SetupMode = input.mode ?? 'upsert';

  assertNonDefaultTargetConfirmed({
    targetAlias: profile.targetAlias,
    defaultTargetAlias,
    confirmNonDefaultTarget: input.confirmNonDefaultTarget,
  });

  assertResetConfirmed({
    targetAlias: profile.targetAlias,
    mode,
    allowDestructiveReset: profile.allowDestructiveReset,
    confirmReset: input.confirmReset,
  });

  const fixtureManifest = loadFixtureManifest(fixturesConfigPath);
  const fixtureKeys = buildBaselineOwnedFixtureKeys(fixtureManifest);
  const requirements = loadVerificationAccounts(accountsConfigPath);
  const existingDirectory = state.accountDirectoryByTarget[profile.targetAlias] ?? {};
  state.accountDirectoryByTarget[profile.targetAlias] = existingDirectory;

  const adminClient = createAdminClient(profile.firebaseProjectId);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!adminClient.firestoreReachable) {
    errors.push('firestore_unreachable');
  }
  if (!adminClient.authReachable) {
    errors.push('auth_unreachable');
  }

  let fixtureDeletes = 0;
  if (mode === 'reset') {
    const resetPlan = buildResetDeletionPlan(fixtureManifest);
    assertResetDeletionPlanInBaselineScope(resetPlan);
    fixtureDeletes = resetFixtureKeys(profile.targetAlias, fixtureKeys, state);
  }

  const fixtureUpserts = upsertFixtureKeys(profile.targetAlias, fixtureKeys, state);
  const hydratedDirectory = adminClient.auth
    ? await hydrateDirectoryFromAuth(adminClient.auth, requirements)
    : {};
  const accountDirectory: AccountDirectory = {
    ...hydratedDirectory,
    ...existingDirectory,
  };

  const accountPreparation = await prepareVerificationAccounts({
    requirements,
    directory: accountDirectory,
    provisionAccounts: input.provisionAccounts === true,
    async createMissing(requirement) {
      if (adminClient.auth) {
        try {
          const createdUser = await adminClient.auth.createUser({
            email: requirement.email,
            password: process.env.RUNNABLE_SETUP_PASSWORD ?? DEFAULT_SETUP_PASSWORD,
            displayName: requirement.key,
          });
          await adminClient.auth.setCustomUserClaims(createdUser.uid, {
            role: requirement.requiredRole,
            householdId: requirement.requiredHouseholdId,
          });
        } catch {
          warnings.push(`account_create_remote_failed:${requirement.key}`);
        }
      }

      return {
        email: requirement.email,
        role: requirement.requiredRole,
        householdId: requirement.requiredHouseholdId,
      };
    },
  });

  if (accountPreparation.missing.length > 0) {
    if (input.provisionAccounts === true) {
      errors.push(`accounts_missing_after_provision:${accountPreparation.missing.join(',')}`);
    } else {
      warnings.push(`accounts_missing:${accountPreparation.missing.join(',')}`);
    }
  }

  await adminClient.close();
  state.accountDirectoryByTarget[profile.targetAlias] = accountDirectory;

  const result: SetupCommandResult = {
    status: errors.length > 0 ? 'failure' : 'success',
    targetAlias: profile.targetAlias,
    mode,
    fixtureUpserts,
    fixtureDeletes,
    accountsValidated: accountPreparation.validated.length,
    accountsCreated: accountPreparation.created.length,
    warnings: warnings.sort(),
    errors: errors.sort(),
  };

  return { result, state };
}

async function main() {
  const targetAlias = parseArgValue('--target');
  const modeValue = parseArgValue('--mode');
  const mode: SetupMode = modeValue === 'reset' ? 'reset' : 'upsert';
  const confirmNonDefaultTarget = parseArgValue('--confirm-non-default-target');
  const confirmReset = parseArgValue('--confirm-reset');
  const provisionAccounts = hasArgFlag('--provision-accounts');

  const { result } = await runDbSetup({
    targetAlias,
    mode,
    confirmNonDefaultTarget,
    confirmReset,
    provisionAccounts,
  });

  // eslint-disable-next-line no-console
  console.log(formatSetupResult(result));
  if (result.status !== 'success') {
    process.exitCode = 1;
  }
}

export const confirmationTokens = {
  nonDefaultTarget: buildNonDefaultTargetConfirmationToken,
  reset: buildResetConfirmationToken,
};

const isMainModule = (() => {
  const entryPath = process.argv[1];
  if (!entryPath) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryPath).href;
})();

if (isMainModule) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
