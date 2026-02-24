# Data Model: Baseline Release Hardening

## Entity: ReleaseCandidate

- **Primary Key**: `releaseId`
- **Fields**:
  - `releaseId: string`
  - `evaluatedAtUtc: string`
  - `scope: 'committed' | 'committed_plus_optional'`
  - `source: 'ci_authoritative' | 'local_preview'`
  - `finalStatus: 'ready' | 'not_ready'`
- **Validation Rules**:
  - `scope` defaults to `committed`.
  - `finalStatus` is authoritative only when `source = ci_authoritative`.

## Entity: CommittedVerificationOutcome

- **Primary Key**: `releaseId + verificationId`
- **Fields**:
  - `releaseId: string`
  - `verificationId: string`
  - `status: 'pass' | 'fail' | 'missing' | 'invalid' | 'duplicated'`
  - `evidenceRefs: string[]`
  - `deterministic: boolean`
- **Validation Rules**:
  - Every committed verification ID must be present exactly once.
  - Any `fail`, `missing`, `invalid`, `duplicated`, or `deterministic = false` forces `not_ready`.

## Entity: EvidenceBundleRecord

- **Primary Key**: `releaseId + gateId + bundleId`
- **Fields**:
  - `releaseId: string`
  - `gateId: string`
  - `bundleId: string`
  - `path: string`
  - `mandatoryFilesPresent: boolean`
  - `manifestValid: boolean`
  - `decisionValid: boolean`
  - `approvalsValid: boolean`
- **Validation Rules**:
  - Bundle path must follow canonical artifact path contract.
  - All mandatory files must exist.
  - Required JSON artifacts must parse and validate.
  - Bundle `releaseId` must match candidate `releaseId`.

## Entity: GateApprovalSnapshot

- **Primary Key**: `releaseId + gateId`
- **Fields**:
  - `releaseId: string`
  - `gateId: string`
  - `requiredOwners: string[]`
  - `approvedOwners: string[]`
  - `approvedAtUtc: string`
  - `freshnessHours: number`
  - `isFresh: boolean`
  - `isComplete: boolean`
- **Validation Rules**:
  - `isFresh = true` only when `freshnessHours <= 24`.
  - `isComplete = true` only when `approvedOwners` includes all `requiredOwners`.

## Entity: FieldTestCoverageRecord

- **Primary Key**: `releaseId + scenarioId`
- **Fields**:
  - `releaseId: string`
  - `scenarioId: string`
  - `status: 'pass' | 'fail' | 'missing'`
  - `evidenceRef: string | null`
- **Validation Rules**:
  - All committed field-test scenario IDs must be present.
  - Any `fail` or `missing` blocks readiness.

## Entity: ReleaseReadinessReport

- **Primary Key**: `releaseId + generatedAtUtc`
- **Fields**:
  - `releaseId: string`
  - `generatedAtUtc: string`
  - `source: 'ci_authoritative' | 'local_preview'`
  - `scope: 'committed' | 'committed_plus_optional'`
  - `finalStatus: 'ready' | 'not_ready'`
  - `failingVerificationIds: string[]`
  - `missingArtifacts: string[]`
  - `approvalIssues: string[]`
  - `fieldTestCoverageIssues: string[]`
  - `followUpActions: string[]`
- **Validation Rules**:
  - Lists use deterministic ordering for stable reruns.
  - `finalStatus = ready` requires all issue arrays to be empty.

## State Transitions

### ReleaseCandidate Final Status

- `pending -> ready`
- `pending -> not_ready`

### GateApprovalSnapshot Completeness/Freshness

- `incomplete -> complete`
- `stale -> fresh`
- `fresh -> stale` (time-based invalidation)

### FieldTestCoverageRecord Status

- `missing -> pass`
- `missing -> fail`
- `pass -> fail` (if evidence invalidates)

### ReleaseReadinessReport Lifecycle

- `generated (preview)` for local advisory runs
- `generated (authoritative)` for CI runs
- `authoritative not_ready` triggers publication block
