# UI Usability Evidence Contract

## 1. Verification Targets

```ts
export type UiCommittedVerificationTargets = {
  verificationIds: [
    'VR-COM-005-STATE-VISIBILITY',
    'VR-COM-008-M3E-COMPONENT-MAPPING',
    'VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE',
    'VR-COM-010-INPUT-PARITY-WEB'
  ];
  successCriteria: ['SC-006', 'SC-007', 'SC-008'];
};
```

## 2. Task-Run Evidence Input Contract

```ts
export type UiUsabilityTaskRun = {
  runId: string;
  platform: 'android' | 'web';
  inputMode: 'touch' | 'keyboard' | 'pointer';
  flow: 'core-add-validate';
  durationSeconds: number;
  completed: boolean;
  deterministic: boolean;
};

export type UiUsabilityEvidenceInput = {
  releaseId: string;
  taskRuns: UiUsabilityTaskRun[];
};
```

Rules:
- Every run must be deterministic and completed to count toward SC-006.
- Run set must include both Android and Web data.
- Web run set must include keyboard and pointer modes.

## 3. Evaluation Contract

```ts
export type UiUsabilityEvaluation = {
  releaseId: string;
  totalRuns: number;
  runsWithin90Seconds: number;
  completionRatePct: number;
  sc006Status: 'pass' | 'fail';
  sc007Status: 'pass' | 'fail';
  finalStatus: 'ready' | 'not_ready';
  reasonCodes: string[];
};
```

Rules:
- `completionRatePct = (runsWithin90Seconds / totalRuns) * 100`.
- `sc006Status = pass` only when `completionRatePct >= 90`.
- `sc007Status = pass` only when run set is deterministic and coverage includes Android + Web and keyboard + pointer web modes.
- `finalStatus = ready` only when `sc006Status = pass` and `sc007Status = pass`.
- `finalStatus = not_ready` when either SC-006 or SC-007 fails (SC-008 enforcement).

## 4. Evidence Artifact Contract

Canonical path:
- `evidence/<release>/<gate>/<bundle>/`

Mandatory files:
- `manifest.json`
- `verification-results.md`
- `decision.json`
- `approvals.json`
- `raw-data/ui-usability-task-runs.json`
- `raw-data/ui-usability-summary.json`

Additional requirement:
- `verification-results.md` must include:
  - results for `VR-COM-005/008/009/010`,
  - SC-006 completion-rate calculation,
  - SC-007 deterministic-coverage confirmation.

## 5. Release Decision Semantics

- SC-006/SC-007 failure is release-blocking for committed scope.
- Re-validation after remediation is required to move from `not_ready` to `ready`.
- Local evaluation may be advisory, but authoritative release decision must use committed gate workflow.
