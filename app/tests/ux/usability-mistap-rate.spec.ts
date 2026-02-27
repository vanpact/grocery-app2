import { describe, expect, it } from 'vitest';
import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { buildUiRefreshEvidenceInput, loadUsabilityFixtures } from '../helpers/usability';

describe('usability mistap rate', () => {
  it('passes SC-003 with mis-tap rate below 5% for top controls', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence(buildUiRefreshEvidenceInput(fixtures));

    expect(evaluation.successCriteria.sc003).toBe('pass');
    expect(evaluation.mistapRatePct).toBeLessThan(5);
  });
});
