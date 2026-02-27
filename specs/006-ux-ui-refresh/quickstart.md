# Quickstart: Cross-Platform UX/UI Refresh

## 1. Prerequisites

1. Branch `006-ux-ui-refresh` is checked out.
2. From `app/`, dependencies are installed and baseline checks pass:
   - `npm test`
   - `npm run lint`
3. Select release identifiers (example):
   - `RELEASE=RC-2026-02-24`
   - `GATE=gate-ui-refresh`
   - `BUNDLE=EV-UI-REFRESH`

## 2. Run Focused UX Regression Suites

```bash
cd app
npm run test -- tests/ux/us3-state-visibility.spec.ts tests/ux/us3-responsive-layout.spec.ts tests/ux/us3-input-parity.spec.ts tests/ux/usability-action-language.spec.ts tests/ux/usability-desktop-two-pane.spec.ts tests/ux/usability-recovery-actions.spec.ts tests/ux/us3-accessibility-baseline.spec.ts
```

Expected:
- screen-state visibility remains explicit,
- responsive layout contract passes across all viewport bands,
- desktop two-pane behavior follows clarified constraints,
- accessibility baseline checks remain green.

## 3. Run Contract + Integration Validation

```bash
cd app
npm run test -- tests/contract/ui-runtime-usability-contract.spec.ts tests/contract/ui-usability-evidence-contract.spec.ts tests/integration/usability-core-flow-navigation.spec.ts tests/integration/usability-startup-recovery.spec.ts tests/integration/usability-membership-recovery.spec.ts tests/integration/usability-readiness-blocking.spec.ts tests/security/usability-security-regression.spec.ts
```

Expected:
- runtime contract checks pass for navigation/layout/action hierarchy,
- evidence contract checks pass for required data inputs,
- readiness remains fail-closed when committed criteria are not met.

## 4. Capture UI Evidence with Required Tools

Capture evidence for each refreshed screen (`sign-in`, `active-shopping`, `overview`,
`settings`) on both surfaces:

1. Web evidence via `playwright`:
   - run scenarios and capture deterministic web artifacts for each screen.
2. Android evidence via `mobile-mcp`:
   - run matching scenarios and capture deterministic mobile artifacts for each screen.

Store artifact indexes under:
- `raw-data/ui-refresh-playwright-artifacts.json`
- `raw-data/ui-refresh-mobile-mcp-artifacts.json`

## 5. Generate Accessibility and Timing Summaries

Produce deterministic summary files:
- `raw-data/ui-refresh-accessibility-summary.json`
- `raw-data/ui-refresh-timing-summary.json`

Requirements:
- accessibility summary must include focus visibility, keyboard traversal (web), readable
  scaling, and touch-target checks for all refreshed screens.
- timing summary must include baseline vs refreshed median flow times and computed
  improvement percentage for `SC-002`.

## 6. Build Evidence Bundle

```bash
cd app
npm run verify:full -- default RC-2026-02-24 gate-ui-refresh EV-UI-REFRESH
```

Expected output:
- `evidence/RC-2026-02-24/gate-ui-refresh/EV-UI-REFRESH/`

Mandatory artifacts:
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

## 7. Run Readiness Preview

```bash
cd app
npm run verify:release-readiness -- RC-2026-02-24 committed
```

Expected:
- status is `ready` only when committed verification and refreshed UX evidence requirements
  pass,
- status is `not_ready` when tool evidence is missing, before/after evidence pairing is missing,
  or any of `SC-001..SC-007` fails.

