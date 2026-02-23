import { describe, expect, it } from 'vitest';
import { runStartupGate } from '../../src/runtime/startupGate';

describe('US1 startup fail-closed behavior', () => {
  it('blocks startup when quick checks fail', async () => {
    const result = await runStartupGate({
      targetAlias: 'default',
      runQuickCheck: async () => ({
        status: 'fail',
        durationMs: 1_000,
        targetAlias: 'default',
        checks: {
          firebaseConfigValid: true,
          firestoreReachable: false,
          requiredAccountsReady: false,
          membershipFixtureReady: true,
        },
        failures: ['firestore_unreachable', 'required_accounts_missing'],
      }),
    });

    expect(result.status).toBe('fail');
    expect(result.blockedReasons).toEqual(['firestore_unreachable', 'required_accounts_missing']);
  });
});
