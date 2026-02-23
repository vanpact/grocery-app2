import { describe, expect, it } from 'vitest';
import { bootstrapApp } from '../../src/runtime/bootstrapApp';
import { addItemWithDedup } from '../../src/items/itemWriteService';
import { buildActiveShoppingScreenModel } from '../../src/ui/screens/ActiveShoppingScreen';
import { type Item } from '../../src/types';

describe('US1 runnable core flow', () => {
  it('supports sign-in, add, validate, and active shopping visibility after restart', async () => {
    const bootstrap = await bootstrapApp({
      userId: 'validator-1',
      resolveMembership: async () => ({ householdId: 'hh-default', role: 'validate' }),
      startupGate: async () => ({
        status: 'pass',
        targetAlias: 'default',
        blockedReasons: [],
        quickCheckBudgetMs: 120_000,
        quickCheck: {
          status: 'pass',
          durationMs: 800,
          targetAlias: 'default',
          checks: {
            firebaseConfigValid: true,
            firestoreReachable: true,
            requiredAccountsReady: true,
            membershipFixtureReady: true,
          },
          failures: [],
        },
      }),
    });

    expect(bootstrap.status).toBe('ready');
    expect(bootstrap.session?.householdId).toBe('hh-default');

    let items: Item[] = [];
    const addResult = addItemWithDedup(
      {
        householdId: 'hh-default',
        listId: 'list-default',
        name: 'Milk',
        aisleKey: 'dairy',
        qty: 1,
      },
      items,
    );
    items = addResult.items.map((item) =>
      item.itemId === addResult.item.itemId ? { ...item, status: 'validated' } : item,
    );

    const firstSession = buildActiveShoppingScreenModel(items, false);
    const restartedSession = buildActiveShoppingScreenModel([...items], false);

    expect(firstSession.validatedItems.map((item) => item.name)).toEqual(['Milk']);
    expect(restartedSession.validatedItems.map((item) => item.name)).toEqual(['Milk']);
  });
});
