import {
  type RefreshedDestination,
  type RefreshedPlatform,
  type UiAccessibilityCheck,
  type UiUsabilityEvaluation,
  type UiUsabilityEvidenceInput,
  type ViewportBand,
} from '../../src/runtime/contracts';

const REQUIRED_SCREENS: RefreshedDestination[] = ['sign-in', 'active-shopping', 'overview', 'settings'];
const REQUIRED_PLATFORMS: RefreshedPlatform[] = ['web', 'android'];
const REQUIRED_BANDS: ViewportBand[] = ['<600', '600-839', '840-1199', '>=1200'];

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
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(4));
  }

  return Number(sorted[middle].toFixed(4));
}

function toPct(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(4));
}

function hasNonNegativeDurations(values: number[]): boolean {
  return values.every((value) => Number.isFinite(value) && !Number.isNaN(value) && value >= 0);
}

function evaluateArtifactPresence(input: UiUsabilityEvidenceInput): string[] {
  const missingArtifacts: string[] = [];

  if (input.toolArtifacts.filter((artifact) => artifact.tool === 'playwright').length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-playwright-artifacts.json');
  }
  if (input.toolArtifacts.filter((artifact) => artifact.tool === 'mobile-mcp').length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-mobile-mcp-artifacts.json');
  }
  if (input.beforeAfterPairs.length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-before-after-index.json');
  }
  if (input.accessibilityChecks.length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-accessibility-summary.json');
  }
  if (input.clarityFeedback.length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-clarity-summary.json');
  }
  if (input.mistapEvents.length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-mistap-summary.json');
  }
  if (input.baselineTaskRuns.length === 0 || input.refreshedTaskRuns.length === 0) {
    missingArtifacts.push('raw-data/ui-refresh-timing-summary.json');
  }

  return uniqSorted(missingArtifacts);
}

function evaluateToolCoverage(input: UiUsabilityEvidenceInput): boolean {
  for (const screenId of REQUIRED_SCREENS) {
    const hasPlaywright = input.toolArtifacts.some(
      (artifact) =>
        artifact.tool === 'playwright' &&
        artifact.platform === 'web' &&
        artifact.screenId === screenId &&
        artifact.status === 'captured',
    );
    const hasMobile = input.toolArtifacts.some(
      (artifact) =>
        artifact.tool === 'mobile-mcp' &&
        artifact.platform === 'android' &&
        artifact.screenId === screenId &&
        artifact.status === 'captured',
    );
    if (!hasPlaywright || !hasMobile) {
      return false;
    }
  }

  return true;
}

function evaluateBeforeAfterPairing(input: UiUsabilityEvidenceInput): boolean {
  for (const screenId of REQUIRED_SCREENS) {
    for (const platform of REQUIRED_PLATFORMS) {
      const paired = input.beforeAfterPairs.some(
        (pair) => pair.screenId === screenId && pair.platform === platform && pair.status === 'paired',
      );
      if (!paired) {
        return false;
      }
    }
  }

  return true;
}

function evaluateAccessibilityCoverage(checks: UiAccessibilityCheck[]): {
  completeCoverage: boolean;
  allPassed: boolean;
  passRatePct: number;
} {
  const expectedCount = REQUIRED_SCREENS.length * REQUIRED_PLATFORMS.length;
  const passedCount = checks.filter((check) => {
    const keyboardTraversalValid =
      check.platform === 'web'
        ? check.keyboardTraversalPass === true
        : check.keyboardTraversalPass === true || check.keyboardTraversalPass === 'n/a';
    return (
      check.finalStatus === 'pass' &&
      check.focusVisibilityPass &&
      keyboardTraversalValid &&
      check.textScalingPass &&
      check.touchTargetPass
    );
  }).length;
  const coverageComplete = REQUIRED_SCREENS.every((screenId) =>
    REQUIRED_PLATFORMS.every((platform) =>
      checks.some((check) => check.screenId === screenId && check.platform === platform),
    ),
  );

  return {
    completeCoverage: coverageComplete,
    allPassed: coverageComplete && checks.length === expectedCount && passedCount === expectedCount,
    passRatePct: toPct(passedCount, expectedCount),
  };
}

function evaluateResponsiveCoverage(input: UiUsabilityEvidenceInput): {
  completeCoverage: boolean;
  allPassed: boolean;
  passRatePct: number;
} {
  const expectedCount = REQUIRED_SCREENS.length * REQUIRED_BANDS.length;
  const passedCount = input.responsiveLayoutChecks.filter((check) => check.passed).length;
  const coverageComplete = REQUIRED_SCREENS.every((screenId) =>
    REQUIRED_BANDS.every((band) =>
      input.responsiveLayoutChecks.some((check) => check.screenId === screenId && check.viewportBand === band),
    ),
  );

  return {
    completeCoverage: coverageComplete,
    allPassed: coverageComplete && input.responsiveLayoutChecks.length === expectedCount && passedCount === expectedCount,
    passRatePct: toPct(passedCount, expectedCount),
  };
}

export function evaluateUiUsabilityEvidence(input: UiUsabilityEvidenceInput): UiUsabilityEvaluation {
  const reasonCodes: string[] = [];
  const missingArtifacts = evaluateArtifactPresence(input);
  if (missingArtifacts.length > 0) {
    reasonCodes.push('MISSING_REQUIRED_UI_REFRESH_ARTIFACTS');
  }

  const recognitionRuns = input.actionRecognitionRuns;
  if (recognitionRuns.length < 10) {
    reasonCodes.push('INSUFFICIENT_RECOGNITION_SAMPLE_SIZE');
  }
  const recognizedWithin5sCount = recognitionRuns.filter(
    (run) => run.recognizedOnFirstAttempt && run.secondsToPrimaryAction <= 5,
  ).length;
  const recognizedWithin5sPct = toPct(recognizedWithin5sCount, recognitionRuns.length);
  const recognitionPlatformCoverage = REQUIRED_PLATFORMS.every((platform) =>
    recognitionRuns.some((run) => run.platform === platform),
  );
  const sc001 = recognizedWithin5sPct >= 90 && recognitionRuns.length >= 10 && recognitionPlatformCoverage ? 'pass' : 'fail';
  if (sc001 === 'fail') {
    reasonCodes.push('SC001_PRIMARY_ACTION_RECOGNITION_FAILED');
  }

  const baselineDurations = input.baselineTaskRuns.map((run) => run.durationSeconds);
  const refreshedDurations = input.refreshedTaskRuns.map((run) => run.durationSeconds);
  if (!hasNonNegativeDurations([...baselineDurations, ...refreshedDurations])) {
    reasonCodes.push('INVALID_TASK_RUN_DURATION');
  }
  const baselineMedianSeconds = median(baselineDurations);
  const refreshedMedianSeconds = median(refreshedDurations);
  const improvementPct =
    baselineMedianSeconds <= 0
      ? 0
      : Number((((baselineMedianSeconds - refreshedMedianSeconds) / baselineMedianSeconds) * 100).toFixed(4));
  const sc002 = improvementPct >= 25 ? 'pass' : 'fail';
  if (sc002 === 'fail') {
    reasonCodes.push('SC002_TIMING_IMPROVEMENT_BELOW_THRESHOLD');
  }

  const totalMistaps = input.mistapEvents.reduce((sum, event) => sum + event.mistaps, 0);
  const totalAttempts = input.mistapEvents.reduce((sum, event) => sum + event.attempts, 0);
  const mistapRatePct = toPct(totalMistaps, totalAttempts);
  const sc003 = totalAttempts > 0 && mistapRatePct < 5 ? 'pass' : 'fail';
  if (sc003 === 'fail') {
    reasonCodes.push('SC003_MISTAP_RATE_TOO_HIGH');
  }

  const responsiveEvaluation = evaluateResponsiveCoverage(input);
  const sc004 = responsiveEvaluation.allPassed ? 'pass' : 'fail';
  if (!responsiveEvaluation.completeCoverage) {
    reasonCodes.push('RESPONSIVE_COVERAGE_INCOMPLETE');
  }
  if (sc004 === 'fail') {
    reasonCodes.push('SC004_RESPONSIVE_LAYOUT_FAILED');
  }

  const parityPassCount = input.inputParityChecks.filter((check) => check.passed).length;
  const parityPassRatePct = toPct(parityPassCount, input.inputParityChecks.length);
  const sc005 = input.inputParityChecks.length > 0 && parityPassCount === input.inputParityChecks.length ? 'pass' : 'fail';
  if (sc005 === 'fail') {
    reasonCodes.push('SC005_INPUT_PARITY_FAILED');
  }

  const clarityValues = input.clarityFeedback.map(
    (response) => (response.navigationClarityScore + response.actionHierarchyScore) / 2,
  );
  const clarityAverage =
    clarityValues.length === 0
      ? 0
      : Number((clarityValues.reduce((sum, value) => sum + value, 0) / clarityValues.length).toFixed(4));
  const sc006 = clarityAverage >= 4.0 ? 'pass' : 'fail';
  if (sc006 === 'fail') {
    reasonCodes.push('SC006_CLARITY_SCORE_BELOW_THRESHOLD');
  }

  const accessibilityEvaluation = evaluateAccessibilityCoverage(input.accessibilityChecks);
  const hasToolCoverage = evaluateToolCoverage(input);
  const hasBeforeAfterPairing = evaluateBeforeAfterPairing(input);
  const sc007 = accessibilityEvaluation.allPassed && hasToolCoverage && hasBeforeAfterPairing ? 'pass' : 'fail';
  if (!hasToolCoverage) {
    reasonCodes.push('TOOL_EVIDENCE_COVERAGE_INCOMPLETE');
  }
  if (!hasBeforeAfterPairing) {
    reasonCodes.push('BEFORE_AFTER_PAIRING_INCOMPLETE');
  }
  if (sc007 === 'fail') {
    reasonCodes.push('SC007_ACCESSIBILITY_OR_EVIDENCE_FAILED');
  }

  const successCriteria = {
    sc001,
    sc002,
    sc003,
    sc004,
    sc005,
    sc006,
    sc007,
  } as const;

  const finalStatus =
    Object.values(successCriteria).every((status) => status === 'pass') && missingArtifacts.length === 0 ? 'ready' : 'not_ready';

  return {
    releaseId: input.releaseId,
    totalRecognitionRuns: recognitionRuns.length,
    recognizedWithin5sPct,
    baselineMedianSeconds,
    refreshedMedianSeconds,
    improvementPct,
    mistapRatePct,
    clarityAverage,
    responsivePassRatePct: responsiveEvaluation.passRatePct,
    parityPassRatePct,
    accessibilityPassRatePct: accessibilityEvaluation.passRatePct,
    successCriteria,
    missingArtifacts,
    finalStatus,
    reasonCodes: uniqSorted(reasonCodes),
  };
}
