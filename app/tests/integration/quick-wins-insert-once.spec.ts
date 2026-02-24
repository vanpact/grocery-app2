import { describe, expect, it } from 'vitest';
import { clearOptionalModuleRegistry, registerOptionalModule, QUICK_WINS_MODULE_ID } from '../../src/features/optionalModuleGuards';
import { createQuickWinsService } from '../../src/items/quickWinsService';
import { createQuickWinsFixtureWorkspace, loadQuickWinsProjectionScenariosFixture } from '../helpers/quickWins';

describe('quick-wins insert once behavior', () => {
  it('inserts non-overlap projected items exactly once', () => {
    clearOptionalModuleRegistry();
    registerOptionalModule(QUICK_WINS_MODULE_ID, {
      enabled: true,
      gateDecision: 'pass',
      owners: ['Engineering Lead', 'Product Owner'],
      approvals: ['Engineering Lead', 'Product Owner'],
    });

    const workspace = createQuickWinsFixtureWorkspace();
    const scenarios = loadQuickWinsProjectionScenariosFixture();
    const service = createQuickWinsService(workspace.repository);

    const outcome = service.executeQuickWins({
      actorHouseholdId: scenarios.cancel.householdId,
      householdId: scenarios.cancel.householdId,
      listId: scenarios.cancel.listId,
      templateId: scenarios.cancel.templateId,
      multiplier: scenarios.cancel.multiplier,
      existingItems: workspace.baseItems,
      confirm: true,
    });

    expect(outcome.status).toBe('applied');
    expect(outcome.mergedItemIds).toEqual([]);
    expect(outcome.insertedItemIds).toHaveLength(2);
    expect(outcome.items.filter((item) => item.nameSlug === 'rice')).toHaveLength(1);
    expect(outcome.items.filter((item) => item.nameSlug === 'chicken')).toHaveLength(1);
  });
});
