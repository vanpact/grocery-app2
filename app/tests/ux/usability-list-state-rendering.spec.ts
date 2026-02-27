import { describe, expect, it } from 'vitest';
import { buildActiveShoppingScreenModel } from '../../src/ui/screens/ActiveShoppingScreen';
import { type Item } from '../../src/types';

const BASE_ITEM: Omit<Item, 'itemId' | 'name' | 'status' | 'qty' | 'version'> = {
  householdId: 'hh-default',
  listId: 'list-alpha',
  nameSlug: 'item',
  aisleKey: null,
  unit: null,
};

function createItem(id: number, status: Item['status'], qty = 1): Item {
  return {
    itemId: `item-${id}`,
    name: `Item ${id}`,
    status,
    qty,
    version: 1,
    ...BASE_ITEM,
  };
}

describe('usability list-state rendering', () => {
  it('renders explicit empty, long-list, and partially-synced readability states', () => {
    const emptyModel = buildActiveShoppingScreenModel([], false);
    expect(emptyModel.listPresentationState).toBe('empty');
    expect(emptyModel.listStateMessage).toContain('No items yet');

    const longListItems = Array.from({ length: 16 }, (_, index) => createItem(index + 1, 'draft'));
    const longListModel = buildActiveShoppingScreenModel(longListItems, false);
    expect(longListModel.listPresentationState).toBe('long-list');
    expect(longListModel.listRows.length).toBe(16);
    expect(longListModel.listStateMessage).toContain('Long list mode');

    const partiallySyncedModel = buildActiveShoppingScreenModel([createItem(1, 'draft'), createItem(2, 'validated')], false);
    expect(partiallySyncedModel.listPresentationState).toBe('partially-synced');
    expect(partiallySyncedModel.listStateMessage).toContain('Partially synced');
  });
});
