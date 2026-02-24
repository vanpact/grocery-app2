import { describe, expect, it } from 'vitest';
import { bootstrapApp } from '../../src/runtime/bootstrapApp';

describe('usability membership recovery', () => {
  it('returns standardized membership-required recovery actions', async () => {
    const result = await bootstrapApp({
      userId: 'missing-membership-user',
      resolveMembership: async () => null,
      startupGate: async () => ({
        status: 'pass',
        targetAlias: 'default',
        blockedReasons: [],
        quickCheckBudgetMs: 120000,
        quickCheck: {
          status: 'pass',
          durationMs: 10,
          targetAlias: 'default',
          checks: {
            firebaseConfigValid: true,
            firestoreReachable: true,
            requiredAccountsReady: true,
            membershipFixtureReady: true,
          },
          failures: [],
        },
      }),
    });

    expect(result.status).toBe('blocked');
    expect(result.reason).toBe('membership_required');
    expect(result.recoveryActions).toEqual(['retry_membership', 'sign_out']);
  });
});
