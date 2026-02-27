import { describe, expect, it } from 'vitest';
import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { buildUiUsabilitySummaryReport } from '../../scripts/lib/uiUsabilityReport';
import { buildUiRefreshEvidenceInput, loadUsabilityFixtures } from '../helpers/usability';

describe('ui usability evidence contract', () => {
  it('produces SC-001..SC-007 contract-compliant summary output', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence(buildUiRefreshEvidenceInput(fixtures));
    const summary = buildUiUsabilitySummaryReport({ evaluation });

    expect(summary.releaseId).toBe(fixtures.uiRefreshTaskRuns.releaseId);
    expect(summary.successCriteria.sc001).toBe('pass');
    expect(summary.successCriteria.sc002).toBe('pass');
    expect(summary.successCriteria.sc003).toBe('pass');
    expect(summary.successCriteria.sc004).toBe('pass');
    expect(summary.successCriteria.sc005).toBe('pass');
    expect(summary.successCriteria.sc006).toBe('pass');
    expect(summary.successCriteria.sc007).toBe('pass');
    expect(summary.finalStatus).toBe('ready');
    expect(summary.metrics.totalRecognitionRuns).toBe(fixtures.uiRefreshActionRecognition.runs.length);
  });

  it('fails SC-007 when before/after evidence pairing is incomplete', () => {
    const fixtures = loadUsabilityFixtures();
    const input = buildUiRefreshEvidenceInput(fixtures);
    const evaluation = evaluateUiUsabilityEvidence({
      ...input,
      beforeAfterPairs: [],
    });

    expect(evaluation.successCriteria.sc007).toBe('fail');
    expect(evaluation.reasonCodes).toEqual(expect.arrayContaining(['BEFORE_AFTER_PAIRING_INCOMPLETE']));
  });
});
