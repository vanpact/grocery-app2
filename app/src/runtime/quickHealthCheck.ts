import { type QuickHealthCheckResult } from './contracts';

type CheckRunner = () => boolean | Promise<boolean>;

export type QuickHealthCheckInput = {
  targetAlias: string;
  firebaseConfigValid: CheckRunner;
  firestoreReachable: CheckRunner;
  requiredAccountsReady: CheckRunner;
  membershipFixtureReady: CheckRunner;
  now?: () => number;
};

export async function runQuickHealthCheck(input: QuickHealthCheckInput): Promise<QuickHealthCheckResult> {
  const now = input.now ?? (() => Date.now());
  const startedAt = now();

  const checks = {
    firebaseConfigValid: await input.firebaseConfigValid(),
    firestoreReachable: await input.firestoreReachable(),
    requiredAccountsReady: await input.requiredAccountsReady(),
    membershipFixtureReady: await input.membershipFixtureReady(),
  };

  const failures: string[] = [];
  if (!checks.firebaseConfigValid) failures.push('firebase_config_invalid');
  if (!checks.firestoreReachable) failures.push('firestore_unreachable');
  if (!checks.requiredAccountsReady) failures.push('required_accounts_missing');
  if (!checks.membershipFixtureReady) failures.push('membership_fixture_missing');

  return {
    status: failures.length === 0 ? 'pass' : 'fail',
    durationMs: now() - startedAt,
    targetAlias: input.targetAlias,
    checks,
    failures,
  };
}
