# Quick Wins Gate Evidence Contract

## 1. Verification Target

```ts
export type QuickWinsVerificationTarget = {
  verificationId: 'VR-CND-101-BULK-ADD-TIME';
  gateId: 'G-QW-01';
  bundleId: 'EV-QW-BULK-ADD';
};
```

## 2. Evidence Input Contract

```ts
export type BulkAddTimingEvidenceInput = {
  releaseId: string;
  baselineRuns: Array<{ runId: string; durationMs: number }>;
  quickRuns: Array<{ runId: string; durationMs: number }>;
};
```

Rules:
- Must include at least `5` baseline runs and `5` quick runs.
- Every run duration must be numeric and non-negative.
- Run set must be produced from scripted scenarios with deterministic inputs.

## 3. Evaluation Contract

```ts
export type BulkAddTimingEvaluation = {
  baselineMedianMs: number;
  quickMedianMs: number;
  improvementPct: number;
  status: 'pass' | 'fail';
  reasonCodes: string[];
};
```

Rules:
- `improvementPct = ((baselineMedianMs - quickMedianMs) / baselineMedianMs) * 100`.
- `status = pass` only when `improvementPct >= 25`.
- Incomplete or malformed run sets must fail closed.

## 4. Evidence Artifact Contract

Canonical path:
- `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/`

Mandatory files:
- `manifest.json`
- `verification-results.md`
- `raw-data/`
- `decision.json`
- `approvals.json`

Additional requirement:
- `verification-results.md` must include run-count and median-improvement details for `VR-CND-101-BULK-ADD-TIME`.

## 5. Authority Model

- Local evaluation output is advisory preview only.
- CI-evaluated artifacts are authoritative for gate decision recording.
- If verification status is `fail`, gate fail action applies: quick-input features are cut for the release cycle.
