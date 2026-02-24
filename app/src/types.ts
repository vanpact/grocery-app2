export type Role = 'suggest' | 'validate';

export type LifecycleState = 'draft' | 'suggested' | 'validated' | 'bought';

export type EventType =
  | 'add'
  | 'merge'
  | 'validate'
  | 'toggle'
  | 'suggest_accept'
  | 'suggest_reject'
  | 'reminder'
  | 'undo'
  | 'error_retry'
  | 'denied';

export type Item = {
  itemId: string;
  householdId: string;
  listId: string;
  name: string;
  nameSlug: string;
  aisleKey: string | null;
  status: LifecycleState;
  qty?: number | null;
  unit?: string | null;
  version: number;
};

export type EventRecord = {
  householdId: string;
  type: EventType;
  ref: Record<string, unknown> | null;
  payload: Record<string, unknown>;
  at: string;
};

export type Mutation = {
  mutationId: string;
  householdId: string;
  type: 'add' | 'merge' | 'validate' | 'toggle' | 'undo' | 'error_retry';
  payload: Record<string, unknown>;
};

export type QuickTemplateKind = 'pack' | 'recipe';

export type QuickTemplateItem = {
  name: string;
  aisleKey: string | null;
  baseQty: number;
};

export type QuickTemplate = {
  templateId: string;
  householdId: string;
  name: string;
  kind: QuickTemplateKind;
  items: QuickTemplateItem[];
};

export type QuickWinsProjectionItem = {
  dedupKey: string;
  name: string;
  aisleKey: string | null;
  projectedQty: number;
  matchedExistingItemId: string | null;
  resolution: 'insert' | 'merge';
};

export type QuickWinsOutcome = {
  status: 'applied' | 'cancelled' | 'rejected';
  insertedItemIds: string[];
  mergedItemIds: string[];
  rejectionReason?: string;
  items: Item[];
  projection: QuickWinsProjectionItem[];
};
