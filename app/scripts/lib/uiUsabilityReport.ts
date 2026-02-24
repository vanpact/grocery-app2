import { type UiUsabilityEvaluation, type UiUsabilitySummaryReport } from '../../src/runtime/contracts';

export function buildUiUsabilitySummaryReport(input: {
  evaluation: UiUsabilityEvaluation;
}): UiUsabilitySummaryReport {
  return {
    releaseId: input.evaluation.releaseId,
    successCriteria: {
      sc006: input.evaluation.sc006Status,
      sc007: input.evaluation.sc007Status,
      sc008: input.evaluation.finalStatus,
    },
    metrics: {
      totalRuns: input.evaluation.totalRuns,
      runsWithin90Seconds: input.evaluation.runsWithin90Seconds,
      completionRatePct: input.evaluation.completionRatePct,
    },
    reasonCodes: [...input.evaluation.reasonCodes].sort(),
  };
}

export function toUiUsabilitySummaryMarkdown(input: { evaluation: UiUsabilityEvaluation }): string {
  const summary = buildUiUsabilitySummaryReport({ evaluation: input.evaluation });
  const lines = [
    '## UI Usability Summary',
    '',
    '| criteria | status |',
    '| --- | --- |',
    `| SC-006 | ${summary.successCriteria.sc006} |`,
    `| SC-007 | ${summary.successCriteria.sc007} |`,
    `| SC-008 | ${summary.successCriteria.sc008} |`,
    '',
    '| metric | value |',
    '| --- | --- |',
    `| total runs | ${summary.metrics.totalRuns} |`,
    `| runs <= 90s | ${summary.metrics.runsWithin90Seconds} |`,
    `| completion rate pct | ${summary.metrics.completionRatePct} |`,
    '',
    `reason codes: ${summary.reasonCodes.length === 0 ? 'none' : summary.reasonCodes.join(', ')}`,
    '',
  ];

  return lines.join('\n');
}
