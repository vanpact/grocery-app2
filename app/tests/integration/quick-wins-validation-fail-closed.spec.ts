import { describe, expect, it } from 'vitest';
import { clearOptionalModuleRegistry } from '../../src/features/optionalModuleGuards';
import { createQuickWinsService } from '../../src/items/quickWinsService';
import { createQuickWinsFixtureWorkspace, loadQuickWinsProjectionScenariosFixture } from '../helpers/quickWins';

describe('quick-wins cancel and validation fail-closed', () => {
  it('cancels without mutating list state', () => {
    clearOptionalModuleRegistry();
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
      confirm: false,
    });

    expect(outcome.status).toBe('cancelled');
    expect(outcome.items).toEqual(workspace.baseItems);
  });

  it('rejects invalid multiplier and disabled module with no mutation', () => {
    clearOptionalModuleRegistry();
    const workspace = createQuickWinsFixtureWorkspace();
    const scenarios = loadQuickWinsProjectionScenariosFixture();
    const service = createQuickWinsService(workspace.repository);

    const invalidMultiplier = service.executeQuickWins({
      actorHouseholdId: scenarios.invalidMultiplier.householdId,
      householdId: scenarios.invalidMultiplier.householdId,
      listId: scenarios.invalidMultiplier.listId,
      templateId: scenarios.invalidMultiplier.templateId,
      multiplier: scenarios.invalidMultiplier.multiplier,
      existingItems: workspace.baseItems,
      confirm: true,
    });

    expect(invalidMultiplier.status).toBe('rejected');
    expect(invalidMultiplier.rejectionReason).toBe('invalid_multiplier_not_integer');
    expect(invalidMultiplier.items).toEqual(workspace.baseItems);

    const moduleDisabled = service.executeQuickWins({
      actorHouseholdId: scenarios.valid.householdId,
      householdId: scenarios.valid.householdId,
      listId: scenarios.valid.listId,
      templateId: scenarios.valid.templateId,
      multiplier: scenarios.valid.multiplier,
      existingItems: workspace.baseItems,
      confirm: true,
    });

    expect(moduleDisabled.status).toBe('rejected');
    expect(moduleDisabled.rejectionReason).toBe('quick_wins_module_disabled');
    expect(moduleDisabled.items).toEqual(workspace.baseItems);
  });
});
