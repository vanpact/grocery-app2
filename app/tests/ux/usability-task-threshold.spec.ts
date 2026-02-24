import { describe, expect, it } from 'vitest';
import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { loadUsabilityFixtures } from '../helpers/usability';

describe('usability task threshold', () => {
  it('passes SC-006 with deterministic task-run fixtures at >=90% within 90s', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence({
      releaseId: fixtures.taskRuns.releaseId,
      taskRuns: fixtures.taskRuns.runs,
    });

    expect(evaluation.sc006Status).toBe('pass');
    expect(evaluation.completionRatePct).toBeGreaterThanOrEqual(90);
  });
});
