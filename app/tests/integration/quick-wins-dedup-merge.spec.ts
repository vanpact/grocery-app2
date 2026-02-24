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
});
