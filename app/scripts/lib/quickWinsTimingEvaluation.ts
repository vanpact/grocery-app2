import { type QuickWinsTimingRun } from '../../src/runtime/contracts';

export type QuickWinsTimingEvaluation = {
  status: 'pass' | 'fail';
  baselineMedianMs: number;
  quickMedianMs: number;
  improvementPct: number;
  runCountBaseline: number;
  runCountQuick: number;
  reasonCodes: string[];
};

export type EvaluateQuickWinsTimingInput = {
  baselineRuns: QuickWinsTimingRun[];
  quickRuns: QuickWinsTimingRun[];
  minimumRunsPerMode?: number;
  requiredImprovementPct?: number;
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function hasInvalidDurations(runs: QuickWinsTimingRun[]): boolean {
  return runs.some((run) => typeof run.durationMs !== 'number' || Number.isNaN(run.durationMs) || run.durationMs < 0);
}

export function evaluateQuickWinsTiming(input: EvaluateQuickWinsTimingInput): QuickWinsTimingEvaluation {
  const minimumRunsPerMode = input.minimumRunsPerMode ?? 5;
  const requiredImprovementPct = input.requiredImprovementPct ?? 25;
  const reasonCodes: string[] = [];

  if (input.baselineRuns.length < minimumRunsPerMode) {
    reasonCodes.push('INSUFFICIENT_BASELINE_RUNS');
  }
  if (input.quickRuns.length < minimumRunsPerMode) {
    reasonCodes.push('INSUFFICIENT_QUICK_RUNS');
  }
  if (hasInvalidDurations(input.baselineRuns)) {
    reasonCodes.push('INVALID_BASELINE_DURATION');
  }
  if (hasInvalidDurations(input.quickRuns)) {
    reasonCodes.push('INVALID_QUICK_DURATION');
  }

  const baselineMedianMs = median(input.baselineRuns.map((run) => run.durationMs));
  const quickMedianMs = median(input.quickRuns.map((run) => run.durationMs));

  if (baselineMedianMs <= 0) {
    reasonCodes.push('INVALID_BASELINE_MEDIAN');
  }

  const improvementPct = baselineMedianMs > 0 ? ((baselineMedianMs - quickMedianMs) / baselineMedianMs) * 100 : 0;
  if (improvementPct < requiredImprovementPct) {
    reasonCodes.push('IMPROVEMENT_BELOW_THRESHOLD');
  }

  return {
    status: reasonCodes.length === 0 ? 'pass' : 'fail',
    baselineMedianMs,
    quickMedianMs,
    improvementPct,
    runCountBaseline: input.baselineRuns.length,
    runCountQuick: input.quickRuns.length,
    reasonCodes: uniqSorted(reasonCodes),
  };
}
