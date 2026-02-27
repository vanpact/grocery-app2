# Evidence Artifacts

## Bundle Path Contract

Evidence bundles for release gates are stored under:

`evidence/<release>/<gate_id>/<bundle_id>/`

Runnable command path:

```bash
npm run verify:full -- <alias> <release_id> <gate_id> <bundle_id>
```

Startup wrappers and `verify:quick` do not generate full evidence bundles.

Release-readiness report command:

```bash
cd app
npm run verify:release-readiness -- <release_id> committed
```

Quick-wins timing verification command:

```bash
cd app
npm run verify:quick-wins -- -- --release <release_id> --gate G-QW-01 --bundle EV-QW-BULK-ADD
```

## Required Files Per Bundle

- `manifest.json`
- `verification-results.md`
- `raw-data/`
- `raw-data/ui-refresh-task-runs.json`
- `raw-data/ui-refresh-playwright-artifacts.json`
- `raw-data/ui-refresh-mobile-mcp-artifacts.json`
- `raw-data/ui-refresh-before-after-index.json`
- `raw-data/ui-refresh-accessibility-summary.json`
- `raw-data/ui-refresh-timing-summary.json`
- `raw-data/ui-refresh-clarity-summary.json`
- `raw-data/ui-refresh-mistap-summary.json`
- `raw-data/ui-refresh-usability-summary.json`
- `decision.json`
- `approvals.json`

## Release Evidence Checklist

- [ ] All committed verification refs (`VR-COM-001` through `VR-COM-010`) are listed in `manifest.json`
- [ ] Mandatory blocker `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` is marked pass
- [ ] Raw artifacts for each verification are attached under `raw-data/`
- [ ] UI refresh summary is attached with `SC-001..SC-007` status and readiness state
- [ ] `decision.json` captures pass/fail/cut with rationale
- [ ] `approvals.json` includes required owners and timestamps

## Artifact Index

- Schemas:
  - `evidence/schemas/manifest.schema.json`
  - `evidence/schemas/decision.schema.json`
  - `evidence/schemas/approvals.schema.json`
- Release readiness artifacts:
  - `.ci/release-readiness-report.json`
  - `.ci/release-decision.json`
  - `evidence/sample-release-readiness/README.md`
- Quick-wins gate artifacts:
  - `.ci/quick-wins-report.json`
  - `.ci/quick-wins-gate-decision.json`
  - `evidence/sample-quick-wins/README.md`
- UI usability artifacts:
  - `evidence/sample-ui-usability/ui-usability-task-runs.json`
  - `evidence/sample-ui-usability/ui-usability-summary.json`
  - `evidence/sample-ui-usability/README.md`
- UI refresh artifacts:
  - `evidence/sample-ui-refresh/ui-refresh-playwright-artifacts.json`
  - `evidence/sample-ui-refresh/ui-refresh-mobile-mcp-artifacts.json`
  - `evidence/sample-ui-refresh/ui-refresh-before-after-index.json`
  - `evidence/sample-ui-refresh/ui-refresh-accessibility-summary.json`
  - `evidence/sample-ui-refresh/ui-refresh-timing-summary.json`
  - `evidence/sample-ui-refresh/ui-refresh-clarity-summary.json`
  - `evidence/sample-ui-refresh/ui-refresh-mistap-summary.json`
  - `evidence/sample-ui-refresh/ui-refresh-usability-summary.json`
  - `evidence/sample-ui-refresh/README.md`
- Feature docs:
  - `specs/001-baseline-spec-bootstrap/quickstart.md`
  - `specs/001-baseline-spec-bootstrap/contracts/security-transition-contract.md`
  - `specs/001-baseline-spec-bootstrap/contracts/verification-and-gate-contract.md`
  - `specs/002-run-app-e2e/quickstart.md`
  - `specs/002-run-app-e2e/troubleshooting.md`
  - `specs/003-release-hardening/quickstart.md`
  - `specs/004-quick-wins-bulk-add/quickstart.md`
