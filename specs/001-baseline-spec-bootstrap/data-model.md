# Data Model: Grocery App Committed Baseline

## Entity: Household

- **Primary Key**: `householdId`
- **Fields**:
  - `name: string`
  - `createdBy: string`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`
- **Validation Rules**:
  - `name` must be non-empty.
- **Relationships**:
  - One-to-many with `Membership`, `Store`, `List`, and `Event`.

## Entity: Membership

- **Primary Key**: `householdId_userId`
- **Fields**:
  - `householdId: string`
  - `userId: string`
  - `role: 'suggest' | 'validate'`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`
- **Validation Rules**:
  - `role` must be one of committed roles only.
  - Membership household must match all scoped reads/writes.
- **Relationships**:
  - Many-to-one with `Household`.

## Entity: Store

- **Primary Key**: `storeId`
- **Fields**:
  - `householdId: string`
  - `name: string`
  - `aisleOrder: string[]`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`
- **Validation Rules**:
  - `aisleOrder` items must be stable keys used by item aggregation.
- **Relationships**:
  - Many-to-one with `Household`.

## Entity: List

- **Primary Key**: `listId`
- **Fields**:
  - `householdId: string`
  - `type: 'menus' | 'recurrents' | 'occasionals' | 'custom'`
  - `name: string`
  - `recurrence: 'weekly' | 'monthly' | 'manual' | null`
  - `storeId: string | null`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`
- **Validation Rules**:
  - `type` must use canonical vocabulary.
- **Relationships**:
  - Many-to-one with `Household`.
  - One-to-many with `Item`.

## Entity: Item

- **Primary Key**: `itemId`
- **Fields**:
  - `householdId: string`
  - `name: string`
  - `nameSlug: string`
  - `qty: number | null`
  - `unit: string | null`
  - `tags: string[]`
  - `aisleKey: string | null`
  - `status: 'draft' | 'suggested' | 'validated' | 'bought'`
  - `suggestedBy: string | null`
  - `validatedBy: string | null`
  - `version: number`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`
- **Validation Rules**:
  - Dedup key is `nameSlug + '#' + aisleKey`.
  - `status` must be canonical lifecycle state.
  - Writes must maintain household scope.
- **Relationships**:
  - Many-to-one with `List`.

## Entity: Event

- **Primary Key**: `eventId`
- **Fields**:
  - `householdId: string`
  - `type: 'add' | 'merge' | 'validate' | 'toggle' | 'suggest_accept' | 'suggest_reject' | 'reminder' | 'undo' | 'error_retry'`
  - `ref: map | null`
  - `payload: map`
  - `at: timestamp`
- **Validation Rules**:
  - Committed flow requires coverage for `add`, `merge`, `validate`, `toggle`, `undo`, `error_retry`.
  - Events are append-only from client perspective.
- **Relationships**:
  - Many-to-one with `Household`.

## Lifecycle State Transitions (Committed)

- `draft -> suggested` allowed for `suggest` and `validate` with explicit confirmation.
- `suggested -> validated` allowed for `validate` only.
- `validated -> bought` allowed for `validate` only.
- `bought -> validated` allowed for `validate` only.
