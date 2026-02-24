# Sample UI Usability Evidence

## Artifact Set

This folder provides deterministic sample artifacts for UI usability evidence:

- `ui-usability-task-runs.json`
- `ui-usability-summary.json`

Source bundle:
- `evidence/RC-2026-02-24/gate-ui-usability/EV-UI-USABILITY/raw-data/`

## Summary Interpretation

From `ui-usability-summary.json`:

- `sc006 = pass` with `completionRatePct = 90` (`9/10` runs within `<=90s`)
- `sc007 = pass` with deterministic Android + Web coverage and keyboard + pointer web coverage
- `sc008 = ready`
- `reasonCodes = []`

Interpretation:
- Committed usability timing target is met at threshold.
- Deterministic platform/input coverage requirements are satisfied.
- Bundle-level usability criteria do not block release.

## Validation Notes (2026-02-24)

1. Focused UX command

```bash
cd app
npm run test -- tests/ux/us3-state-visibility.spec.ts tests/ux/us3-md3-component-mapping.spec.ts tests/ux/us3-responsive-layout.spec.ts tests/ux/us3-input-parity.spec.ts tests/ux/usability-action-language.spec.ts tests/ux/usability-task-threshold.spec.ts tests/ux/usability-recovery-actions.spec.ts tests/ux/usability-desktop-two-pane.spec.ts
```

Result:
- `8` test files passed
- `10` tests passed

2. Committed verification bundle

```bash
cd app
npm run verify:full -- -- --target default --release RC-2026-02-24 --gate gate-ui-usability --bundle EV-UI-USABILITY
```

Result:
- command passed
- bundle written to `evidence/RC-2026-02-24/gate-ui-usability/EV-UI-USABILITY`
- `verification-results.md` includes SC-006/SC-007/SC-008 summary section

3. Release readiness preview

```bash
cd app
npm run verify:release-readiness -- -- --release RC-2026-02-24 --scope committed
```

Result:
- returned `not_ready`
- blockers were release-level inputs/ownership source, not usability summary:
  - missing `verification-outcomes.json`
  - missing `field-test-coverage.json`
  - unresolved gate owner source for `gate-ui-usability`

## Remediation Notes

To move readiness from `not_ready` to `ready` for this release preview:

1. Provide `evidence/RC-2026-02-24/verification-outcomes.json`.
2. Provide `evidence/RC-2026-02-24/field-test-coverage.json`.
3. Add canonical gate ownership mapping for `gate-ui-usability` in roadmap gate ownership sources.
4. Re-run `npm run verify:release-readiness -- -- --release RC-2026-02-24 --scope committed`.
