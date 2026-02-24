# Data Model: Quick Wins Bulk Add Packs and Recipes

## Entity: QuickTemplate

- **Primary Key**: `templateId`
- **Fields**:
  - `templateId: string`
  - `householdId: string`
  - `name: string`
  - `kind: 'pack' | 'recipe'`
  - `items: QuickTemplateItem[]`
  - `createdBy: string`
  - `createdAtUtc: string`
  - `updatedAtUtc: string`
- **Validation Rules**:
  - `householdId` is required and ties template visibility to household scope.
  - `items` must contain at least one valid item record.

## Entity: QuickTemplateItem

- **Primary Key**: `templateId + lineNumber`
- **Fields**:
  - `name: string`
  - `aisleKey: string | null`
  - `baseQty: number`
- **Validation Rules**:
  - `name` must be non-empty after normalization.
  - `baseQty` must be `> 0`.

## Entity: BulkProjectionInput

- **Primary Key**: `householdId + listId + templateId + requestedAtUtc`
- **Fields**:
  - `householdId: string`
  - `listId: string`
  - `templateId: string`
  - `multiplier: number`
  - `requestedBy: string`
  - `requestedAtUtc: string`
- **Validation Rules**:
  - `multiplier` must be a positive integer.
  - `templateId` must resolve to a household-shared template in the same household.

## Entity: ProjectedItem

- **Primary Key**: `projectionId + dedupKey`
- **Fields**:
  - `name: string`
  - `aisleKey: string | null`
  - `dedupKey: string`
  - `projectedQty: number`
  - `matchedExistingItemId: string | null`
  - `resolution: 'insert' | 'merge'`
- **Validation Rules**:
  - `projectedQty = baseQty * multiplier`.
  - `resolution = merge` only when dedup match exists in target list context.

## Entity: BulkApplyOutcome

- **Primary Key**: `operationId`
- **Fields**:
  - `operationId: string`
  - `householdId: string`
  - `listId: string`
  - `templateId: string`
  - `multiplier: number`
  - `insertedItemIds: string[]`
  - `mergedItemIds: string[]`
  - `status: 'applied' | 'rejected' | 'cancelled'`
  - `rejectionReason: string | null`
  - `appliedAtUtc: string | null`
- **Validation Rules**:
  - `cancelled` and `rejected` outcomes must not mutate list items.
  - `applied` outcome must be deterministic for unchanged input set.

## Entity: QuickWinsTimingRun

- **Primary Key**: `releaseId + runId`
- **Fields**:
  - `releaseId: string`
  - `runId: string`
  - `mode: 'baseline' | 'quick'`
  - `scenarioId: string`
  - `durationMs: number`
  - `startedAtUtc: string`
  - `completedAtUtc: string`
  - `deterministic: boolean`
- **Validation Rules**:
  - `durationMs` must be `>= 0`.
  - `mode` counts in verification evidence must include at least `5 baseline` and `5 quick`.
  - Non-deterministic runs are invalid for gate evidence.

## Entity: QuickWinsTimingSummary

- **Primary Key**: `releaseId`
- **Fields**:
  - `releaseId: string`
  - `baselineMedianMs: number`
  - `quickMedianMs: number`
  - `improvementPct: number`
  - `runCountBaseline: number`
  - `runCountQuick: number`
  - `verificationId: 'VR-CND-101-BULK-ADD-TIME'`
  - `status: 'pass' | 'fail'`
- **Validation Rules**:
  - `improvementPct = ((baselineMedianMs - quickMedianMs) / baselineMedianMs) * 100`.
  - `status = pass` only when `improvementPct >= 25` and run counts satisfy minimums.

## State Transitions

### BulkApplyOutcome Lifecycle

- `pending -> applied`
- `pending -> cancelled`
- `pending -> rejected`

### QuickWins Gate Verification Status

- `not_evaluated -> pass`
- `not_evaluated -> fail`
- `fail -> pass` (after rerun with updated evidence)
