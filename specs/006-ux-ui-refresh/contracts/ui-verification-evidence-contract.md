# UI Verification Evidence Contract

## 1. Verification Targets

```ts
export type UiRefreshVerificationTargets = {
  verificationIds: [
    'VR-COM-005-STATE-VISIBILITY',
    'VR-COM-008-M3E-COMPONENT-MAPPING',
    'VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE',
    'VR-COM-010-INPUT-PARITY-WEB'
  ];
  successCriteria: [
    'SC-001',
    'SC-002',
    'SC-003',
    'SC-004',
    'SC-005',
    'SC-006',
    'SC-007'
  ];
};
```

## 2. Tool Evidence Input Contract

```ts
export type UiEvidenceTool = 'playwright' | 'mobile-mcp';

export type UiEvidenceArtifact = {
  releaseId: string;
  screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings';
  platform: 'web' | 'android';
  tool: UiEvidenceTool;
  scenarioId: string;
  artifactPath: string;
  status: 'captured' | 'missing';
};
```

Rules:
- `playwright` artifacts must cover web scenarios.
- `mobile-mcp` artifacts must cover android scenarios.
- Every refreshed screen must have both web (`playwright`) and android (`mobile-mcp`) evidence.
- Any `missing` artifact fails UI evidence validation.

## 3. Accessibility Evidence Contract

```ts
export type AccessibilityEvidenceRun = {
  releaseId: string;
  screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings';
  platform: 'web' | 'android';
  focusVisibilityPass: boolean;
  keyboardTraversalPass: boolean | 'n/a';
  textScalingPass: boolean;
  touchTargetPass: boolean;
  finalStatus: 'pass' | 'fail';
};
```

Rules:
- Web runs must evaluate keyboard traversal (`true|false` only).
- Android runs may use `n/a` for keyboard traversal.
- `finalStatus = pass` only when all applicable checks pass.
- SC-007 passes only when all refreshed screens pass for both platforms.

## 4. Timing and Outcome Contract

```ts
export type UiRefreshTimingSummary = {
  releaseId: string;
  baselineMedianSeconds: number;
  refreshedMedianSeconds: number;
  improvementPct: number;
  sc002Status: 'pass' | 'fail';
};
```

Rules:
- `improvementPct` is computed from baseline vs refreshed median flow times.
- `sc002Status = pass` only when `improvementPct >= 25`.

## 5. Evidence Artifact Contract

Canonical path:
- `evidence/<release>/<gate>/<bundle>/`

Mandatory files:
- `manifest.json`
- `verification-results.md`
- `decision.json`
- `approvals.json`
- `raw-data/ui-refresh-task-runs.json`
- `raw-data/ui-refresh-playwright-artifacts.json`
- `raw-data/ui-refresh-mobile-mcp-artifacts.json`
- `raw-data/ui-refresh-before-after-index.json`
- `raw-data/ui-refresh-accessibility-summary.json`
- `raw-data/ui-refresh-timing-summary.json`
- `raw-data/ui-refresh-clarity-summary.json`
- `raw-data/ui-refresh-mistap-summary.json`
- `raw-data/ui-refresh-usability-summary.json`

## 6. Release Decision Semantics

- UI refresh readiness is `not_ready` if any required tool evidence artifact is missing.
- UI refresh readiness is `not_ready` if before/after evidence pairing is missing.
- UI refresh readiness is `not_ready` if any of `SC-001..SC-007` fails.
- Re-validation with updated evidence is required before status can move to `ready`.
