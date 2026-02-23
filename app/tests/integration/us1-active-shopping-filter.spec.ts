import { describe, expect, it } from 'vitest';

import { getActiveShoppingItems } from '../../src/shopping/activeShoppingService';

describe('US1 active shopping filter', () => {
  it('returns only validated items for VR-COM-004', () => {
    const items = [
      { itemId: '1', householdId: 'hh', listId: 'l', name: 'milk', nameSlug: 'milk', aisleKey: null, status: 'validated' as const, version: 1 },
      { itemId: '2', householdId: 'hh', listId: 'l', name: 'bread', nameSlug: 'bread', aisleKey: null, status: 'draft' as const, version: 1 },
      { itemId: '3', householdId: 'hh', listId: 'l', name: 'eggs', nameSlug: 'eggs', aisleKey: null, status: 'bought' as const, version: 1 },
    ];

    const active = getActiveShoppingItems(items);

    expect(active.map((item) => item.itemId)).toEqual(['1']);
  });
});
