import { describe, expect, it } from 'vitest';
import { emulatorAllowsHouseholdAccess, emulatorAllowsTransition } from './emulator.setup';
import { createQuickWinsService } from '../../src/items/quickWinsService';
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
});
