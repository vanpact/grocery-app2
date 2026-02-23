# Tasks: Grocery App Committed Baseline Bootstrap

**Input**: Design documents from `/specs/001-baseline-spec-bootstrap/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test and verification tasks for any behavior, contract, security, or
data-flow change. Only strictly non-behavioral changes may omit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling for committed baseline implementation.

- [X] T001 Create module and test directory structure in `app/src/{auth,households,lists,items,shopping,events,sync,ui}` and `app/tests/{contract,integration,security,ux}`
- [X] T002 Initialize Expo TypeScript app configuration in `app/package.json`, `app/app.json`, and `app/tsconfig.json`
- [X] T003 [P] Configure lint/format/test scripts in `app/package.json` and `app/.eslintrc.cjs`
- [X] T004 [P] Create evidence artifact root and placeholders in `evidence/.gitkeep` and `evidence/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Implement Firestore bootstrap and offline persistence wiring in `app/src/sync/firestoreClient.ts`
- [X] T006 [P] Define canonical lifecycle/role constants and transition matrix in `app/src/auth/policy.ts`
- [X] T007 [P] Implement household-scope access helpers in `app/src/households/householdScope.ts`
- [X] T008 [P] Implement dedup key normalizer utility in `app/src/items/dedupKey.ts`
- [X] T009 Implement offline mutation queue core in `app/src/sync/replayQueue.ts`
- [X] T010 [P] Implement committed event logging interface in `app/src/events/eventLogger.ts`
- [X] T011 Configure security emulator test harness in `app/tests/security/emulator.setup.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Complete Core Household Shopping Reliably (Priority: P1) 🎯 MVP

**Goal**: Deliver sign-in, add/validate, dedup merge, and offline replay-safe committed shopping flow.

**Independent Test**: Execute `FT-1 Core Shopping Reliability` plus baseline checks mapped to `GS-010`.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T012 [P] [US1] Add integration test for auth and household bootstrap in `app/tests/integration/us1-auth-household.spec.ts`
- [X] T013 [P] [US1] Add integration test for dedup merge-on-add behavior in `app/tests/integration/us1-dedup-merge.spec.ts`
- [X] T014 [P] [US1] Add integration test for offline replay reliability in `app/tests/integration/us1-offline-replay.spec.ts`
- [X] T015 [P] [US1] Add Active Shopping validated-only aggregation verification for `VR-COM-004` in `app/tests/integration/us1-active-shopping-filter.spec.ts`

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement auth session bootstrap flow in `app/src/auth/sessionBootstrap.ts`
- [X] T017 [P] [US1] Implement item write service with dedup merge in `app/src/items/itemWriteService.ts`
- [X] T018 [P] [US1] Implement reconnect replay orchestrator in `app/src/sync/replayOrchestrator.ts`
- [X] T019 [US1] Implement Active Shopping aggregation for `validated` items in `app/src/shopping/activeShoppingService.ts`
- [X] T020 [US1] Wire committed shopping actions and offline indicator handling in `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [X] T021 [US1] Integrate committed action event emissions in `app/src/events/committedEventHandlers.ts`

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - Enforce Role-Safe Collaboration (Priority: P2)

**Goal**: Enforce role-gated transitions and strict household isolation with deny-by-default behavior.

**Independent Test**: Run emulator allow/deny suite for `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` and scenario `FT-2`.

### Tests for User Story 2 ⚠️

- [X] T022 [P] [US2] Add role-transition allow/deny tests in `app/tests/security/us2-role-transitions.spec.ts`
- [X] T023 [P] [US2] Add cross-household read/write deny tests in `app/tests/security/us2-household-isolation.spec.ts`

### Implementation for User Story 2

- [X] T024 [US2] Implement transition authorizer guard in `app/src/auth/transitionAuthorizer.ts`
- [X] T025 [US2] Enforce household access boundary in repositories via `app/src/households/householdAccessGuard.ts`
- [X] T026 [US2] Apply deny-by-default mutation policy in `app/src/items/mutationPolicy.ts`
- [X] T027 [US2] Persist denied-attempt security audit events in `app/src/events/securityAuditLogger.ts`

**Checkpoint**: User Stories 1 and 2 should both pass independently with security constraints enforced.

---

## Phase 5: User Story 3 - Preserve Cross-Platform UX Reliability (Priority: P3)

**Goal**: Ensure committed UX state visibility, MD3 mapping, responsive behavior, and web interaction parity.

**Independent Test**: Execute `FT-UX-ANDROID-M3E`, `FT-UX-WEB-600-839`, `FT-UX-WEB-MID-RANGE-840-1199`, and `FT-UX-WEB-DESKTOP-2PANE`.

### Tests for User Story 3 ⚠️

- [X] T028 [P] [US3] Add UX tests for empty/loading/error/offline states in `app/tests/ux/us3-state-visibility.spec.ts`
- [X] T029 [P] [US3] Add responsive breakpoint coverage tests in `app/tests/ux/us3-responsive-layout.spec.ts`
- [X] T030 [P] [US3] Add keyboard-vs-pointer parity tests in `app/tests/ux/us3-input-parity.spec.ts`
- [X] T031 [P] [US3] Add MD3 component-mapping audit verification for `VR-COM-008` in `app/tests/ux/us3-md3-component-mapping.spec.ts`

### Implementation for User Story 3

- [X] T032 [US3] Implement shared state feedback components in `app/src/ui/components/StateFeedback.tsx`
- [X] T033 [US3] Implement committed MD3 screen composition in `app/src/ui/screens/CommittedScreens.tsx`
- [X] T034 [US3] Implement responsive layout resolver in `app/src/ui/layout/layoutModeResolver.ts`
- [X] T035 [US3] Implement web interaction parity bindings in `app/src/ui/web/interactionParity.ts`
- [X] T036 [US3] Implement desktop two-pane workspace constraints in `app/src/ui/layout/DesktopWorkspace.tsx`

**Checkpoint**: All user stories should now be independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize verification, evidence workflow, and release-readiness checks.

- [X] T037 [P] Update verification runbook and execution steps in `specs/001-baseline-spec-bootstrap/quickstart.md`
- [X] T038 [P] Add evidence JSON schema stubs in `evidence/schemas/manifest.schema.json`, `evidence/schemas/decision.schema.json`, and `evidence/schemas/approvals.schema.json`
- [X] T039 Add release evidence checklist and artifact index in `evidence/README.md`
- [X] T040 Run committed security regression pack in `app/tests/security/us2-regression-pack.spec.ts`
- [X] T041 [P] Add navigation stability verification for `VR-COM-007` (foreground/background + route transitions) in `app/tests/ux/nav-stability.spec.ts`
- [X] T042 [P] Add committed event coverage verification (`add`,`merge`,`validate`,`toggle`,`undo`,`error_retry`) in `app/tests/contract/event-coverage.spec.ts`
- [X] T043 [P] Add contract test suite for security/gate contracts in `app/tests/contract/security-and-gate-contract.spec.ts`
- [X] T044 Implement optional-module runtime guard registry with default-disabled behavior in `app/src/features/optionalModuleGuards.ts`
- [X] T045 [P] Add fail-closed optional-module behavior verification in `app/tests/integration/optional-modules-fail-closed.spec.ts`

---

## Phase 7: Gap Closure Hardening (Post-Checklist)

**Purpose**: Close requirements-quality gaps identified in `checklists/spec-quality.md` with explicit verification and implementation updates.

### Tests for Gap Closure ⚠️

- [X] T046 [P] [US1] Add membership-missing denial + recovery test in `app/tests/integration/us1-membership-required.spec.ts`
- [X] T047 [P] [US1] Add replay FIFO/idempotency verification for `VR-COM-014` in `app/tests/integration/us1-replay-order-idempotency.spec.ts`
- [X] T048 [P] [US1] Add replay partial-failure recovery verification for `VR-COM-015` in `app/tests/integration/us1-replay-partial-failure.spec.ts`
- [X] T049 [P] [US1] Add Active Shopping ordering/exclusion verification for `VR-COM-013` in `app/tests/integration/us1-active-shopping-ordering.spec.ts`
- [X] T050 [P] [US2] Add transition outcome semantics tests for `allowed|transition_not_allowed|household_mismatch|noop` in `app/tests/security/us2-transition-outcomes.spec.ts`
- [X] T051 [P] [US2] Add household isolation tests for aggregate queries and event streams in `app/tests/security/us2-query-surface-isolation.spec.ts`
- [X] T052 [P] [US2] Add concurrent edit conflict policy verification for `VR-COM-018` in `app/tests/integration/us2-concurrent-edit-conflicts.spec.ts`
- [X] T053 [P] [US3] Add latency/responsiveness threshold verification for `VR-COM-019` in `app/tests/ux/us3-latency-budgets.spec.ts`
- [X] T054 [P] [US3] Add accessibility baseline verification for `VR-COM-020` in `app/tests/ux/us3-accessibility-baseline.spec.ts`
- [X] T055 [P] [US3] Add lifecycle navigation stability verification for `VR-COM-021` in `app/tests/ux/us3-nav-lifecycle-resume.spec.ts`
- [X] T056 [P] [US3] Add degraded-mode dependency verification for `VR-COM-022` in `app/tests/integration/us3-degraded-mode.spec.ts`
- [X] T057 [P] [US3] Add actor-scope enforcement verification for `VR-COM-023` in `app/tests/security/us3-actor-scope-enforcement.spec.ts`
- [X] T058 [P] [US3] Add optional-gate owner activation contract test for `VR-COM-017` in `app/tests/contract/optional-gate-ownership.spec.ts`

### Implementation for Gap Closure

- [X] T059 [US1] Implement membership-required operation block and recovery state in `app/src/auth/sessionBootstrap.ts` and `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [X] T060 [US1] Implement FIFO replay ordering, idempotency, and partial-failure resume rules in `app/src/sync/replayOrchestrator.ts`
- [X] T061 [US1] Implement deterministic Active Shopping ordering and strict status exclusion in `app/src/shopping/activeShoppingService.ts`
- [X] T062 [US2] Implement explicit transition outcome reason contract in `app/src/auth/transitionAuthorizer.ts`
- [X] T063 [US2] Extend household isolation enforcement across document, aggregate, and stream surfaces in `app/src/households/householdAccessGuard.ts`
- [X] T064 [US2] Implement stale-version conflict rejection and retry hints in `app/src/items/itemWriteService.ts`
- [X] T065 [US3] Implement latency instrumentation hooks for committed action and route transition budgets in `app/src/ui/screens/CommittedScreens.tsx`
- [X] T066 [US3] Implement accessibility baseline requirements (focus indicators + labels) in `app/src/ui/components/StateFeedback.tsx` and `app/src/ui/web/interactionParity.ts`
- [X] T067 [US3] Implement lifecycle navigation queue persistence for offline resume in `app/src/ui/layout/DesktopWorkspace.tsx` and `app/src/sync/firestoreClient.ts`
- [X] T068 [US3] Implement degraded-mode dependency behavior for Firebase outage in `app/src/sync/firestoreClient.ts`
- [X] T069 [US3] Implement optional-gate activation + owner registry enforcement in `app/src/features/optionalModuleGuards.ts`

**Checkpoint**: Requirements gaps from `checklists/spec-quality.md` are fully mapped to executable tests and implementation tasks.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete
- **Gap Closure Hardening (Phase 7)**: Depends on Phase 6 completion and approved checklist findings

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational; validates security over shared flows from US1
- **User Story 3 (P3)**: Can start after Foundational; verifies UX layer over shared flows

### Within Each User Story

- Tests and verification checks MUST be written and fail before implementation
- Policy/models before service logic
- Service logic before UI/integration wiring
- Story completion and independent validation before moving to next priority

### Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel
- Foundational tasks marked `[P]` can run in parallel after T005
- For each story, test tasks marked `[P]` can run together
- US1 implementation tasks T016-T018 can run in parallel after tests are in place
- US3 UX implementation tasks T034-T036 can run in parallel once T033 establishes shared composition
- Phase 7 test tasks T046-T058 can run in parallel before any Phase 7 implementation task

---

## Parallel Example: User Story 1

```bash
# Launch US1 verification tasks together:
Task: "T012 Add integration test for auth and household bootstrap in app/tests/integration/us1-auth-household.spec.ts"
Task: "T013 Add integration test for dedup merge-on-add behavior in app/tests/integration/us1-dedup-merge.spec.ts"
Task: "T014 Add integration test for offline replay reliability in app/tests/integration/us1-offline-replay.spec.ts"
Task: "T015 Add Active Shopping validated-only aggregation verification for VR-COM-004 in app/tests/integration/us1-active-shopping-filter.spec.ts"

# Launch US1 core services together after tests fail:
Task: "T016 Implement auth session bootstrap flow in app/src/auth/sessionBootstrap.ts"
Task: "T017 Implement item write service with dedup merge in app/src/items/itemWriteService.ts"
Task: "T018 Implement reconnect replay orchestrator in app/src/sync/replayOrchestrator.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run US1 independent tests (`T012-T015`) and acceptance scenarios
5. Demo committed baseline core flow

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Deliver US1 → validate independently (MVP)
3. Deliver US2 → validate independently (security hardening)
4. Deliver US3 → validate independently (UX reliability)
5. Complete Phase 6 polish and release evidence checklist
6. Complete Phase 7 gap closure hardening and rerun `spec-quality.md`

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Engineer A: US1 flow and replay reliability
   - Engineer B: US2 security enforcement
   - Engineer C: US3 UX reliability
3. Integrate at phase checkpoints with verification evidence

---

## Constitution Compliance Check (Required Before /speckit.implement)

- [X] Principle I (Think Before Coding): assumptions and tradeoffs are documented in `spec.md` and `plan.md`
- [X] Principle II (Simplicity First): no speculative scope beyond committed baseline in this task list
- [X] Principle III (Surgical Changes): tasks stay within feature-critical files/paths
- [X] Principle IV (Goal-Driven Verification): behavior-changing work has fail-first tests/checks
- [X] Principle V (Contract and Reliability Invariants): role model (`suggest`,`validate`), deny-by-default, household isolation, and offline replay safety are preserved

---

## Notes

- `[P]` tasks = different files, no blocking dependencies on incomplete tasks
- `[USx]` labels map each task to a specific user story for traceability
- Each user story is designed to be independently implementable and testable
- Optional modules remain gate-controlled and fail-closed in this committed baseline task plan



