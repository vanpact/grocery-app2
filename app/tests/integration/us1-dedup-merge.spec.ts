import { describe, expect, it } from 'vitest';

import { addItemWithDedup } from '../../src/items/itemWriteService';
import { createEventLogger } from '../../src/events/eventLogger';

describe('US1 dedup merge-on-add', () => {
  it('merges equivalent dedup-key item into one row', () => {
    const logger = createEventLogger();

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
        version: 1,
      },
    ];

    const result = addItemWithDedup(
      {
        householdId: 'hh-1',
        listId: 'list-1',
        name: '  milk ',
        aisleKey: 'DAIRY',
        qty: 2,
      },
      existingItems,
      logger,
    );

    expect(result.action).toBe('merge');
    expect(result.items).toHaveLength(1);
    expect(result.item.qty).toBe(3);
    expect(result.item.version).toBe(2);
    expect(logger.all().map((entry) => entry.type)).toContain('merge');
  });

  it('adds item when dedup key does not exist', () => {
    const result = addItemWithDedup(
      {
        householdId: 'hh-1',
        listId: 'list-1',
        name: 'Eggs',
        aisleKey: 'protein',
        qty: 1,
      },
      [],
    );

    expect(result.action).toBe('add');
    expect(result.items).toHaveLength(1);
    expect(result.item.nameSlug).toBe('eggs');
  });
});
