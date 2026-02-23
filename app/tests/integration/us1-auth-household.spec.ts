import { describe, expect, it } from 'vitest';

import { bootstrapSession } from '../../src/auth/sessionBootstrap';

describe('US1 auth + household bootstrap', () => {
  it('returns resolved household session for authenticated user', async () => {
    const session = await bootstrapSession({
      userId: 'user-1',
      resolveMembership: async (userId) => {
        if (userId !== 'user-1') {
          return null;
        }

        return { householdId: 'hh-1', role: 'validate' };
      },
    });

    expect(session).toEqual({
      userId: 'user-1',
      householdId: 'hh-1',
      role: 'validate',
    });
  });

  it('throws when user has no household membership', async () => {
    await expect(
      bootstrapSession({
        userId: 'user-2',
        resolveMembership: async () => null,
      }),
    ).rejects.toThrow('No household membership found.');
  });
});
