import { type UiUsabilityEvaluation, type UiUsabilityEvidenceInput } from '../../src/runtime/contracts';

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function hasInvalidRuns(taskRuns: UiUsabilityEvidenceInput['taskRuns']): boolean {
  return taskRuns.some((run) => typeof run.durationSeconds !== 'number' || Number.isNaN(run.durationSeconds) || run.durationSeconds < 0);
}

export function evaluateUiUsabilityEvidence(input: UiUsabilityEvidenceInput): UiUsabilityEvaluation {
  const reasonCodes: string[] = [];
  const totalRuns = input.taskRuns.length;

  if (totalRuns === 0) {
    reasonCodes.push('NO_TASK_RUNS');
  }
  if (hasInvalidRuns(input.taskRuns)) {
    reasonCodes.push('INVALID_DURATION');
  }

  const runsWithin90Seconds = input.taskRuns.filter(
    (run) => run.completed && run.deterministic && run.durationSeconds <= 90,
  ).length;

  const completionRatePct = totalRuns === 0 ? 0 : Number(((runsWithin90Seconds / totalRuns) * 100).toFixed(4));
  const sc006Status = completionRatePct >= 90 ? 'pass' : 'fail';
  if (sc006Status === 'fail') {
    reasonCodes.push('SC006_BELOW_THRESHOLD');
  }

  const hasAndroidRun = input.taskRuns.some((run) => run.platform === 'android');
  const hasWebRun = input.taskRuns.some((run) => run.platform === 'web');
  const hasWebKeyboardRun = input.taskRuns.some((run) => run.platform === 'web' && run.inputMode === 'keyboard');
  const hasWebPointerRun = input.taskRuns.some((run) => run.platform === 'web' && run.inputMode === 'pointer');
  const allDeterministic = input.taskRuns.every((run) => run.deterministic);
  const allCompleted = input.taskRuns.every((run) => run.completed);

  if (!hasAndroidRun) {
    reasonCodes.push('MISSING_ANDROID_RUN');
  }
  if (!hasWebRun) {
    reasonCodes.push('MISSING_WEB_RUN');
  }
  if (!hasWebKeyboardRun) {
    reasonCodes.push('MISSING_WEB_KEYBOARD_RUN');
  }
  if (!hasWebPointerRun) {
    reasonCodes.push('MISSING_WEB_POINTER_RUN');
  }
  if (!allDeterministic) {
    reasonCodes.push('NON_DETERMINISTIC_RUN');
  }
  if (!allCompleted) {
    reasonCodes.push('INCOMPLETE_RUN_PRESENT');
  }

  const sc007Status =
    totalRuns > 0 && hasAndroidRun && hasWebRun && hasWebKeyboardRun && hasWebPointerRun && allDeterministic && allCompleted
      ? 'pass'
      : 'fail';
  if (sc007Status === 'fail') {
    reasonCodes.push('SC007_DETERMINISTIC_COVERAGE_FAILED');
  }

  return {
    releaseId: input.releaseId,
    totalRuns,
    runsWithin90Seconds,
    completionRatePct,
    sc006Status,
    sc007Status,
    finalStatus: sc006Status === 'pass' && sc007Status === 'pass' ? 'ready' : 'not_ready',
    reasonCodes: uniqSorted(reasonCodes),
  };
}
