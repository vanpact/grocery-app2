import { describe, expect, it } from 'vitest';

import {
  bootstrapSession,
  isMembershipRequiredError,
} from '../../src/auth/sessionBootstrap';
import { buildActiveShoppingScreenModel } from '../../src/ui/screens/ActiveShoppingScreen';

describe('US1 membership-required handling', () => {
  it('returns structured membership_required error with recovery actions', async () => {
    let caught: unknown;

    try {
      await bootstrapSession({
        userId: 'user-no-membership',
        resolveMembership: async () => null,
      });
    } catch (error) {
      caught = error;
    }

    expect(isMembershipRequiredError(caught)).toBe(true);

    if (!isMembershipRequiredError(caught)) {
      return;
    }

    expect(caught.code).toBe('membership_required');
    expect(caught.recoveryActions).toEqual(['retry', 'sign_out']);
  });

  it('builds explicit recovery state when membership is missing', () => {
    const model = buildActiveShoppingScreenModel([], false, { membershipRequired: true });

    expect(model.validatedItems).toEqual([]);
    expect(model.membershipRecovery).toEqual({
      code: 'membership_required',
      message: 'No household membership found for this account.',
      actions: ['retry', 'sign_out'],
    });
  });
});
