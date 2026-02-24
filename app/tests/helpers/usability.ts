import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type UiUsabilityTaskRun } from '../../src/runtime/contracts';

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
    expectedLayout: 'mobile' | 'tablet' | 'desktop-two-pane';
  }>;
  parityScenarios: Array<{
    scenarioId: string;
    intent: string;
    keyboardTrigger: string;
    pointerTrigger: string;
  }>;
};

export type UsabilityFixtures = {
  taskRuns: TaskRunFixture;
  stateMatrix: StateMatrixFixture;
  layoutAndParity: LayoutAndParityFixture;
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
