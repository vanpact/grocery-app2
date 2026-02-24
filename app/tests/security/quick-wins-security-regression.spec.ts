import { describe, expect, it } from 'vitest';
import { emulatorAllowsHouseholdAccess, emulatorAllowsTransition } from './emulator.setup';
import { createInMemoryQuickTemplateRepository } from '../../src/items/quickTemplateRepository';
import { createQuickWinsService } from '../../src/items/quickWinsService';
import { type QuickTemplate } from '../../src/types';
import { createQuickWinsFixtureWorkspace, loadQuickWinsProjectionScenariosFixture } from '../helpers/quickWins';

describe('quick-wins security regression', () => {
  it('keeps household isolation and committed role transitions unchanged', () => {
    expect(emulatorAllowsHouseholdAccess('hh-1', 'hh-1')).toBe(true);
    expect(emulatorAllowsHouseholdAccess('hh-1', 'hh-2')).toBe(false);

    expect(emulatorAllowsTransition('suggest', 'suggested', 'validated')).toBe(false);
    expect(emulatorAllowsTransition('validate', 'suggested', 'validated')).toBe(true);
  });

  it('rejects cross-household template access in quick-wins flow', () => {
    const workspace = createQuickWinsFixtureWorkspace();
    const scenarios = loadQuickWinsProjectionScenariosFixture();
    const service = createQuickWinsService(workspace.repository);

    const outcome = service.executeQuickWins({
      actorHouseholdId: 'hh-1',
      householdId: 'hh-1',
      listId: scenarios.valid.listId,
      templateId: 'tpl-other-household',
      multiplier: scenarios.valid.multiplier,
      existingItems: workspace.baseItems,
      confirm: true,
    });

    expect(outcome.status).toBe('rejected');
    expect(outcome.rejectionReason).toBe('cross_household_denied');
  });

  it('resolves templates by household when template IDs collide', () => {
    const templates = [
      {
        templateId: 'tpl-shared',
        householdId: 'hh-1',
        name: 'Shared ID for Household 1',
        kind: 'pack',
        items: [{ name: 'Oats', aisleKey: 'dry', baseQty: 1 }],
      },
      {
        templateId: 'tpl-shared',
        householdId: 'hh-2',
        name: 'Shared ID for Household 2',
        kind: 'pack',
        items: [{ name: 'Bread', aisleKey: 'bakery', baseQty: 1 }],
      },
    ] as QuickTemplate[];
    const repository = createInMemoryQuickTemplateRepository(templates);
    const service = createQuickWinsService(repository);
    const workspace = createQuickWinsFixtureWorkspace();

    const preview = service.previewQuickWins({
      actorHouseholdId: 'hh-1',
      householdId: 'hh-1',
      listId: 'list-1',
      templateId: 'tpl-shared',
      multiplier: 1,
      existingItems: workspace.baseItems,
    });

    expect(preview.status).toBe('ready');
    if (preview.status !== 'ready') {
      return;
    }

    expect(preview.projection.some((item) => item.name.toLowerCase() === 'oats')).toBe(true);
    expect(preview.projection.some((item) => item.name.toLowerCase() === 'bread')).toBe(false);
  });
});
