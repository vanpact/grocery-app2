import { describe, expect, it } from 'vitest';
import { clearOptionalModuleRegistry, registerOptionalModule, QUICK_WINS_MODULE_ID } from '../../src/features/optionalModuleGuards';
import { createQuickWinsService } from '../../src/items/quickWinsService';
import { createQuickWinsFixtureWorkspace, loadQuickWinsProjectionScenariosFixture } from '../helpers/quickWins';

describe('quick-wins dedup merge behavior', () => {
  it('reuses committed dedup semantics and avoids duplicate rows for overlaps', () => {
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

    const milkItems = outcome.items.filter((item) => item.nameSlug === 'milk');
    expect(outcome.status).toBe('applied');
    expect(milkItems).toHaveLength(1);
    expect(outcome.mergedItemIds).toEqual(['item-1']);
  });

  it('keeps preview matched item id aligned with apply merge target', () => {
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
    const existingItems = [
      {
        itemId: 'item-9',
        householdId: 'hh-1',
        listId: 'list-1',
        name: 'Milk',
        nameSlug: 'milk',
        aisleKey: 'dairy',
        status: 'draft' as const,
        qty: 1,
        version: 1,
      },
      {
        itemId: 'item-1',
        householdId: 'hh-1',
        listId: 'list-1',
        name: 'milk',
        nameSlug: 'milk',
        aisleKey: 'DAIRY',
        status: 'suggested' as const,
        qty: 4,
        version: 1,
      },
      ...workspace.baseItems.filter((item) => item.nameSlug !== 'milk'),
    ];

    const preview = service.previewQuickWins({
      actorHouseholdId: scenarios.valid.householdId,
      householdId: scenarios.valid.householdId,
      listId: scenarios.valid.listId,
      templateId: scenarios.valid.templateId,
      multiplier: scenarios.valid.multiplier,
      existingItems,
    });

    expect(preview.status).toBe('ready');
    if (preview.status !== 'ready') {
      return;
    }

    const milkProjection = preview.projection.find((item) => item.dedupKey === 'milk#dairy');
    expect(milkProjection?.matchedExistingItemId).toBe('item-9');

    const outcome = service.executeQuickWins({
      actorHouseholdId: scenarios.valid.householdId,
      householdId: scenarios.valid.householdId,
      listId: scenarios.valid.listId,
      templateId: scenarios.valid.templateId,
      multiplier: scenarios.valid.multiplier,
      existingItems,
      confirm: true,
    });

    expect(outcome.status).toBe('applied');
    expect(outcome.mergedItemIds).toContain('item-9');
    expect(outcome.mergedItemIds).not.toContain('item-1');
  });
});
