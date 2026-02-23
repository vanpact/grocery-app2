# Quickstart: Baseline Release Hardening

## 1. Prerequisites

1. Branch `003-release-hardening` is checked out.
2. Committed verification outputs are already generated for the candidate release.
3. Candidate evidence bundles exist under canonical path:
   - `evidence/<release>/<gate_id>/<bundle_id>/`
4. Required owner approvals are present and timestamped with `freshness_hours <= 24`.

## 2. Prepare Candidate Inputs

1. Select release identifier (example): `RC-2026-02-23`.
2. Confirm committed verification outcomes are available for all `VR-COM-*` IDs.
3. Confirm committed field-test scenario coverage records are available.

## 3. Run Local Advisory Preview

```bash
cd app
npm run verify:release-readiness -- -- --release RC-2026-02-23 --scope committed
```

Expected preview behavior:
- Produces `ready` or `not_ready` summary.
- Lists failing verification IDs, missing artifacts, stale/missing approvals, and missing field-test coverage.
- Marks result source as advisory preview.

## 4. Run Authoritative CI Gate

Trigger CI release-readiness workflow for the same `releaseId`.

Expected CI behavior:
- Uses the same committed-scope evaluation contract.
- Emits authoritative readiness decision.
- Blocks publication when decision is `not_ready`.
- Persists CI artifacts:
  - `.ci/release-readiness-report.json`
  - `.ci/release-decision.json`

## 5. Interpret Outcomes

### Ready

- All committed verification outcomes pass deterministically.
- Required evidence artifacts are complete and valid.
- Required owners are complete and fresh (<=24h).
- Committed field-test coverage is complete.

### Not Ready

- CI marks publication as blocked.
- Follow-up actions list required remediations.
- Re-run after remediation with same `releaseId` or updated candidate release.

## 6. Minimal Command Matrix

| Purpose | Command |
| --- | --- |
| Advisory local readiness preview | `npm run verify:release-readiness -- -- --release <id> --scope committed` |
| Authoritative readiness decision | CI workflow run for `<release_id>` |
| Authoritative publication decision derivation | `evaluateCiReleaseDecisionFromFile(<readiness_report_path>)` |
| Generate committed verification evidence (prerequisite) | `npm run verify:full -- -- --target default --release <id> --gate <gate_id> --bundle <bundle_id>` |
