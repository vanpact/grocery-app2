import { describe, expect, it } from 'vitest';

import { emulatorAllowsHouseholdAccess, emulatorAllowsTransition } from './emulator.setup';

describe('US2 security regression pack', () => {
  it('keeps allow/deny matrix stable', () => {
    expect(emulatorAllowsTransition('suggest', 'draft', 'suggested')).toBe(true);
    expect(emulatorAllowsTransition('suggest', 'suggested', 'validated')).toBe(false);
    expect(emulatorAllowsTransition('validate', 'validated', 'bought')).toBe(true);
    expect(emulatorAllowsTransition('validate', 'bought', 'validated')).toBe(true);
  });

  it('enforces strict household isolation', () => {
    expect(emulatorAllowsHouseholdAccess('hh-1', 'hh-1')).toBe(true);
    expect(emulatorAllowsHouseholdAccess('hh-1', 'hh-2')).toBe(false);
  });
});
