import { describe, expect, it } from 'vitest';
import { bootstrapApp } from '../../src/runtime/bootstrapApp';

describe('usability startup recovery', () => {
  it('returns blocked startup state with retry recovery action', async () => {
    const result = await bootstrapApp({
      userId: 'user-1',
      resolveMembership: async () => ({ householdId: 'hh-1', role: 'validate' }),
      startupGate: async () => ({
        status: 'fail',
        targetAlias: 'default',
        blockedReasons: ['quick_check_budget_exceeded'],
        quickCheckBudgetMs: 1000,
        quickCheck: {
          status: 'fail',
          durationMs: 2000,
          targetAlias: 'default',
          checks: {
            firebaseConfigValid: true,
            firestoreReachable: false,
            requiredAccountsReady: true,
            membershipFixtureReady: true,
          },
          failures: ['firestore_unreachable'],
        },
      }),
    });

    expect(result.status).toBe('blocked');
    expect(result.reason).toBe('startup_gate_failed');
    expect(result.recoveryActions).toEqual(['retry']);
  });
});
