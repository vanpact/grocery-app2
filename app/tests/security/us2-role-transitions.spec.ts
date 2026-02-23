import { describe, expect, it } from 'vitest';

import { authorizeTransition } from '../../src/auth/transitionAuthorizer';

describe('US2 role transition enforcement', () => {
  it('allows suggest role on draft -> suggested', () => {
    expect(authorizeTransition('suggest', 'draft', 'suggested')).toBe(true);
  });

  it('denies suggest role on validator-only transitions', () => {
    expect(authorizeTransition('suggest', 'suggested', 'validated')).toBe(false);
    expect(authorizeTransition('suggest', 'validated', 'bought')).toBe(false);
  });

  it('allows validate role transitions', () => {
    expect(authorizeTransition('validate', 'suggested', 'validated')).toBe(true);
    expect(authorizeTransition('validate', 'validated', 'bought')).toBe(true);
    expect(authorizeTransition('validate', 'bought', 'validated')).toBe(true);
  });
});
