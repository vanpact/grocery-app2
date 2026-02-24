import { describe, expect, it } from 'vitest';
import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { buildUiUsabilitySummaryReport } from '../../scripts/lib/uiUsabilityReport';
import { loadUsabilityFixtures } from '../helpers/usability';

describe('ui usability evidence contract', () => {
  it('produces SC-006/SC-007/SC-008 contract-compliant summary output', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence({
      releaseId: fixtures.taskRuns.releaseId,
      taskRuns: fixtures.taskRuns.runs,
    });
    const summary = buildUiUsabilitySummaryReport({ evaluation });

    expect(summary.releaseId).toBe(fixtures.taskRuns.releaseId);
    expect(summary.successCriteria.sc006).toBe('pass');
    expect(summary.successCriteria.sc007).toBe('fail');
    expect(summary.successCriteria.sc008).toBe('not_ready');
    expect(summary.metrics.totalRuns).toBe(fixtures.taskRuns.runs.length);
  });
});
