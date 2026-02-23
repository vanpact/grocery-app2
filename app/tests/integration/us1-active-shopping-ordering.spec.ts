import { describe, expect, it } from 'vitest';

import { getActiveShoppingItems } from '../../src/shopping/activeShoppingService';

describe('VR-COM-013 active shopping ordering', () => {
  it('returns validated-only items ordered by aisleKey and nameSlug', () => {
    const items = [
      { itemId: '4', householdId: 'hh', listId: 'l', name: 'Zucchini', nameSlug: 'zucchini', aisleKey: 'produce', status: 'validated' as const, version: 1 },
      { itemId: '1', householdId: 'hh', listId: 'l', name: 'Milk', nameSlug: 'milk', aisleKey: 'dairy', status: 'validated' as const, version: 1 },
      { itemId: '2', householdId: 'hh', listId: 'l', name: 'Bread', nameSlug: 'bread', aisleKey: 'bakery', status: 'draft' as const, version: 1 },
      { itemId: '3', householdId: 'hh', listId: 'l', name: 'Yogurt', nameSlug: 'yogurt', aisleKey: 'dairy', status: 'validated' as const, version: 1 },
    ];

    const result = getActiveShoppingItems(items);

    expect(result.map((item) => item.itemId)).toEqual(['1', '3', '4']);
  });
});
