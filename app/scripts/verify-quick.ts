import { pathToFileURL } from 'node:url';
import { createAdminClient } from './lib/adminClient';
import { loadVerificationAccounts, prepareVerificationAccounts, type AccountDirectory } from './lib/accountProvisioning';
import { resolveRequiredConfigPath } from './lib/configPath';
import { loadFixtureManifest } from './lib/fixtureSetup';
import { runQuickHealthCheck } from '../src/runtime/quickHealthCheck';
import { loadTargetProfilesFromConfig, resolveTargetProfile } from '../src/runtime/targetProfiles';

export type QuickVerificationInput = {
  targetAlias?: string;
  targetsConfigPath?: string;
  accountsConfigPath?: string;
  fixturesConfigPath?: string;
  accountDirectory?: AccountDirectory;
  now?: () => number;
};

export type QuickVerificationOutput = {
  targetAlias: string;
  quickCheck: Awaited<ReturnType<typeof runQuickHealthCheck>>;
};

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
      // Missing accounts are surfaced by requiredAccountsReady=false.
    }
  }

  return hydrated;
}

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

function parseFirstPositionalArg(): string | undefined {
  return process.argv.slice(2).find((arg) => !arg.startsWith('--'));
}

export async function runQuickVerification(
  input: QuickVerificationInput = {},
): Promise<QuickVerificationOutput> {
  const targetsConfigPath =
    input.targetsConfigPath ??
    resolveRequiredConfigPath('config/firebase-targets.json', 'config/firebase-targets.example.json');
  const accountsConfigPath =
    input.accountsConfigPath ??
    resolveRequiredConfigPath('config/verification-accounts.json', 'config/verification-accounts.example.json');
  const fixturesConfigPath =
    input.fixturesConfigPath ??
    resolveRequiredConfigPath('config/fixtures.manifest.json', 'config/fixtures.manifest.example.json');

  const profiles = loadTargetProfilesFromConfig(targetsConfigPath);
  const targetProfile = resolveTargetProfile(profiles, input.targetAlias);
  const requirements = loadVerificationAccounts(accountsConfigPath);
  const fixtureManifest = loadFixtureManifest(fixturesConfigPath);
  const adminClient = createAdminClient(targetProfile.firebaseProjectId);
  const hydratedDirectory = adminClient.auth
    ? await hydrateDirectoryFromAuth(adminClient.auth, requirements)
    : {};

  const accountPreparation = await prepareVerificationAccounts({
    requirements,
    directory: {
      ...hydratedDirectory,
      ...(input.accountDirectory ?? {}),
    },
    provisionAccounts: false,
  });

  const hasHouseholdFixtures = (fixtureManifest.fixtures.households ?? []).length > 0;
  const hasListFixtures = (fixtureManifest.fixtures.lists ?? []).length > 0;

  const quickCheck = await runQuickHealthCheck({
    targetAlias: targetProfile.targetAlias,
    firebaseConfigValid: () => profiles.length > 0,
    firestoreReachable: () => adminClient.firestoreReachable,
    requiredAccountsReady: () => accountPreparation.missing.length === 0,
    membershipFixtureReady: () => hasHouseholdFixtures && hasListFixtures,
    now: input.now,
  });

  await adminClient.close();

  return {
    targetAlias: targetProfile.targetAlias,
    quickCheck,
  };
}

async function main() {
  const targetAlias = parseArgValue('--target') ?? parseFirstPositionalArg();
  const output = await runQuickVerification({ targetAlias });
  const serialized = JSON.stringify(output.quickCheck, null, 2);
  // eslint-disable-next-line no-console
  console.log(serialized);

  if (output.quickCheck.status !== 'pass') {
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
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
