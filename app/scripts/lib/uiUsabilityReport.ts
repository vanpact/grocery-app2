import { type UiUsabilityEvaluation, type UiUsabilitySummaryReport } from '../../src/runtime/contracts';

export function buildUiUsabilitySummaryReport(input: {
  evaluation: UiUsabilityEvaluation;
}): UiUsabilitySummaryReport {
  return {
    releaseId: input.evaluation.releaseId,
    successCriteria: {
      ...input.evaluation.successCriteria,
    },
    metrics: {
      totalRecognitionRuns: input.evaluation.totalRecognitionRuns,
      recognizedWithin5sPct: input.evaluation.recognizedWithin5sPct,
      baselineMedianSeconds: input.evaluation.baselineMedianSeconds,
      refreshedMedianSeconds: input.evaluation.refreshedMedianSeconds,
      improvementPct: input.evaluation.improvementPct,
      mistapRatePct: input.evaluation.mistapRatePct,
      clarityAverage: input.evaluation.clarityAverage,
      responsivePassRatePct: input.evaluation.responsivePassRatePct,
      parityPassRatePct: input.evaluation.parityPassRatePct,
      accessibilityPassRatePct: input.evaluation.accessibilityPassRatePct,
    },
    missingArtifacts: [...input.evaluation.missingArtifacts].sort(),
    finalStatus: input.evaluation.finalStatus,
    reasonCodes: [...input.evaluation.reasonCodes].sort(),
  };
}

export function mapUiUsabilityReasonCodesToSuccessCriteria(reasonCodes: string[]): Record<string, string[]> {
  const mapping: Record<string, string[]> = {
    'SC-001': [],
    'SC-002': [],
    'SC-003': [],
    'SC-004': [],
    'SC-005': [],
    'SC-006': [],
    'SC-007': [],
  };

  for (const reasonCode of reasonCodes) {
    if (reasonCode.includes('SC001')) {
      mapping['SC-001'].push(reasonCode);
    } else if (reasonCode.includes('SC002')) {
      mapping['SC-002'].push(reasonCode);
    } else if (reasonCode.includes('SC003')) {
      mapping['SC-003'].push(reasonCode);
    } else if (reasonCode.includes('SC004') || reasonCode.includes('RESPONSIVE')) {
      mapping['SC-004'].push(reasonCode);
    } else if (reasonCode.includes('SC005') || reasonCode.includes('PARITY')) {
      mapping['SC-005'].push(reasonCode);
    } else if (reasonCode.includes('SC006') || reasonCode.includes('CLARITY')) {
      mapping['SC-006'].push(reasonCode);
    } else if (
      reasonCode.includes('SC007') ||
      reasonCode.includes('ACCESSIBILITY') ||
      reasonCode.includes('TOOL_EVIDENCE') ||
      reasonCode.includes('BEFORE_AFTER')
    ) {
      mapping['SC-007'].push(reasonCode);
    }
  }

  return mapping;
}

export function toUiUsabilitySummaryMarkdown(input: { evaluation: UiUsabilityEvaluation }): string {
  const summary = buildUiUsabilitySummaryReport({ evaluation: input.evaluation });
  const reasonCodeMap = mapUiUsabilityReasonCodesToSuccessCriteria(summary.reasonCodes);
  const lines = [
    '## UI Refresh Usability Summary',
    '',
    '| criteria | status | reason codes |',
    '| --- | --- | --- |',
    `| SC-001 | ${summary.successCriteria.sc001} | ${reasonCodeMap['SC-001'].join(', ') || 'none'} |`,
    `| SC-002 | ${summary.successCriteria.sc002} | ${reasonCodeMap['SC-002'].join(', ') || 'none'} |`,
    `| SC-003 | ${summary.successCriteria.sc003} | ${reasonCodeMap['SC-003'].join(', ') || 'none'} |`,
    `| SC-004 | ${summary.successCriteria.sc004} | ${reasonCodeMap['SC-004'].join(', ') || 'none'} |`,
    `| SC-005 | ${summary.successCriteria.sc005} | ${reasonCodeMap['SC-005'].join(', ') || 'none'} |`,
    `| SC-006 | ${summary.successCriteria.sc006} | ${reasonCodeMap['SC-006'].join(', ') || 'none'} |`,
    `| SC-007 | ${summary.successCriteria.sc007} | ${reasonCodeMap['SC-007'].join(', ') || 'none'} |`,
    '',
    '| metric | value |',
    '| --- | --- |',
    `| recognition runs | ${summary.metrics.totalRecognitionRuns} |`,
    `| recognized <= 5s pct | ${summary.metrics.recognizedWithin5sPct} |`,
    `| baseline median seconds | ${summary.metrics.baselineMedianSeconds} |`,
    `| refreshed median seconds | ${summary.metrics.refreshedMedianSeconds} |`,
    `| SC-002 improvement pct | ${summary.metrics.improvementPct} |`,
    `| mistap rate pct | ${summary.metrics.mistapRatePct} |`,
    `| clarity average | ${summary.metrics.clarityAverage} |`,
    `| responsive pass rate pct | ${summary.metrics.responsivePassRatePct} |`,
    `| input parity pass rate pct | ${summary.metrics.parityPassRatePct} |`,
    `| accessibility pass rate pct | ${summary.metrics.accessibilityPassRatePct} |`,
    '',
    `missing artifacts: ${summary.missingArtifacts.length === 0 ? 'none' : summary.missingArtifacts.join(', ')}`,
    `final status: ${summary.finalStatus}`,
    `reason codes: ${summary.reasonCodes.length === 0 ? 'none' : summary.reasonCodes.join(', ')}`,
    '',
  ];

  return lines.join('\n');
}
