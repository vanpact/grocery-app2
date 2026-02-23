# Tasks: Grocery App Runnable End-to-End Online Firebase Baseline

**Input**: Design documents from `/specs/002-run-app-e2e/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test and verification tasks for behavior, contract, security, and data-flow changes in this feature.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add runnable project scaffolding and command surfaces required by all stories.

- [x] T001 Create runnable script/config/runtime directories in `app/scripts/`, `app/config/`, and `app/src/runtime/`
- [x] T002 Add runnable command scripts and dependencies (`firebase-admin`, script runner) in `app/package.json`
- [x] T003 [P] Add script TypeScript build config for CLI tooling in `app/tsconfig.scripts.json`
- [x] T004 [P] Create Firebase target and account config templates in `app/config/firebase-targets.example.json` and `app/config/verification-accounts.example.json`
- [x] T005 [P] Create baseline fixture manifest template in `app/config/fixtures.manifest.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core runtime/setup/verification infrastructure required before story implementation.

**⚠️ CRITICAL**: No user story work begins before this phase is complete.

- [x] T006 Define shared runtime/setup/verification contracts in `app/src/runtime/contracts.ts`
- [x] T007 [P] Implement Firebase target profile loader with default-target validation in `app/src/runtime/targetProfiles.ts`
- [x] T008 [P] Implement command-line mode and confirmation guard helpers in `app/scripts/lib/commandGuards.ts`
- [x] T009 [P] Implement Firebase Admin client factory for setup and verification scripts in `app/scripts/lib/adminClient.ts`
- [x] T010 [P] Implement deterministic setup result formatter in `app/scripts/lib/setupResult.ts`
- [x] T011 Implement quick health-check service contract in `app/src/runtime/quickHealthCheck.ts`
- [x] T012 Implement startup gate orchestration (fail closed on check failure) in `app/src/runtime/startupGate.ts`
- [x] T013 Implement canonical evidence bundle writer scaffolding in `app/scripts/lib/evidenceWriter.ts`

**Checkpoint**: Foundation ready; user story phases can start.

---

## Phase 3: User Story 1 - Launch and Complete Core Flow Locally (Priority: P1) 🎯 MVP

**Goal**: From clean checkout, run app via startup wrappers, sign in, add/validate item, and keep Active Shopping visible after restart.

**Independent Test**: Run documented startup path, sign in with valid household account, add+validate one item, restart app, confirm item remains in Active Shopping.

### Tests for User Story 1

- [x] T014 [P] [US1] Add startup quick-check success-path integration test in `app/tests/integration/us1-startup-pass.spec.ts`
- [x] T015 [P] [US1] Add startup fail-closed integration test for config/account readiness issues in `app/tests/integration/us1-startup-fail-closed.spec.ts`
- [x] T016 [P] [US1] Add non-destructive setup idempotency integration test in `app/tests/integration/us1-db-setup-idempotent.spec.ts`
- [x] T017 [P] [US1] Add account-provision mode gating integration test in `app/tests/integration/us1-account-provision-mode.spec.ts`
- [x] T018 [P] [US1] Add core runnable flow integration test (sign-in/add/validate/restart) in `app/tests/integration/us1-runnable-core-flow.spec.ts`

### Implementation for User Story 1

- [x] T019 [P] [US1] Create Expo app entry screen wiring for committed workspace in `app/App.tsx`
- [x] T020 [US1] Implement runtime bootstrap orchestration (startup gate + session bootstrap) in `app/src/runtime/bootstrapApp.ts`
- [x] T021 [P] [US1] Implement online setup command with default upsert mode in `app/scripts/db-setup.ts`
- [x] T022 [P] [US1] Implement fixture structure/seed helpers for setup command in `app/scripts/lib/fixtureSetup.ts`
- [x] T023 [P] [US1] Implement required-account validation/provision helpers in `app/scripts/lib/accountProvisioning.ts`
- [x] T024 [US1] Implement emulator startup wrapper with preflight quick checks in `app/scripts/start-android-emulator.ts`
- [x] T025 [US1] Implement physical-device startup wrapper with preflight quick checks in `app/scripts/start-android-device.ts`
- [x] T026 [US1] Wire runnable setup/start commands in `app/package.json`
- [x] T027 [US1] Integrate membership-required recovery messaging in runnable UI path in `app/src/ui/screens/ActiveShoppingScreen.tsx`

**Checkpoint**: User Story 1 is runnable and independently testable on local runtime.

---

## Phase 4: User Story 2 - Recover Correctly Through Offline and Reconnect (Priority: P2)

**Goal**: Keep committed actions usable offline and replay them safely in deterministic order after reconnect with no duplicate net effects.

**Independent Test**: In a connected session perform add/validate offline, reconnect, and verify ordered replay with zero data loss and zero duplicate net effect.

### Tests for User Story 2

- [x] T028 [P] [US2] Add offline queue persistence-across-restart integration test in `app/tests/integration/us2-offline-queue-persistence.spec.ts`
- [x] T029 [P] [US2] Add reconnect replay ordering integration test in `app/tests/integration/us2-reconnect-replay-order.spec.ts`
- [x] T030 [P] [US2] Add reconnect duplicate-net-effect prevention integration test in `app/tests/integration/us2-reconnect-no-duplicates.spec.ts`
- [x] T031 [P] [US2] Add explicit offline/reconnecting state visibility UX test in `app/tests/ux/us2-offline-state-visibility.spec.ts`

### Implementation for User Story 2

- [x] T032 [P] [US2] Implement persistent replay queue storage adapter in `app/src/sync/replayPersistence.ts`
- [x] T033 [US2] Integrate queue snapshot/restore persistence in `app/src/sync/firestoreClient.ts`
- [x] T034 [US2] Enforce deterministic reconnect replay behavior in `app/src/sync/replayOrchestrator.ts`
- [x] T035 [US2] Restore pending replay queue during startup bootstrap in `app/src/runtime/bootstrapApp.ts`
- [x] T036 [US2] Implement explicit offline/reconnecting feedback states in `app/src/ui/components/StateFeedback.tsx`
- [x] T037 [US2] Refresh Active Shopping state after replay completion in `app/src/ui/screens/ActiveShoppingScreen.tsx`

**Checkpoint**: User Stories 1 and 2 pass independently with offline/reconnect guarantees.

---

## Phase 5: User Story 3 - Execute Runnable Verification and Evidence Path (Priority: P3)

**Goal**: Provide one explicit full verification command that emits deterministic pass/fail outputs and canonical evidence bundle artifacts.

**Independent Test**: Run full verification command and confirm deterministic rule output plus complete evidence bundle with mandatory files.

### Tests for User Story 3

- [x] T038 [P] [US3] Add command-separation contract test (quick startup check vs full verification) in `app/tests/contract/us3-startup-policy-contract.spec.ts`
- [x] T039 [P] [US3] Add deterministic pass/fail verification integration test in `app/tests/integration/us3-full-verification-results.spec.ts`
- [x] T040 [P] [US3] Add evidence bundle mandatory-file integration test in `app/tests/integration/us3-evidence-bundle-files.spec.ts`
- [x] T041 [P] [US3] Add unauthorized deny-outcome security evidence test in `app/tests/security/us3-verification-deny-evidence.spec.ts`

### Implementation for User Story 3

- [x] T042 [P] [US3] Implement quick verification command for startup preflight in `app/scripts/verify-quick.ts`
- [x] T043 [P] [US3] Implement full verification command with explicit args in `app/scripts/verify-full.ts`
- [x] T044 [US3] Implement committed verification orchestrator and rule mapping in `app/scripts/lib/runCommittedVerification.ts`
- [x] T045 [US3] Complete canonical evidence bundle writing logic in `app/scripts/lib/evidenceWriter.ts`
- [x] T046 [US3] Implement gate decision helper for fail-closed optional behavior reporting in `app/scripts/lib/gateDecision.ts`
- [x] T047 [US3] Ensure emulator startup wrapper invokes only quick verification in `app/scripts/start-android-emulator.ts`
- [x] T048 [US3] Ensure device startup wrapper invokes only quick verification in `app/scripts/start-android-device.ts`

**Checkpoint**: All user stories are independently functional and verification-ready.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize operator guidance, runnable smoke coverage, and release-facing checks.

- [x] T049 [P] Update runnable operator quickstart steps and command matrix in `specs/002-run-app-e2e/quickstart.md`
- [x] T050 [P] Update evidence bundle usage guidance for runnable verification in `evidence/README.md`
- [x] T051 [P] Add troubleshooting guide for target selection, reset safeguards, and account readiness in `specs/002-run-app-e2e/troubleshooting.md`
- [x] T052 Add runnable regression command aggregating US1-US3 verification suites in `app/package.json`
- [x] T053 Run runnable regression suite and capture sample output references in `evidence/sample-runnable/README.md`
- [x] T054 Validate startup quick-check runtime budget reporting in `app/tests/integration/us3-startup-budget.spec.ts`

---

## Phase 7: Coverage and Alignment Fixes

**Purpose**: Close remaining requirement-coverage gaps for confirmations, reset safety, optional fail-closed behavior, and parity checks.

- [x] T055 [P] [US1] Add non-default target confirmation integration test in `app/tests/integration/us1-nondefault-target-confirmation.spec.ts`
- [x] T056 [P] [US1] Add reset-mode explicit confirmation integration test in `app/tests/integration/us1-reset-confirmation.spec.ts`
- [x] T057 [P] [US1] Add reset-mode baseline-owned-deletion-only integration test in `app/tests/integration/us1-reset-scope-guard.spec.ts`
- [x] T058 [P] [US1] Add setup non-target record preservation integration test in `app/tests/integration/us1-setup-non-target-preservation.spec.ts`
- [x] T059 [P] [US1] Add emulator-vs-phone parity integration test for committed runnable flow in `app/tests/integration/us1-emulator-phone-parity.spec.ts`
- [x] T060 [US1] Implement explicit reset mode handling in setup command in `app/scripts/db-setup.ts`
- [x] T061 [US1] Implement baseline-owned fixture deletion scope guards in `app/scripts/lib/fixtureSetup.ts`
- [x] T062 [US1] Enforce non-default target confirmation token checks in `app/scripts/lib/commandGuards.ts`
- [x] T063 [US1] Enforce reset confirmation token checks in `app/scripts/lib/commandGuards.ts`
- [x] T064 [P] [US3] Add optional-module fail-closed runtime contract test in `app/tests/contract/us3-optional-modules-fail-closed.spec.ts`
- [x] T065 [US3] Implement optional-module runtime enforcement for gate and owner authorization in `app/src/features/optionalModuleGuards.ts`
- [x] T066 [US3] Integrate optional-module guard checks into verification gate decisions in `app/scripts/lib/gateDecision.ts`

**Checkpoint**: Remaining coverage gaps are closed for FR-015, FR-020, FR-021, FR-022, SC-006, and SC-007.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Phase 1 and blocks all story work
- User Story phases (Phases 3-5): depend on Phase 2 completion
- Polish (Phase 6): depends on completion of selected user stories
- Coverage and Alignment Fixes (Phase 7): depends on Phases 3-5 completion and can run before or after Phase 6

### User Story Dependencies

- US1 (P1): starts after Phase 2; no dependency on US2/US3
- US2 (P2): starts after Phase 2 and integrates with US1 runtime bootstrap/replay paths
- US3 (P3): starts after Phase 2 and depends on command/runtime surfaces from US1
- Phase 7 adds US1 and US3 hardening tasks without changing US2 scope

### Within Each User Story

- Write tests/checks first and confirm failure
- Implement core services/commands
- Integrate UI/runtime wiring
- Re-run story tests for independent validation

### Parallel Opportunities

- Phase 1: T003-T005 can run in parallel after T001-T002
- Phase 2: T007-T010 can run in parallel after T006
- US1: T014-T018 can run in parallel; T021-T023 can run in parallel
- US2: T028-T031 can run in parallel; T032 can run in parallel with UI work T036
- US3: T038-T041 can run in parallel; T042-T043 can run in parallel
- Phase 7: T055-T059 can run in parallel; T064 can run in parallel with US1 implementation hardening

---

## Parallel Example: User Story 1

```bash
Task: "T014 Add startup quick-check success-path integration test in app/tests/integration/us1-startup-pass.spec.ts"
Task: "T015 Add startup fail-closed integration test in app/tests/integration/us1-startup-fail-closed.spec.ts"
Task: "T016 Add non-destructive setup idempotency integration test in app/tests/integration/us1-db-setup-idempotent.spec.ts"
Task: "T017 Add account-provision mode gating integration test in app/tests/integration/us1-account-provision-mode.spec.ts"
Task: "T018 Add core runnable flow integration test in app/tests/integration/us1-runnable-core-flow.spec.ts"
Task: "T055 Add non-default target confirmation integration test in app/tests/integration/us1-nondefault-target-confirmation.spec.ts"
Task: "T056 Add reset-mode explicit confirmation integration test in app/tests/integration/us1-reset-confirmation.spec.ts"
Task: "T057 Add reset-mode baseline-owned-deletion-only integration test in app/tests/integration/us1-reset-scope-guard.spec.ts"
Task: "T058 Add setup non-target record preservation integration test in app/tests/integration/us1-setup-non-target-preservation.spec.ts"
Task: "T059 Add emulator-vs-phone parity integration test in app/tests/integration/us1-emulator-phone-parity.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T028 Add offline queue persistence-across-restart test in app/tests/integration/us2-offline-queue-persistence.spec.ts"
Task: "T029 Add reconnect replay ordering test in app/tests/integration/us2-reconnect-replay-order.spec.ts"
Task: "T030 Add reconnect duplicate-net-effect prevention test in app/tests/integration/us2-reconnect-no-duplicates.spec.ts"
Task: "T031 Add offline/reconnecting state visibility UX test in app/tests/ux/us2-offline-state-visibility.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T038 Add command-separation contract test in app/tests/contract/us3-startup-policy-contract.spec.ts"
Task: "T039 Add deterministic pass/fail verification test in app/tests/integration/us3-full-verification-results.spec.ts"
Task: "T040 Add evidence bundle mandatory-file test in app/tests/integration/us3-evidence-bundle-files.spec.ts"
Task: "T041 Add unauthorized deny-outcome evidence test in app/tests/security/us3-verification-deny-evidence.spec.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate independent US1 acceptance path on emulator and phone.
4. Demo runnable baseline startup + core flow.

### Incremental Delivery

1. Deliver US1 runnable startup/core flow.
2. Add US2 offline/reconnect guarantees.
3. Add US3 verification/evidence command path.
4. Complete Phase 6 polish tasks.
5. Complete Phase 7 confirmation/reset/optional-guard hardening and run full runnable regression.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After Phase 2:
   - Engineer A drives US1 command/runtime path.
   - Engineer B drives US2 replay and offline UX path.
   - Engineer C drives US3 verification/evidence path.
3. Merge at story checkpoints and rerun independent tests.

---

## Constitution Compliance Check (Required Before `//speckit.implement`)

- [X] Principle I (Think Before Coding): assumptions/tradeoffs and clarifications are explicit in `spec.md` and `plan.md`.
- [X] Principle II (Simplicity First): tasks are constrained to runnable-baseline closure only.
- [X] Principle III (Surgical Changes): tasks target only feature-critical runtime/setup/verification paths.
- [X] Principle IV (Goal-Driven Verification): behavior changes have explicit failing-test or deterministic-check tasks.
- [X] Principle V (Contract and Reliability Invariants): role model, deny-by-default policy, household isolation, and replay safety remain mandatory.

---

## Notes

- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (US1) only.
- Total tasks: 66.
- Task count by story: US1 = 23, US2 = 10, US3 = 14.
- Non-story tasks: Setup/Foundational/Polish = 19.
- All tasks follow required checklist format: checkbox + task ID + optional `[P]` + required story label in story phases + file path.

