import { describe, expect, it } from 'vitest';

import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { compareKeyboardPointerOutcomes, toCommittedAction } from '../../src/ui/web/interactionParity';
import { buildUiRefreshEvidenceInput, loadUsabilityFixtures } from '../helpers/usability';

describe('US3 input parity web', () => {
  it('produces equivalent outcomes for add/validate/offline-recovery scenarios', () => {
    const fixtures = loadUsabilityFixtures();
    for (const scenario of fixtures.layoutAndParity.parityScenarios) {
      const keyboard = toCommittedAction('keyboard', scenario.keyboardTrigger, scenario.intent);
      const pointer = toCommittedAction('pointer', scenario.pointerTrigger, scenario.intent);
      const comparison = compareKeyboardPointerOutcomes({
        scenarioId: scenario.scenarioId,
        keyboardActions: [keyboard],
        pointerActions: [pointer],
      });

      expect(comparison.parity).toBe('pass');
      expect(comparison.keyboardHash).toBe(comparison.pointerHash);
    }

    const evaluation = evaluateUiUsabilityEvidence(buildUiRefreshEvidenceInput(fixtures));
    expect(evaluation.successCriteria.sc005).toBe('pass');
    expect(evaluation.parityPassRatePct).toBe(100);
  });
});
