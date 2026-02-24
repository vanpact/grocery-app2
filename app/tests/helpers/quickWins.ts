import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInMemoryQuickTemplateRepository } from '../../src/items/quickTemplateRepository';
import { type Item, type QuickTemplate } from '../../src/types';

type TemplatesFixture = {
  templates: QuickTemplate[];
};

type ProjectionScenariosFixture = {
  valid: {
    templateId: string;
    multiplier: number;
    householdId: string;
    listId: string;
  };
  cancel: {
    templateId: string;
    multiplier: number;
    householdId: string;
    listId: string;
  };
  invalidMultiplier: {
    templateId: string;
    multiplier: number;
    householdId: string;
    listId: string;
  };
};

type TimingRunsFixture = {
  passCase: {
    baselineRuns: Array<{ runId: string; durationMs: number; scenarioId: string }>;
    quickRuns: Array<{ runId: string; durationMs: number; scenarioId: string }>;
  };
  failCase: {
    baselineRuns: Array<{ runId: string; durationMs: number; scenarioId: string }>;
    quickRuns: Array<{ runId: string; durationMs: number; scenarioId: string }>;
  };
};

function loadJsonFixture<T>(relativePath: string): T {
  const fullPath = resolve(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8')) as T;
}

export function loadQuickWinsTemplatesFixture(): TemplatesFixture {
  return loadJsonFixture<TemplatesFixture>('tests/fixtures/quick-wins/templates.json');
}

export function loadQuickWinsProjectionScenariosFixture(): ProjectionScenariosFixture {
  return loadJsonFixture<ProjectionScenariosFixture>('tests/fixtures/quick-wins/projection-scenarios.json');
}

export function loadQuickWinsTimingRunsFixture(): TimingRunsFixture {
  return loadJsonFixture<TimingRunsFixture>('tests/fixtures/quick-wins/timing-runs.json');
}

export function createQuickWinsFixtureWorkspace() {
  const templatesFixture = loadQuickWinsTemplatesFixture();
  const repository = createInMemoryQuickTemplateRepository(templatesFixture.templates);

  const baseItems: Item[] = [
    {
      itemId: 'item-1',
      householdId: 'hh-1',
      listId: 'list-1',
      name: 'Milk',
      nameSlug: 'milk',
      aisleKey: 'dairy',
      status: 'draft',
      qty: 1,
      version: 1,
    },
    {
      itemId: 'item-2',
      householdId: 'hh-1',
      listId: 'list-1',
      name: 'Carrots',
      nameSlug: 'carrots',
      aisleKey: 'produce',
      status: 'suggested',
      qty: 2,
      version: 1,
    },
  ];

  return {
    templatesFixture,
    repository,
    baseItems,
  };
}
