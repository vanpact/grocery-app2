import { describe, expect, it } from 'vitest';
import { canTransition, SECURITY_POLICY } from '../../src/auth/policy';
import { authorizeActorScope } from '../../src/auth/transitionAuthorizer';

describe('usability security regression', () => {
  it('keeps role, transition, and household isolation invariants unchanged', () => {
    expect(SECURITY_POLICY.roles).toEqual(['suggest', 'validate']);
    expect(SECURITY_POLICY.household_isolation).toBe('required');
    expect(canTransition('suggest', 'suggested', 'validated')).toBe(false);
    expect(canTransition('validate', 'suggested', 'validated')).toBe(true);
    expect(authorizeActorScope({ actorType: 'member', hasMembership: true })).toBe(true);
    expect(authorizeActorScope({ actorType: 'service', hasMembership: true })).toBe(false);
  });
});
