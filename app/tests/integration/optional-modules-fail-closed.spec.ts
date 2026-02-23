import { describe, expect, it } from 'vitest';

import {
  clearOptionalModuleRegistry,
  isOptionalModuleEnabled,
  registerOptionalModule,
} from '../../src/features/optionalModuleGuards';

describe('optional modules fail-closed', () => {
  it('keeps module disabled unless explicitly enabled', () => {
    clearOptionalModuleRegistry();

    registerOptionalModule('weekly-suggestions', { enabled: false });

    expect(isOptionalModuleEnabled('weekly-suggestions')).toBe(false);
    expect(isOptionalModuleEnabled('unknown-optional-module')).toBe(false);
  });

  it('allows explicit opt-in for non-committed modules without affecting baseline', () => {
    clearOptionalModuleRegistry();

    registerOptionalModule('weekly-suggestions', {
      enabled: true,
      gateDecision: 'pass',
      owners: ['release-manager'],
      approvals: ['release-manager'],
    });

    expect(isOptionalModuleEnabled('weekly-suggestions')).toBe(true);
    expect(isOptionalModuleEnabled('another-module')).toBe(false);
  });
});
