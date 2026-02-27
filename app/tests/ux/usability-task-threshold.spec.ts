import { describe, expect, it } from 'vitest';
import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { buildUiRefreshEvidenceInput, loadUsabilityFixtures } from '../helpers/usability';

describe('usability task threshold', () => {
  it('passes SC-002 when refreshed core-flow median improves by at least 25%', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence(buildUiRefreshEvidenceInput(fixtures));

    expect(evaluation.successCriteria.sc002).toBe('pass');
    expect(evaluation.improvementPct).toBeGreaterThanOrEqual(25);
  });
});
