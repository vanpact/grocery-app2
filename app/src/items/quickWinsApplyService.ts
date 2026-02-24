import { type EventLogger } from '../events/eventLogger';
import { addItemWithDedup } from './itemWriteService';
import { type Item, type QuickWinsProjectionItem } from '../types';

export type ApplyQuickWinsProjectionInput = {
  householdId: string;
  listId: string;
  projection: QuickWinsProjectionItem[];
  existingItems: Item[];
  logger?: EventLogger;
};

export type ApplyQuickWinsProjectionResult = {
  items: Item[];
  insertedItemIds: string[];
  mergedItemIds: string[];
};

export function applyQuickWinsProjection(input: ApplyQuickWinsProjectionInput): ApplyQuickWinsProjectionResult {
  const orderedProjection = [...input.projection].sort((left, right) => left.dedupKey.localeCompare(right.dedupKey));
  const insertedItemIds: string[] = [];
  const mergedItemIds: string[] = [];
  let currentItems = [...input.existingItems];

  for (const projected of orderedProjection) {
    const result = addItemWithDedup(
      {
        householdId: input.householdId,
        listId: input.listId,
        name: projected.name,
        aisleKey: projected.aisleKey,
        qty: projected.projectedQty,
      },
      currentItems,
      input.logger,
    );

    if (result.action === 'add') {
      insertedItemIds.push(result.item.itemId);
    } else {
      mergedItemIds.push(result.item.itemId);
    }

    currentItems = result.items;
  }

  return {
    items: currentItems,
    insertedItemIds: insertedItemIds.sort(),
    mergedItemIds: mergedItemIds.sort(),
  };
}
