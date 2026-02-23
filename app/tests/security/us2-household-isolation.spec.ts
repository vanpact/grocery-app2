import { describe, expect, it } from 'vitest';

import { assertHouseholdRepositoryAccess } from '../../src/households/householdAccessGuard';

describe('US2 household isolation', () => {
  it('allows access to own household only', () => {
    expect(() => assertHouseholdRepositoryAccess('hh-1', 'hh-1')).not.toThrow();
  });

  it('denies cross-household read/write', () => {
    expect(() => assertHouseholdRepositoryAccess('hh-1', 'hh-2')).toThrow(
      'Cross-household document access denied.',
    );
  });
});
