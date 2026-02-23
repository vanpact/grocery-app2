import { describe, expect, it } from 'vitest';

import {
  clearOptionalModuleRegistry,
  getOptionalModuleActivation,
  isOptionalModuleEnabled,
  registerOptionalModule,
} from '../../src/features/optionalModuleGuards';

describe('VR-COM-017 optional gate ownership activation', () => {
  it('enables optional module only when feature flag, gate pass, and owner approvals exist', () => {
    clearOptionalModuleRegistry();

    registerOptionalModule('smart-reminders', {
      enabled: true,
      gateDecision: 'pass',
      owners: ['release-manager'],
      approvals: ['release-manager'],
    });

    expect(isOptionalModuleEnabled('smart-reminders')).toBe(true);
    expect(getOptionalModuleActivation('smart-reminders')).toEqual({
      enabled: true,
      reason: 'activation_requirements_satisfied',
    });
  });

  it('fails closed when gate is not pass or owner approvals are missing', () => {
    clearOptionalModuleRegistry();

    registerOptionalModule('smart-reminders', {
      enabled: true,
      gateDecision: 'fail',
      owners: ['release-manager'],
      approvals: ['release-manager'],
    });

    registerOptionalModule('price-alerts', {
      enabled: true,
      gateDecision: 'pass',
      owners: ['release-manager'],
      approvals: [],
    });

    expect(isOptionalModuleEnabled('smart-reminders')).toBe(false);
    expect(isOptionalModuleEnabled('price-alerts')).toBe(false);
    expect(getOptionalModuleActivation('price-alerts').reason).toBe('owner_approval_missing');
  });
});
