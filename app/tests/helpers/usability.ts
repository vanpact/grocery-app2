import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type UiUsabilityEvidenceInput, type UiUsabilityTaskRun } from '../../src/runtime/contracts';

type TaskRunFixture = {
  releaseId: string;
  runs: UiUsabilityTaskRun[];
};

type StateMatrixFixture = {
  destinations: string[];
  requiredStates: string[];
  expectedRecoveryActions: Record<string, string[]>;
};

type LayoutAndParityFixture = {
  viewports: Array<{
    id: string;
    width: number;
    expectedBand: '<600' | '600-839' | '840-1199' | '>=1200';
    expectedLayout: 'single-pane' | 'two-pane';
  }>;
  parityScenarios: Array<{
    scenarioId: string;
    intent: string;
    keyboardTrigger: string;
    pointerTrigger: string;
  }>;
};

type UiRefreshTaskRunsFixture = {
  releaseId: string;
  baselineRuns: UiUsabilityTaskRun[];
  refreshedRuns: UiUsabilityTaskRun[];
};

type UiRefreshToolScenarioFixture = {
  releaseId: string;
  tool: 'playwright' | 'mobile-mcp';
  platform: 'web' | 'android';
  scenarios: Array<{
    screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings';
    scenarioId: string;
    artifactPath: string;
    status: 'captured' | 'missing';
  }>;
};

type UiRefreshActionRecognitionFixture = {
  releaseId: string;
  runs: Array<{
    participantId: string;
    platform: 'web' | 'android';
    screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings';
    secondsToPrimaryAction: number;
    recognizedOnFirstAttempt: boolean;
  }>;
};

type UiRefreshMistapFixture = {
  releaseId: string;
  controls: Array<{
    controlId: string;
    platform: 'web' | 'android';
    attempts: number;
    mistaps: number;
  }>;
};

type UiRefreshClarityFixture = {
  releaseId: string;
  responses: Array<{
    sessionId: string;
    platform: 'web' | 'android';
    navigationClarityScore: number;
    actionHierarchyScore: number;
  }>;
};

export type UsabilityFixtures = {
  taskRuns: TaskRunFixture;
  stateMatrix: StateMatrixFixture;
  layoutAndParity: LayoutAndParityFixture;
  uiRefreshTaskRuns: UiRefreshTaskRunsFixture;
  uiRefreshPlaywrightScenarios: UiRefreshToolScenarioFixture;
  uiRefreshMobileScenarios: UiRefreshToolScenarioFixture;
  uiRefreshActionRecognition: UiRefreshActionRecognitionFixture;
  uiRefreshMistapEvents: UiRefreshMistapFixture;
  uiRefreshClarityFeedback: UiRefreshClarityFixture;
};

function readFixture<T>(relativePath: string): T {
  const path = resolve(process.cwd(), 'tests', 'fixtures', 'usability', relativePath);
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function loadUsabilityFixtures(): UsabilityFixtures {
  return {
    taskRuns: readFixture<TaskRunFixture>('task-runs.json'),
    stateMatrix: readFixture<StateMatrixFixture>('state-matrix.json'),
    layoutAndParity: readFixture<LayoutAndParityFixture>('layout-and-parity.json'),
    uiRefreshTaskRuns: readFixture<UiRefreshTaskRunsFixture>('ui-refresh-task-runs.json'),
    uiRefreshPlaywrightScenarios: readFixture<UiRefreshToolScenarioFixture>('ui-refresh-playwright-scenarios.json'),
    uiRefreshMobileScenarios: readFixture<UiRefreshToolScenarioFixture>('ui-refresh-mobile-scenarios.json'),
    uiRefreshActionRecognition: readFixture<UiRefreshActionRecognitionFixture>('ui-refresh-action-recognition.json'),
    uiRefreshMistapEvents: readFixture<UiRefreshMistapFixture>('ui-refresh-mistap-events.json'),
    uiRefreshClarityFeedback: readFixture<UiRefreshClarityFixture>('ui-refresh-clarity-feedback.json'),
  };
}

export function summarizeUsabilityTaskRuns(runs: UiUsabilityTaskRun[]): {
  totalRuns: number;
  completedWithinThreshold: number;
  completionRatePct: number;
} {
  const completedWithinThreshold = runs.filter((run) => run.completed && run.durationSeconds <= 90).length;
  const totalRuns = runs.length;

  return {
    totalRuns,
    completedWithinThreshold,
    completionRatePct: totalRuns === 0 ? 0 : Number(((completedWithinThreshold / totalRuns) * 100).toFixed(4)),
  };
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(4));
  }

  return Number(sorted[mid].toFixed(4));
}

export function summarizeUiRefreshTiming(
  fixture: UiRefreshTaskRunsFixture,
): {
  baselineMedianSeconds: number;
  refreshedMedianSeconds: number;
  improvementPct: number;
} {
  const baselineMedianSeconds = median(fixture.baselineRuns.map((run) => run.durationSeconds));
  const refreshedMedianSeconds = median(fixture.refreshedRuns.map((run) => run.durationSeconds));
  const improvementPct =
    baselineMedianSeconds <= 0
      ? 0
      : Number((((baselineMedianSeconds - refreshedMedianSeconds) / baselineMedianSeconds) * 100).toFixed(4));

  return {
    baselineMedianSeconds,
    refreshedMedianSeconds,
    improvementPct,
  };
}

export function buildUiRefreshEvidenceInput(fixtures: UsabilityFixtures): UiUsabilityEvidenceInput {
  return {
    releaseId: fixtures.uiRefreshTaskRuns.releaseId,
    baselineTaskRuns: fixtures.uiRefreshTaskRuns.baselineRuns,
    refreshedTaskRuns: fixtures.uiRefreshTaskRuns.refreshedRuns,
    actionRecognitionRuns: fixtures.uiRefreshActionRecognition.runs,
    mistapEvents: fixtures.uiRefreshMistapEvents.controls,
    clarityFeedback: fixtures.uiRefreshClarityFeedback.responses,
    responsiveLayoutChecks: fixtures.stateMatrix.destinations.flatMap((destination) =>
      ['<600', '600-839', '840-1199', '>=1200'].map((viewportBand) => ({
        screenId: destination as 'sign-in' | 'active-shopping' | 'overview' | 'settings',
        viewportBand: viewportBand as '<600' | '600-839' | '840-1199' | '>=1200',
        passed: true,
      })),
    ),
    inputParityChecks: fixtures.layoutAndParity.parityScenarios.map((scenario) => ({
      scenarioId: scenario.scenarioId,
      passed: true,
    })),
    accessibilityChecks: fixtures.stateMatrix.destinations.flatMap((destination) => [
      {
        screenId: destination as 'sign-in' | 'active-shopping' | 'overview' | 'settings',
        platform: 'web' as const,
        focusVisibilityPass: true,
        keyboardTraversalPass: true,
        textScalingPass: true,
        touchTargetPass: true,
        finalStatus: 'pass' as const,
      },
      {
        screenId: destination as 'sign-in' | 'active-shopping' | 'overview' | 'settings',
        platform: 'android' as const,
        focusVisibilityPass: true,
        keyboardTraversalPass: 'n/a' as const,
        textScalingPass: true,
        touchTargetPass: true,
        finalStatus: 'pass' as const,
      },
    ]),
    toolArtifacts: [
      ...fixtures.uiRefreshPlaywrightScenarios.scenarios.map((scenario) => ({
        releaseId: fixtures.uiRefreshPlaywrightScenarios.releaseId,
        tool: fixtures.uiRefreshPlaywrightScenarios.tool,
        platform: fixtures.uiRefreshPlaywrightScenarios.platform,
        screenId: scenario.screenId,
        scenarioId: scenario.scenarioId,
        artifactPath: scenario.artifactPath,
        status: scenario.status,
      })),
      ...fixtures.uiRefreshMobileScenarios.scenarios.map((scenario) => ({
        releaseId: fixtures.uiRefreshMobileScenarios.releaseId,
        tool: fixtures.uiRefreshMobileScenarios.tool,
        platform: fixtures.uiRefreshMobileScenarios.platform,
        screenId: scenario.screenId,
        scenarioId: scenario.scenarioId,
        artifactPath: scenario.artifactPath,
        status: scenario.status,
      })),
    ],
    beforeAfterPairs: fixtures.stateMatrix.destinations.flatMap((screenId) => [
      {
        releaseId: fixtures.uiRefreshTaskRuns.releaseId,
        screenId: screenId as 'sign-in' | 'active-shopping' | 'overview' | 'settings',
        platform: 'web' as const,
        beforeArtifactPath: `artifacts/playwright/before/${screenId}.png`,
        afterArtifactPath: `artifacts/playwright/after/${screenId}.png`,
        status: 'paired' as const,
      },
      {
        releaseId: fixtures.uiRefreshTaskRuns.releaseId,
        screenId: screenId as 'sign-in' | 'active-shopping' | 'overview' | 'settings',
        platform: 'android' as const,
        beforeArtifactPath: `artifacts/mobile/before/${screenId}.png`,
        afterArtifactPath: `artifacts/mobile/after/${screenId}.png`,
        status: 'paired' as const,
      },
    ]),
  };
}
