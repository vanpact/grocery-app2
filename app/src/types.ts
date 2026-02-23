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
