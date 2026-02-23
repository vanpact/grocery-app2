import { describe, expect, it } from 'vitest';
import { runStartupGate } from '../../src/runtime/startupGate';

describe('US1 startup quick-check success path', () => {
  it('passes startup gate when quick checks pass within budget', async () => {
    const result = await runStartupGate({
      targetAlias: 'default',
      quickCheckBudgetMs: 120_000,
      runQuickCheck: async () => ({
        status: 'pass',
        durationMs: 1_500,
        targetAlias: 'default',
        checks: {
          firebaseConfigValid: true,
          firestoreReachable: true,
          requiredAccountsReady: true,
          membershipFixtureReady: true,
        },
        failures: [],
      }),
    });

    expect(result.status).toBe('pass');
    expect(result.blockedReasons).toEqual([]);
  });
});
