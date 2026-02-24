import { describe, expect, it } from 'vitest';
import { clearOptionalModuleRegistry, registerOptionalModule, QUICK_WINS_MODULE_ID } from '../../src/features/optionalModuleGuards';
import { createQuickWinsService } from '../../src/items/quickWinsService';
import { createQuickWinsFixtureWorkspace, loadQuickWinsProjectionScenariosFixture } from '../helpers/quickWins';

describe('quick-wins bulk-add runtime contract', () => {
  it('returns deterministic projection and applied outcome shape', () => {
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

    const preview = service.previewQuickWins({
      actorHouseholdId: scenarios.valid.householdId,
      householdId: scenarios.valid.householdId,
      listId: scenarios.valid.listId,
      templateId: scenarios.valid.templateId,
      multiplier: scenarios.valid.multiplier,
      existingItems: workspace.baseItems,
    });

    expect(preview.status).toBe('ready');
    if (preview.status !== 'ready') {
      return;
    }

    expect(preview.projection.length).toBeGreaterThan(0);
    expect(preview.projection[0]).toEqual(
      expect.objectContaining({
        dedupKey: expect.any(String),
        name: expect.any(String),
        aisleKey: expect.anything(),
        projectedQty: expect.any(Number),
        resolution: expect.stringMatching(/insert|merge/),
      }),
    );

    const outcome = service.executeQuickWins({
      actorHouseholdId: scenarios.valid.householdId,
      householdId: scenarios.valid.householdId,
      listId: scenarios.valid.listId,
      templateId: scenarios.valid.templateId,
      multiplier: scenarios.valid.multiplier,
      existingItems: workspace.baseItems,
      confirm: true,
    });

    expect(outcome).toEqual(
      expect.objectContaining({
        status: 'applied',
        insertedItemIds: expect.any(Array),
        mergedItemIds: expect.any(Array),
        projection: expect.any(Array),
        items: expect.any(Array),
      }),
    );
  });
});
