# Research: Runnable End-to-End Online Firebase Baseline

## Decision 1: Keep One Expo App and Add a Minimal Runtime Bootstrap Layer

- **Decision**: Keep the existing single Expo codebase and add a small `src/runtime` layer to run
  quick health checks before app launch flows.
- **Rationale**: The repository already uses one app package; this closes runnable gaps without
  introducing a new backend service or repo split.
- **Alternatives considered**:
  - Split into separate app + backend runtime services.
  - Perform full verification in-app at startup.

## Decision 2: Use Online Firebase Projects with Explicit Target Profiles

- **Decision**: Store Firebase target metadata in a checked-in target profile manifest with one
  default non-production target and explicit non-default confirmation requirements.
- **Rationale**: Supports multiple online projects (`FR-019`) while reducing accidental production
  targeting risk (`FR-020`).
- **Alternatives considered**:
  - Hardcode one project in source.
  - Use ad hoc environment variables only, without a profile manifest.

## Decision 3: Implement Setup Scripts with Firebase Admin SDK

- **Decision**: Implement setup/provision operations in local Node scripts using
  `firebase-admin` authenticated with operator-supplied service account credentials.
- **Rationale**: The feature requires both Firestore fixture setup and optional Auth account
  provisioning (`FR-017`, `FR-024`), which is a direct fit for Admin SDK capabilities.
- **Alternatives considered**:
  - Firebase client SDK setup scripts (insufficient for account provisioning control).
  - Manual console-only setup instructions (not repeatable or deterministic).

## Decision 4: Default Setup Mode Is Non-Destructive Upsert; Reset Is Explicit and Confirmed

- **Decision**: Setup scripts default to idempotent add/update behavior, with destructive reset
  only via explicit `reset` mode plus confirmation tokens.
- **Rationale**: Matches clarified requirement and protects non-target records by default
  (`FR-021`, `FR-022`, `SC-007`).
- **Alternatives considered**:
  - Always reset fixtures on each setup run.
  - Infer reset intent from target or env without explicit confirmation.

## Decision 5: Account Validation by Default, Provisioning Only in Explicit Mode

- **Decision**: Startup and setup paths validate required verification accounts every run; account
  creation is disabled unless explicit account-provision mode is selected.
- **Rationale**: Enforces operator intent and aligns with `FR-023` and `FR-024`.
- **Alternatives considered**:
  - Auto-create missing accounts during every setup run.
  - Skip account-readiness checks and fail later during runtime verification.

## Decision 6: Separate Quick Startup Checks from Full Verification Execution

- **Decision**: Startup wrappers run only quick health checks; full verification remains a separate
  command that must be invoked explicitly.
- **Rationale**: Directly satisfies `FR-025` and `FR-026`, and keeps launch time bounded.
- **Alternatives considered**:
  - Run full verification automatically at every startup.
  - Keep startup with no checks and rely on manual test execution only.

## Decision 7: Full Verification Produces Evidence Bundles Under Canonical Path

- **Decision**: Full verification command writes deterministic pass/fail and evidence artifacts to
  `evidence/<release>/<gate_id>/<bundle_id>/` with canonical mandatory files.
- **Rationale**: Preserves release-gate contract ownership from `specs/10` and `specs/30` while
  making runnable verification operator-ready (`FR-013`, `SC-005`).
- **Alternatives considered**:
  - Console-only output without structured evidence bundle files.
  - Non-canonical output paths that diverge from gate contracts.
