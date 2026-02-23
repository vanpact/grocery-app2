import { buildDedupKey, normalizeName } from './dedupKey';
import { type EventLogger } from '../events/eventLogger';
import { type Item } from '../types';

export type AddItemInput = {
  householdId: string;
  listId: string;
  name: string;
  aisleKey: string | null;
  qty?: number;
};

export type AddItemResult = {
  action: 'add' | 'merge';
  item: Item;
  items: Item[];
};

export type VersionedUpdateInput = {
  itemId: string;
  householdId: string;
  listId: string;
  qty: number;
  expectedVersion: number;
};

export type VersionConflictResult = {
  ok: false;
  reason: 'version_conflict';
  retryHint: 'refresh_and_retry';
  currentVersion: number;
};

export type VersionedUpdateSuccess = {
  ok: true;
  item: Item;
  items: Item[];
};

export type VersionedUpdateResult = VersionConflictResult | VersionedUpdateSuccess;

export function addItemWithDedup(input: AddItemInput, existingItems: Item[], logger?: EventLogger): AddItemResult {
  const dedupKey = buildDedupKey(input.name, input.aisleKey);

  const matchIndex = existingItems.findIndex(
    (item) =>
      item.householdId === input.householdId &&
      item.listId === input.listId &&
      buildDedupKey(item.name, item.aisleKey) === dedupKey,
  );

  if (matchIndex >= 0) {
    const match = existingItems[matchIndex];
    const mergedQty = (match.qty ?? 0) + (input.qty ?? 0);
    const merged: Item = {
      ...match,
      qty: mergedQty,
      version: match.version + 1,
    };

    const mergedItems = [...existingItems];
    mergedItems[matchIndex] = merged;

    logger?.log({
      householdId: input.householdId,
      type: 'merge',
      ref: { itemId: match.itemId },
      payload: { dedupKey, qty: mergedQty },
      at: new Date().toISOString(),
    });

    return {
      action: 'merge',
      item: merged,
      items: mergedItems,
    };
  }

  const added: Item = {
    itemId: `item-${existingItems.length + 1}`,
    householdId: input.householdId,
    listId: input.listId,
    name: input.name.trim(),
    nameSlug: normalizeName(input.name),
    aisleKey: input.aisleKey,
    status: 'draft',
    qty: input.qty ?? null,
    version: 1,
  };

  logger?.log({
    householdId: input.householdId,
    type: 'add',
    ref: { itemId: added.itemId },
    payload: { dedupKey },
    at: new Date().toISOString(),
  });

  return {
    action: 'add',
    item: added,
    items: [...existingItems, added],
  };
}

export function updateItemWithVersionCheck(
  input: VersionedUpdateInput,
  existingItems: Item[],
  logger?: EventLogger,
): VersionedUpdateResult {
  const index = existingItems.findIndex(
    (item) =>
      item.itemId === input.itemId &&
      item.householdId === input.householdId &&
      item.listId === input.listId,
  );

  if (index < 0) {
    return {
      ok: false,
      reason: 'version_conflict',
      retryHint: 'refresh_and_retry',
      currentVersion: -1,
    };
  }

  const current = existingItems[index];
  if (current.version !== input.expectedVersion) {
    return {
      ok: false,
      reason: 'version_conflict',
      retryHint: 'refresh_and_retry',
      currentVersion: current.version,
    };
  }

  const updated: Item = {
    ...current,
    qty: input.qty,
    version: current.version + 1,
  };

  const updatedItems = [...existingItems];
  updatedItems[index] = updated;

  logger?.log({
    householdId: input.householdId,
    type: 'toggle',
    ref: { itemId: input.itemId },
    payload: { expectedVersion: input.expectedVersion, nextVersion: updated.version },
    at: new Date().toISOString(),
  });

  return {
    ok: true,
    item: updated,
    items: updatedItems,
  };
}
