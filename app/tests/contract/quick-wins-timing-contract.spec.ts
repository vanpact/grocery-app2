import { describe, expect, it } from 'vitest';
import { evaluateQuickWinsTiming } from '../../scripts/lib/quickWinsTimingEvaluation';
import { buildQuickWinsTimingReport } from '../../scripts/lib/quickWinsTimingReport';
import { loadQuickWinsTimingRunsFixture } from '../helpers/quickWins';

describe('quick-wins timing contract', () => {
  it('computes median improvement and pass status for valid run sets', () => {
    const fixture = loadQuickWinsTimingRunsFixture();
    const evaluation = evaluateQuickWinsTiming({
      baselineRuns: fixture.passCase.baselineRuns.map((entry) => ({ ...entry, mode: 'baseline' as const })),
      quickRuns: fixture.passCase.quickRuns.map((entry) => ({ ...entry, mode: 'quick' as const })),
    });

    const report = buildQuickWinsTimingReport({
      releaseId: 'RC-2026-03-01',
      gateId: 'G-QW-01',
      bundleId: 'EV-QW-BULK-ADD',
      evaluation,
    });

    expect(report.status).toBe('pass');
    expect(report.improvementPct).toBeGreaterThanOrEqual(25);
    expect(report.reasonCodes).toEqual([]);
  });

  it('returns fail with machine-readable reasons for malformed or insufficient runs', () => {
    const fixture = loadQuickWinsTimingRunsFixture();
    const evaluation = evaluateQuickWinsTiming({
      baselineRuns: fixture.failCase.baselineRuns.map((entry) => ({ ...entry, mode: 'baseline' as const })),
      quickRuns: fixture.failCase.quickRuns.map((entry) => ({ ...entry, mode: 'quick' as const })),
    });

    expect(evaluation.status).toBe('fail');
    expect(evaluation.reasonCodes).toEqual(
      expect.arrayContaining([
        'INSUFFICIENT_BASELINE_RUNS',
        'INSUFFICIENT_QUICK_RUNS',
        'INVALID_QUICK_DURATION',
      ]),
    );
  });
});
