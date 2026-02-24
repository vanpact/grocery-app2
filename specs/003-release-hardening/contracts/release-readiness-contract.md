# Release Readiness Contract

## 1. Command Surface

```ts
export type ReleaseReadinessCommand =
  'npm run verify:release-readiness -- -- --release <release_id> --scope committed';
```

Contract rules:
- Default scope is `committed`.
- Local/manual invocation is advisory preview only.
- Authoritative decision is produced by CI execution of the same contract.

## 2. Evaluation Input Contract

```ts
export type ReleaseReadinessInput = {
  releaseId: string;
  scope: 'committed' | 'committed_plus_optional';
  verificationOutcomesPath: string;
  evidenceRootPath: string;
  fieldTestCoveragePath: string;
};
```

Mandatory behavior:
- Inputs must reference pre-generated verification and evidence artifacts.
- Input release IDs must match candidate `releaseId`.
- Missing or malformed required input files must fail closed.
- Unresolved canonical-source references for committed verification IDs, gate owners, or field-test scenarios must fail closed.

## 3. Output Report Contract

```ts
export type ReleaseReadinessOutput = {
  status: 'ready' | 'not_ready';
  releaseId: string;
  source: 'ci_authoritative' | 'local_preview';
  scope: 'committed' | 'committed_plus_optional';
  failingVerificationIds: string[];
  missingArtifacts: string[];
  approvalIssues: string[];
  fieldTestCoverageIssues: string[];
  followUpActions: string[];
};
```

Mandatory behavior:
- Output ordering must be deterministic for same input data.
- `ready` requires zero issues across all issue arrays.
- `not_ready` requires at least one actionable follow-up item.

## 4. Evidence and Approval Validation Rules

- Mandatory artifact presence:
  - `manifest.json`
  - `verification-results.md`
  - `raw-data/`
  - `decision.json`
  - `approvals.json`
- `manifest.json`, `decision.json`, and `approvals.json` must be valid and parseable.
- Required owners from gate definitions must all appear in approvals.
- Approval timestamp freshness must be <=24 hours at evaluation time.

## 5. Failure Semantics

- Any committed verification fail/missing/invalid outcome -> `not_ready`.
- Any committed verification duplicate ID outcome -> `not_ready`.
- Any required artifact missing or invalid -> `not_ready`.
- Any approval issue (missing owner or stale approval) -> `not_ready`.
- Any committed field-test coverage fail/missing -> `not_ready`.

## 6. Scope Semantics

- `committed` scope is the default and release-blocking basis.
- Optional scope checks may be included only when explicitly requested.
- Optional scope failures must not change committed readiness unless scope includes optional gates.
