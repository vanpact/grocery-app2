import { describe, expect, it } from 'vitest';

import {
  assertHouseholdSurfaceAccess,
  canAccessHouseholdSurface,
} from '../../src/households/householdAccessGuard';

describe('VR-COM-016 household isolation query surfaces', () => {
  it('allows document/aggregate/stream access inside same household', () => {
    expect(canAccessHouseholdSurface('hh-1', 'hh-1', 'document')).toBe(true);
    expect(canAccessHouseholdSurface('hh-1', 'hh-1', 'aggregate')).toBe(true);
    expect(canAccessHouseholdSurface('hh-1', 'hh-1', 'stream')).toBe(true);
  });

  it('denies cross-household access for all surfaces', () => {
    expect(canAccessHouseholdSurface('hh-1', 'hh-2', 'document')).toBe(false);
    expect(canAccessHouseholdSurface('hh-1', 'hh-2', 'aggregate')).toBe(false);
    expect(canAccessHouseholdSurface('hh-1', 'hh-2', 'stream')).toBe(false);

    expect(() => assertHouseholdSurfaceAccess('hh-1', 'hh-2', 'aggregate')).toThrow(
      'Cross-household aggregate access denied.',
    );
  });
});
