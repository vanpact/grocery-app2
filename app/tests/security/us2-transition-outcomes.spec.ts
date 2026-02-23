import { describe, expect, it } from 'vitest';

import { getTransitionOutcome } from '../../src/auth/transitionAuthorizer';

describe('VR-COM-012 transition outcome semantics', () => {
  it('returns allowed decision for valid transition', () => {
    expect(
      getTransitionOutcome({
        role: 'validate',
        from: 'suggested',
        to: 'validated',
        actorHouseholdId: 'hh-1',
        targetHouseholdId: 'hh-1',
      }),
    ).toEqual({ decision: 'allowed', mutatesState: true });
  });

  it('returns transition_not_allowed for denied transition', () => {
    expect(
      getTransitionOutcome({
        role: 'suggest',
        from: 'suggested',
        to: 'validated',
      }),
    ).toEqual({ decision: 'transition_not_allowed', mutatesState: false });
  });

  it('returns household_mismatch before role checks', () => {
    expect(
      getTransitionOutcome({
        role: 'validate',
        from: 'suggested',
        to: 'validated',
        actorHouseholdId: 'hh-1',
        targetHouseholdId: 'hh-2',
      }),
    ).toEqual({ decision: 'household_mismatch', mutatesState: false });
  });

  it('returns noop for same-state transitions', () => {
    expect(
      getTransitionOutcome({
        role: 'validate',
        from: 'validated',
        to: 'validated',
      }),
    ).toEqual({ decision: 'noop', mutatesState: false });
  });
});
