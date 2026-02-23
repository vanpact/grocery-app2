# Quickstart: Committed Baseline Verification Path

## 1. Validate Planning Inputs

1. Confirm branch is `001-baseline-spec-bootstrap`.
2. Confirm required artifacts exist:
   - `specs/001-baseline-spec-bootstrap/spec.md`
   - `specs/001-baseline-spec-bootstrap/plan.md`
   - `specs/001-baseline-spec-bootstrap/research.md`
   - `specs/001-baseline-spec-bootstrap/data-model.md`
   - `specs/001-baseline-spec-bootstrap/contracts/`

## 2. Install and Run Baseline Test Packs

1. Install app dependencies:
   ```bash
   cd app
   npm install
   ```
2. Run all suites:
   ```bash
   npm test
   ```
3. Run focused packs when collecting evidence:
   ```bash
   npx vitest run tests/integration
   npx vitest run tests/security
   npx vitest run tests/ux tests/contract
   ```

## 3. Implement Committed Baseline Stories

1. Implement committed story sequence `GS-001` to `GS-010`.
2. Keep optional stories (`GS-101+`) behind gate-controlled flags and fail-closed behavior.

## 4. Run Verification Before Release Decision

1. Run offline replay verification for `VR-COM-001-OFFLINE-REPLAY`.
2. Run dedup collision verification for `VR-COM-002-DEDUP-KEY-COLLISION`.
3. Run emulator allow/deny suite for `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.
4. Run Active Shopping, state visibility, navigation stability, MD3 mapping, responsive, and
   input parity verifications (`VR-COM-004` through `VR-COM-010`).
5. Run gap-closure verification set (`VR-COM-011` through `VR-COM-023`) for membership-failure handling,
   transition outcomes, replay ordering/recovery, query-surface isolation, optional gate ownership,
   concurrency conflicts, performance, accessibility, lifecycle navigation, degraded-mode dependency handling,
   and actor-scope enforcement.

## 5. Record Evidence

1. Store evidence bundles under `evidence/<release>/<gate_id>/<bundle_id>/`.
2. Include required files:
   - `manifest.json`
   - `verification-results.md`
   - `raw-data/`
   - `decision.json`
   - `approvals.json`

## 6. Release Readiness Rule

Committed release is ready only when all committed verification rules pass, including mandatory
`VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.
