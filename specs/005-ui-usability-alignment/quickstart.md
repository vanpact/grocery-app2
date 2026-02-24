# Quickstart: UI Usability Alignment

## 1. Prerequisites

1. Branch `005-ui-usability-alignment` is checked out.
2. From `app/`, baseline checks pass: `npm test` and `npm run lint`.
3. Select release identifiers (example):
   - `RELEASE=RC-2026-02-24`
   - `GATE=gate-ui-usability`
   - `BUNDLE=EV-UI-USABILITY`
4. Deterministic fixtures exist under `app/tests/fixtures/usability/`.

## 2. Run Focused UI Usability Tests

```bash
cd app
npm run test -- tests/ux/us3-state-visibility.spec.ts tests/ux/us3-md3-component-mapping.spec.ts tests/ux/us3-responsive-layout.spec.ts tests/ux/us3-input-parity.spec.ts tests/ux/usability-action-language.spec.ts tests/ux/usability-task-threshold.spec.ts tests/ux/usability-recovery-actions.spec.ts tests/ux/usability-desktop-two-pane.spec.ts
```

Expected:
- explicit state messaging across all committed screens,
- MD3 mapping coverage for the four committed destinations,
- responsive coverage across `<600`, `600-839`, `840-1199`, `>=1200`,
- keyboard/pointer parity for add, validate, and offline-recovery flows,
- SC-006 threshold validation from deterministic fixtures.

## 3. Run Contract + Readiness Blocking Tests

```bash
cd app
npm run test -- tests/contract/ui-runtime-usability-contract.spec.ts tests/contract/ui-usability-evidence-contract.spec.ts tests/integration/usability-core-flow-navigation.spec.ts tests/integration/usability-startup-recovery.spec.ts tests/integration/usability-membership-recovery.spec.ts tests/integration/usability-readiness-blocking.spec.ts tests/security/usability-security-regression.spec.ts
```

Expected:
- runtime destination and recovery contracts pass,
- SC-006/SC-007/SC-008 evidence contract behavior is enforced,
- readiness returns `not_ready` when usability criteria fail.

## 4. Generate Evidence Bundle

```bash
cd app
npm run verify:full -- -- --target default --release RC-2026-02-24 --gate gate-ui-usability --bundle EV-UI-USABILITY
```

Expected output path:
- `evidence/RC-2026-02-24/gate-ui-usability/EV-UI-USABILITY/`

Mandatory files include:
- `manifest.json`
- `verification-results.md`
- `decision.json`
- `approvals.json`
- `raw-data/ui-usability-task-runs.json`
- `raw-data/ui-usability-summary.json`

## 5. Run Release Readiness Preview

```bash
cd app
npm run verify:release-readiness -- -- --release RC-2026-02-24 --scope committed
```

Expected semantics:
- readiness is `ready` only when committed verification, field coverage, approvals, and usability criteria pass,
- SC-006 or SC-007 failure propagates as release-blocking (`SC-008`).

Note:
- `verify:full` writes bundle artifacts.
- `verify:release-readiness` also requires release-level `verification-outcomes.json` and `field-test-coverage.json` under `evidence/<release>/`.

## 6. Command Matrix

| Purpose | Command |
| --- | --- |
| Focused usability UX suites | `npm run test -- tests/ux/us3-state-visibility.spec.ts tests/ux/us3-md3-component-mapping.spec.ts tests/ux/us3-responsive-layout.spec.ts tests/ux/us3-input-parity.spec.ts tests/ux/usability-action-language.spec.ts tests/ux/usability-task-threshold.spec.ts tests/ux/usability-recovery-actions.spec.ts tests/ux/usability-desktop-two-pane.spec.ts` |
| Runtime + evidence + readiness-blocking tests | `npm run test -- tests/contract/ui-runtime-usability-contract.spec.ts tests/contract/ui-usability-evidence-contract.spec.ts tests/integration/usability-core-flow-navigation.spec.ts tests/integration/usability-startup-recovery.spec.ts tests/integration/usability-membership-recovery.spec.ts tests/integration/usability-readiness-blocking.spec.ts tests/security/usability-security-regression.spec.ts` |
| Generate committed evidence bundle | `npm run verify:full -- -- --target <alias> --release <id> --gate <gate> --bundle <bundle>` |
| Readiness preview | `npm run verify:release-readiness -- -- --release <id> --scope committed` |
