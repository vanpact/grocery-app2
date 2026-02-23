import { describe, expect, it } from 'vitest';

import { SECURITY_POLICY, TRANSITION_RULES } from '../../src/auth/policy';
import { isOptionalModuleEnabled, registerOptionalModule } from '../../src/features/optionalModuleGuards';

describe('Security and gate contracts', () => {
  it('matches committed security policy shape', () => {
    expect(SECURITY_POLICY).toEqual({
      auth_provider: 'firebase_auth',
      roles: ['suggest', 'validate'],
      actor_authority: 'membership_only',
      household_isolation: 'required',
      default_decision: 'deny',
    });
  });

  it('includes required transition contracts', () => {
    expect(TRANSITION_RULES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 'draft', to: 'suggested', allowed_roles: ['suggest', 'validate'] }),
        expect.objectContaining({ from: 'suggested', to: 'validated', allowed_roles: ['validate'] }),
        expect.objectContaining({ from: 'validated', to: 'bought', allowed_roles: ['validate'] }),
        expect.objectContaining({ from: 'bought', to: 'validated', allowed_roles: ['validate'] }),
      ]),
    );
  });

  it('keeps optional modules fail-closed by default', () => {
    registerOptionalModule('smart-reminders', { enabled: false });

    expect(isOptionalModuleEnabled('smart-reminders')).toBe(false);
    expect(isOptionalModuleEnabled('missing-module')).toBe(false);
  });
});
