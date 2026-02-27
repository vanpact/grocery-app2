import { describe, expect, it } from 'vitest';
import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { buildUiRefreshEvidenceInput, loadUsabilityFixtures } from '../helpers/usability';

describe('usability action recognition threshold', () => {
  it('passes SC-001 when >=90% of sessions identify the primary action within 5 seconds', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence(buildUiRefreshEvidenceInput(fixtures));

    expect(evaluation.successCriteria.sc001).toBe('pass');
    expect(evaluation.recognizedWithin5sPct).toBeGreaterThanOrEqual(90);
  });
});
