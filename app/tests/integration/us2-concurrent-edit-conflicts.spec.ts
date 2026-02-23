import { describe, expect, it } from 'vitest';

import { updateItemWithVersionCheck } from '../../src/items/itemWriteService';

describe('VR-COM-018 concurrent edit conflicts', () => {
  const existingItems = [
    {
      itemId: 'item-1',
      householdId: 'hh-1',
      listId: 'list-1',
      name: 'Milk',
      nameSlug: 'milk',
      aisleKey: 'dairy',
      status: 'validated' as const,
      qty: 1,
      version: 2,
    },
  ];

  it('returns version_conflict for stale writes', () => {
    const result = updateItemWithVersionCheck(
      {
        itemId: 'item-1',
        householdId: 'hh-1',
        listId: 'list-1',
        qty: 3,
        expectedVersion: 1,
      },
      existingItems,
    );

    expect(result).toEqual({
      ok: false,
      reason: 'version_conflict',
      retryHint: 'refresh_and_retry',
      currentVersion: 2,
    });
  });

  it('applies write and increments version when expected version matches', () => {
    const result = updateItemWithVersionCheck(
      {
        itemId: 'item-1',
        householdId: 'hh-1',
        listId: 'list-1',
        qty: 3,
        expectedVersion: 2,
      },
      existingItems,
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.item.version).toBe(3);
    expect(result.item.qty).toBe(3);
  });
});
