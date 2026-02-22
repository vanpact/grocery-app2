# Quickstart: Committed Baseline Verification Path

## 1. Validate Planning Inputs

1. Confirm branch is `001-baseline-spec-bootstrap`.
2. Confirm required artifacts exist:
   - `specs/001-baseline-spec-bootstrap/spec.md`
   - `specs/001-baseline-spec-bootstrap/plan.md`
   - `specs/001-baseline-spec-bootstrap/research.md`
   - `specs/001-baseline-spec-bootstrap/data-model.md`
   - `specs/001-baseline-spec-bootstrap/contracts/`

## 2. Implement Committed Baseline Stories

1. Implement committed story sequence `GS-001` to `GS-010`.
2. Keep optional stories (`GS-101+`) behind gate-controlled flags and fail-closed behavior.

## 3. Run Verification Before Release Decision

1. Run offline replay verification for `VR-COM-001-OFFLINE-REPLAY`.
2. Run dedup collision verification for `VR-COM-002-DEDUP-KEY-COLLISION`.
3. Run emulator allow/deny suite for `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.
4. Run Active Shopping, state visibility, navigation stability, MD3 mapping, responsive, and
   input parity verifications (`VR-COM-004` through `VR-COM-010`).

## 4. Record Evidence

1. Store evidence bundles under `evidence/<release>/<gate_id>/<bundle_id>/`.
2. Include required files:
   - `manifest.json`
   - `verification-results.md`
   - `raw-data/`
   - `decision.json`
   - `approvals.json`

## 5. Release Readiness Rule

Committed release is ready only when all committed verification rules pass, including mandatory
`VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.
