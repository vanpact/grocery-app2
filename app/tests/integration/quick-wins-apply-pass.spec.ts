import { describe, expect, it } from 'vitest';
import { clearOptionalModuleRegistry, registerOptionalModule, QUICK_WINS_MODULE_ID } from '../../src/features/optionalModuleGuards';
import { createQuickWinsService } from '../../src/items/quickWinsService';
import { createQuickWinsFixtureWorkspace, loadQuickWinsProjectionScenariosFixture } from '../helpers/quickWins';

describe('quick-wins apply pass flow', () => {
  it('applies projection, merges overlaps, and inserts non-overlaps', () => {
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
      actorHouseholdId: scenarios.valid.householdId,
      householdId: scenarios.valid.householdId,
      listId: scenarios.valid.listId,
      templateId: scenarios.valid.templateId,
      multiplier: scenarios.valid.multiplier,
      existingItems: workspace.baseItems,
      confirm: true,
    });

    expect(outcome.status).toBe('applied');
    expect(outcome.insertedItemIds.length).toBe(1);
    expect(outcome.mergedItemIds.length).toBe(1);
    expect(outcome.items).toHaveLength(3);

    const milk = outcome.items.find((item) => item.nameSlug === 'milk');
    const eggs = outcome.items.find((item) => item.nameSlug === 'eggs');

    expect(milk?.qty).toBe(3);
    expect(eggs?.qty).toBe(6);
  });
});
