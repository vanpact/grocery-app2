# Bulk Add Runtime Contract

## 1. Runtime Interface

```ts
export type BulkAddPreviewInput = {
  actorHouseholdId: string;
  householdId: string;
  listId: string;
  templateId: string;
  multiplier: unknown;
};

export type BulkAddPreviewResult =
  | {
      status: 'ready';
      projection: Array<{
        dedupKey: string;
        name: string;
        aisleKey: string | null;
        projectedQty: number;
        matchedExistingItemId: string | null;
        resolution: 'insert' | 'merge';
      }>;
    }
  | {
      status: 'rejected';
      reason: string;
      projection: Array<{
        dedupKey: string;
        name: string;
        aisleKey: string | null;
        projectedQty: number;
        matchedExistingItemId: string | null;
        resolution: 'insert' | 'merge';
      }>;
    };

export type BulkAddExecuteInput = BulkAddPreviewInput & {
  confirm: boolean;
};

export type BulkAddOutcome = {
  status: 'applied' | 'cancelled' | 'rejected';
  insertedItemIds: string[];
  mergedItemIds: string[];
  rejectionReason?: string;
  projection: Array<{
    dedupKey: string;
    name: string;
    aisleKey: string | null;
    projectedQty: number;
    matchedExistingItemId: string | null;
    resolution: 'insert' | 'merge';
  }>;
  items: Array<{
    itemId: string;
    householdId: string;
    listId: string;
    name: string;
    nameSlug: string;
    aisleKey: string | null;
    status: 'suggested' | 'draft' | 'validated';
    qty: number | null;
    version: number;
  }>;
};
```

## 2. Validation Rules

- `multiplier` must be a positive integer.
- Template must be household-scoped and resolvable in actor household context.
- Invalid input must fail closed with `status = rejected` and no list mutation.

## 3. Projection and Apply Rules

- Projection computes `projectedQty = baseQty * multiplier`.
- Projection must resolve dedup identity using committed `dedupKey` semantics.
- Apply path must reuse committed merge behavior for matching items and insert once for non-matching items.
- Cancel path must not mutate list state.

## 4. Determinism Rules

- For unchanged template, multiplier, and list snapshot, projection ordering and quantity outcomes must be identical across reruns.
- Merge vs insert classification must be stable for unchanged input snapshots.

## 5. Invariant Rules

- Committed role and security invariants remain unchanged.
- Household isolation remains enforced for reads/writes.
- Offline replay behavior must not create duplicate projection effects.
