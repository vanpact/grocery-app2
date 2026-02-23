import { describe, expect, it } from 'vitest';

import { authorizeActorScope } from '../../src/auth/transitionAuthorizer';

describe('VR-COM-023 actor scope enforcement', () => {
  it('allows membership-backed household actors only', () => {
    expect(authorizeActorScope({ actorType: 'member', hasMembership: true })).toBe(true);
    expect(authorizeActorScope({ actorType: 'member', hasMembership: false })).toBe(false);
  });

  it('denies service/system actors from direct mutation authority', () => {
    expect(authorizeActorScope({ actorType: 'service', hasMembership: true })).toBe(false);
    expect(authorizeActorScope({ actorType: 'system', hasMembership: true })).toBe(false);
  });
});
