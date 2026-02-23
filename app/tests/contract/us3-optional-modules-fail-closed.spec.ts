import { describe, expect, it } from 'vitest';
import {
  clearOptionalModuleRegistry,
  registerOptionalModule,
} from '../../src/features/optionalModuleGuards';
import { evaluateGateDecision } from '../../scripts/lib/gateDecision';

describe('US3 optional module fail-closed contract', () => {
  it('cuts gate decision when optional module activation requirements are not met', () => {
    clearOptionalModuleRegistry();

    const cutDecision = evaluateGateDecision({
      gateId: 'G-QW-01',
      requiredOwners: ['Engineering Lead'],
      approvals: ['Engineering Lead'],
      verificationResults: [
        {
          verificationId: 'VR-COM-001-OFFLINE-REPLAY',
          status: 'pass',
          evidenceRefs: ['raw-data/VR-COM-001-OFFLINE-REPLAY.json'],
        },
      ],
      optionalModules: [{ moduleId: 'smart-reminders' }],
    });

    expect(cutDecision.decision).toBe('cut');
    expect(cutDecision.rationale).toContain('optional_module_fail_closed');

    registerOptionalModule('smart-reminders', {
      enabled: true,
      gateDecision: 'pass',
      owners: ['Engineering Lead'],
      approvals: ['Engineering Lead'],
    });

    const retainDecision = evaluateGateDecision({
      gateId: 'G-QW-01',
      requiredOwners: ['Engineering Lead'],
      approvals: ['Engineering Lead'],
      verificationResults: [
        {
          verificationId: 'VR-COM-001-OFFLINE-REPLAY',
          status: 'pass',
          evidenceRefs: ['raw-data/VR-COM-001-OFFLINE-REPLAY.json'],
        },
      ],
      optionalModules: [{ moduleId: 'smart-reminders' }],
    });

    expect(retainDecision.decision).toBe('retain');
  });
});
