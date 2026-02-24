# Data Model: UI Usability Alignment

## Entity: CommittedScreenSurface

- **Primary Key**: `screenId`
- **Fields**:
  - `screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings'`
  - `primaryActions: string[]`
  - `navigationEntryPoints: string[]`
  - `md3MappingStatus: 'pass' | 'fail'`
- **Validation Rules**:
  - All four committed `screenId` values are required.
  - `primaryActions` must include explicit action-label copy for each committed flow.

## Entity: StateFeedbackScenario

- **Primary Key**: `screenId + state`
- **Fields**:
  - `screenId: string`
  - `state: 'empty' | 'loading' | 'error' | 'offline' | 'membership-required'`
  - `messageVisible: boolean`
  - `actionsVisible: string[]`
  - `silentFailureDetected: boolean`
- **Validation Rules**:
  - `messageVisible` must be `true` for each required state.
  - `silentFailureDetected` must be `false`.
  - `actionsVisible` must satisfy recovery-action contract for `error`, `offline`, and `membership-required`.

## Entity: RecoveryActionContract

- **Primary Key**: `state`
- **Fields**:
  - `state: 'error' | 'offline' | 'membership-required'`
  - `requiredActions: string[]`
- **Validation Rules**:
  - `error` includes `retry`.
  - `offline` includes `continue` and `retry_connection`.
  - `membership-required` includes `retry_membership` and `sign_out`.

## Entity: ResponsiveViewportCoverage

- **Primary Key**: `screenId + viewportBand`
- **Fields**:
  - `screenId: string`
  - `viewportBand: '<600' | '600-839' | '840-1199' | '>=1200'`
  - `layoutMode: 'mobile' | 'tablet' | 'desktop-two-pane'`
  - `primaryTaskReachable: boolean`
  - `secondaryPaneConstraintStatus: 'pass' | 'fail' | 'n/a'`
- **Validation Rules**:
  - `primaryTaskReachable` must be `true` for every viewport band and committed screen.
  - At `>=1200`, `secondaryPaneConstraintStatus` must be `pass`.

## Entity: WebInputParityRun

- **Primary Key**: `releaseId + scenarioId + runId`
- **Fields**:
  - `releaseId: string`
  - `scenarioId: string`
  - `runId: string`
  - `inputMode: 'keyboard' | 'pointer'`
  - `outcomeHash: string`
  - `status: 'pass' | 'fail'`
- **Validation Rules**:
  - For each scenario, keyboard and pointer runs must both exist.
  - `status = pass` only when paired `outcomeHash` values are equivalent.

## Entity: UsabilityTaskRun

- **Primary Key**: `releaseId + runId`
- **Fields**:
  - `releaseId: string`
  - `runId: string`
  - `platform: 'android' | 'web'`
  - `flow: 'core-add-validate'`
  - `durationSeconds: number`
  - `completed: boolean`
  - `deterministic: boolean`
- **Validation Rules**:
  - `durationSeconds` must be non-negative.
  - Runs used for SC-006/SC-007 must have `completed = true` and `deterministic = true`.

## Entity: UsabilityEvidenceSummary

- **Primary Key**: `releaseId`
- **Fields**:
  - `releaseId: string`
  - `totalRuns: number`
  - `runsWithin90Seconds: number`
  - `completionRatePct: number`
  - `sc006Status: 'pass' | 'fail'`
  - `sc007Status: 'pass' | 'fail'`
  - `finalStatus: 'ready' | 'not_ready'`
- **Validation Rules**:
  - `completionRatePct = (runsWithin90Seconds / totalRuns) * 100`.
  - `sc006Status = pass` only when `completionRatePct >= 90`.
  - `sc007Status = pass` only when run inputs are deterministic and include Android + Web.
  - `finalStatus = ready` only when `sc006Status = pass` and `sc007Status = pass`.

## State Transitions

### StateFeedbackScenario

- `not_rendered -> rendered`
- `rendered -> actionable`
- `actionable -> recovered` (after valid recovery action)

### WebInputParityRun

- `pending -> pass`
- `pending -> fail`
- `fail -> pass` (after parity fix and rerun)

### UsabilityEvidenceSummary

- `pending -> ready`
- `pending -> not_ready`
- `not_ready -> ready` (after remediated rerun)
