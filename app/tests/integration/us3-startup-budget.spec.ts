import { describe, expect, it } from 'vitest';
import { runStartupGate } from '../../src/runtime/startupGate';

describe('US3 startup quick-check budget', () => {
  it('blocks startup when quick-check runtime exceeds configured budget', async () => {
    const gate = await runStartupGate({
      targetAlias: 'default',
      quickCheckBudgetMs: 120_000,
      runQuickCheck: async () => ({
        status: 'pass',
        durationMs: 130_000,
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

    expect(gate.status).toBe('fail');
    expect(gate.blockedReasons).toContain('quick_check_budget_exceeded');
  });
});
