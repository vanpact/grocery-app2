# Data Model: Runnable End-to-End Online Firebase Baseline

## Entity: FirebaseTargetProfile

- **Primary Key**: `targetAlias`
- **Fields**:
  - `targetAlias: string`
  - `firebaseProjectId: string`
  - `environment: 'nonprod' | 'prod'`
  - `isDefault: boolean`
  - `allowDestructiveReset: boolean`
  - `requiresNonDefaultConfirmation: boolean`
- **Validation Rules**:
  - Exactly one profile must have `isDefault = true`.
  - Default profile must use `environment = 'nonprod'`.
  - `prod` targets require explicit non-default confirmation.
- **Relationships**:
  - Referenced by `SetupExecution`, `HealthCheckReport`, and `VerificationRun`.

## Entity: SetupExecution

- **Primary Key**: `setupRunId`
- **Fields**:
  - `setupRunId: string`
  - `targetAlias: string`
  - `mode: 'upsert' | 'reset'`
  - `provisionAccounts: boolean`
  - `startedAt: timestamp`
  - `completedAt: timestamp | null`
  - `status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'`
  - `confirmationFlags: string[]`
  - `structuresPrepared: string[]`
  - `fixtureUpserts: number`
  - `fixtureDeletes: number`
  - `accountsValidated: number`
  - `accountsCreated: number`
- **Validation Rules**:
  - Default mode is `upsert`.
  - `mode = 'reset'` is invalid without explicit reset confirmation.
  - Non-default target is invalid without explicit non-default confirmation.
  - `accountsCreated > 0` requires `provisionAccounts = true`.
- **Relationships**:
  - Many-to-one with `FirebaseTargetProfile`.

## Entity: VerificationAccount

- **Primary Key**: `accountKey`
- **Fields**:
  - `accountKey: string`
  - `email: string`
  - `requiredRole: 'suggest' | 'validate'`
  - `requiredHouseholdId: string`
  - `mustExist: boolean`
  - `status: 'present' | 'missing' | 'created' | 'invalid'`
- **Validation Rules**:
  - Accounts marked `mustExist = true` must be present before verification can start.
  - Account creation is permitted only when account-provision mode is explicitly enabled.
- **Relationships**:
  - Validated by `SetupExecution` and `HealthCheckReport`.

## Entity: RuntimeSession

- **Primary Key**: `sessionId`
- **Fields**:
  - `sessionId: string`
  - `userId: string`
  - `householdId: string`
  - `role: 'suggest' | 'validate'`
  - `connectivity: 'online' | 'offline' | 'reconnecting'`
  - `healthCheckStatus: 'pass' | 'fail'`
  - `startedAt: timestamp`
- **Validation Rules**:
  - Household membership is required before household-scoped operations.
  - `healthCheckStatus = 'pass'` is required for startup success.
- **Relationships**:
  - One-to-many with `QueuedAction`.

## Entity: QueuedAction

- **Primary Key**: `mutationId`
- **Fields**:
  - `mutationId: string`
  - `sessionId: string`
  - `householdId: string`
  - `sequence: number`
  - `type: 'add' | 'merge' | 'validate' | 'toggle' | 'undo' | 'error_retry'`
  - `status: 'pending' | 'applied' | 'failed' | 'requeued'`
  - `createdAt: timestamp`
  - `updatedAt: timestamp`
- **Validation Rules**:
  - Reconnect replay order is FIFO by `sequence`.
  - Duplicate `mutationId` entries must not create duplicate net effects.
- **Relationships**:
  - Many-to-one with `RuntimeSession`.

## Entity: HealthCheckReport

- **Primary Key**: `healthCheckId`
- **Fields**:
  - `healthCheckId: string`
  - `targetAlias: string`
  - `startedAt: timestamp`
  - `durationMs: number`
  - `firebaseConfigValid: boolean`
  - `firestoreReachable: boolean`
  - `requiredAccountsReady: boolean`
  - `defaultTargetSafetyPass: boolean`
  - `result: 'pass' | 'fail'`
  - `failures: string[]`
- **Validation Rules**:
  - Startup must fail closed if any required check is false.
  - `durationMs` must remain below quick-check budget for success criteria tracking.
- **Relationships**:
  - Many-to-one with `FirebaseTargetProfile`.

## Entity: VerificationRun

- **Primary Key**: `verificationRunId`
- **Fields**:
  - `verificationRunId: string`
  - `targetAlias: string`
  - `startedAt: timestamp`
  - `completedAt: timestamp | null`
  - `status: 'queued' | 'running' | 'passed' | 'failed' | 'interrupted'`
  - `rulesExecuted: string[]`
  - `rulesPassed: string[]`
  - `rulesFailed: string[]`
  - `evidenceBundlePath: string`
- **Validation Rules**:
  - Full verification executes only by explicit operator command.
  - `status = 'passed'` requires zero failed rules.
  - Interrupted runs must be marked `interrupted` and excluded from pass claims.
- **Relationships**:
  - One-to-one with `EvidenceBundle`.
  - Many-to-one with `FirebaseTargetProfile`.

## Entity: EvidenceBundle

- **Primary Key**: `bundleId`
- **Fields**:
  - `bundleId: string`
  - `releaseId: string`
  - `gateId: string`
  - `path: string`
  - `manifestPresent: boolean`
  - `verificationResultsPresent: boolean`
  - `rawDataPresent: boolean`
  - `decisionPresent: boolean`
  - `approvalsPresent: boolean`
  - `generatedAt: timestamp`
- **Validation Rules**:
  - Path must match `evidence/<release>/<gate_id>/<bundle_id>/`.
  - All mandatory files must exist for a complete bundle.
- **Relationships**:
  - One-to-one with `VerificationRun`.
  - References `GateDecision` via `gateId`.

## Entity: GateDecision

- **Primary Key**: `gateId_bundleId`
- **Fields**:
  - `gateId: string`
  - `bundleId: string`
  - `decision: 'retain' | 'cut' | 'not_applicable'`
  - `ownersRequired: string[]`
  - `ownersApproved: string[]`
  - `decidedAt: timestamp | null`
  - `rationale: string | null`
- **Validation Rules**:
  - All required owners must be present before `decision` is valid.
  - Optional gate failures must not block committed release readiness.
- **Relationships**:
  - Many-to-one with `EvidenceBundle`.

## State Transitions

### SetupExecution Status

- `pending -> running -> completed`
- `pending -> running -> failed`
- `pending -> running -> cancelled`
- Reset path is allowed only when explicit reset confirmation is present.

### RuntimeSession Connectivity

- `online -> offline -> reconnecting -> online`
- Offline transitions enqueue mutations; reconnecting transitions replay queue in sequence.

### QueuedAction Status

- `pending -> applied`
- `pending -> failed -> requeued -> applied`
- Duplicate replay attempts keep prior applied net effect and do not create second net mutation.

### VerificationRun Status

- `queued -> running -> passed`
- `queued -> running -> failed`
- `queued -> running -> interrupted`
