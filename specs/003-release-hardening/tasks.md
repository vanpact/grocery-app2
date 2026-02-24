# Tasks: Baseline Release Hardening

**Input**: Design documents from `/specs/003-release-hardening/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test and verification tasks for behavior, contract, security, and data-flow changes in this feature.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared fixtures and scaffolding needed by all release-readiness story phases.

- [X] T001 Create committed-ready fixture inputs for release-readiness tests in `app/tests/fixtures/release-readiness/committed-ready.json`
- [X] T002 [P] Create committed `not_ready` fixture inputs for failed/missing verification outcomes in `app/tests/fixtures/release-readiness/committed-not_ready.json`
- [X] T003 [P] Create evidence and approval edge-case fixture inputs in `app/tests/fixtures/release-readiness/evidence-validation.json`
- [X] T004 [P] Create committed field-test coverage fixture inputs in `app/tests/fixtures/release-readiness/field-coverage.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core release-readiness infrastructure that MUST be complete before any user story.

**CRITICAL**: No user story work begins before this phase is complete.

- [X] T005 Define release-readiness and CI decision contracts in `app/src/runtime/contracts.ts`
- [X] T006 [P] Implement canonical source loader for committed verification IDs, owners, and field-test scenarios in `app/scripts/lib/releaseCanonicalSources.ts`
- [X] T007 [P] Implement evidence bundle reader with required artifact existence/parsing checks in `app/scripts/lib/releaseEvidenceReader.ts`
- [X] T008 [P] Implement deterministic report builder with stable ordering and follow-up actions in `app/scripts/lib/releaseReadinessReport.ts`
- [X] T009 Implement committed-default scope and source-label resolver in `app/scripts/lib/releaseReadinessScope.ts`

**Checkpoint**: Foundation ready; user story phases can start.

---

## Phase 3: User Story 1 - Run Final Release Readiness Check (Priority: P1) 🎯 MVP

**Goal**: Provide one release-readiness workflow that evaluates committed outcomes and returns deterministic `ready`/`not_ready` decisions.

**Independent Test**: Run readiness for one candidate with committed outputs and confirm deterministic status plus stable failing verification list.

### Tests for User Story 1

- [X] T010 [P] [US1] Add contract test for release-readiness command and report shape in `app/tests/contract/release-readiness-contract.spec.ts`
- [X] T011 [P] [US1] Add integration test for committed-ready status when all committed verification outcomes pass in `app/tests/integration/release-readiness-ready.spec.ts`
- [X] T012 [P] [US1] Add integration test for committed not_ready status when verification outcomes fail or are missing in `app/tests/integration/release-readiness-not_ready.spec.ts`
- [X] T013 [P] [US1] Add integration test for deterministic reruns with unchanged inputs in `app/tests/integration/release-readiness-deterministic.spec.ts`

### Implementation for User Story 1

- [X] T014 [US1] Implement committed verification outcome evaluator with fail-closed semantics in `app/scripts/lib/releaseVerificationEvaluation.ts`
- [X] T015 [US1] Implement release-readiness runner orchestration (inputs to report) in `app/scripts/lib/releaseReadinessRunner.ts`
- [X] T016 [US1] Implement `verify:release-readiness` CLI entrypoint with `--release` and `--scope` parsing in `app/scripts/verify-release-readiness.ts`
- [X] T017 [US1] Add release-readiness npm command in `app/package.json`

**Checkpoint**: User Story 1 is independently runnable and deterministic.

---

## Phase 4: User Story 2 - Validate Evidence and Approvals (Priority: P2)

**Goal**: Reject release candidates with missing/invalid mandatory evidence artifacts, missing owners, stale approvals, or release-ID mismatches.

**Independent Test**: Run readiness with missing artifact or missing/stale owner approval and confirm deterministic `not_ready` with explicit reasons.

### Tests for User Story 2

- [X] T018 [P] [US2] Add integration test for missing mandatory evidence artifacts causing `not_ready` in `app/tests/integration/release-evidence-missing-artifacts.spec.ts`
- [X] T019 [P] [US2] Add integration test for malformed required JSON artifacts causing `not_ready` in `app/tests/integration/release-evidence-malformed-json.spec.ts`
- [X] T020 [P] [US2] Add integration test for release-ID mismatch rejection in `app/tests/integration/release-evidence-release-id-mismatch.spec.ts`
- [X] T021 [P] [US2] Add integration test for approval boundary semantics (`freshness_hours <= 24` valid, `freshness_hours > 24` stale) and missing owners causing `not_ready` in `app/tests/integration/release-approvals-validation.spec.ts`
- [X] T022 [P] [US2] Add contract test for canonical owner-boundary enforcement and unresolved-source fail-closed behavior in `app/tests/contract/release-owner-boundary-contract.spec.ts`

### Implementation for User Story 2

- [X] T023 [US2] Implement mandatory evidence artifact and release-identity validation rules in `app/scripts/lib/releaseEvidenceValidation.ts`
- [X] T024 [US2] Implement approval completeness and 24-hour freshness validator in `app/scripts/lib/releaseApprovalValidation.ts`
- [X] T025 [US2] Integrate evidence and approval validators into release-readiness runner fail-closed flow in `app/scripts/lib/releaseReadinessRunner.ts`
- [X] T026 [US2] Enforce canonical source document ownership boundaries and unresolved-source blocking behavior in `app/scripts/lib/releaseCanonicalSources.ts`

**Checkpoint**: User Stories 1 and 2 are independently testable with complete evidence/approval enforcement.

---

## Phase 5: User Story 3 - Confirm Field-Test Coverage Before Ship (Priority: P3)

**Goal**: Block readiness when committed field-test scenarios are missing or failing, while keeping committed-default scope behavior explicit.

**Independent Test**: Run readiness with one committed field-test scenario missing and confirm `not_ready` with scenario IDs listed.

### Tests for User Story 3

- [X] T027 [P] [US3] Add integration test for full committed field-test coverage pass path in `app/tests/integration/release-field-test-coverage-pass.spec.ts`
- [X] T028 [P] [US3] Add integration test for missing/failed committed field-test scenarios causing `not_ready` in `app/tests/integration/release-field-test-coverage-fail.spec.ts`
- [X] T029 [P] [US3] Add integration test verifying committed-default scope ignores optional-only failures in `app/tests/integration/release-scope-default-committed.spec.ts`
- [X] T030 [P] [US3] Add integration test for explicit optional-scope opt-in behavior in `app/tests/integration/release-scope-optional-opt-in.spec.ts`

### Implementation for User Story 3

- [X] T031 [US3] Implement committed field-test coverage validator against canonical scenario list in `app/scripts/lib/releaseFieldTestCoverageValidation.ts`
- [X] T032 [US3] Integrate field-test coverage checks into release-readiness runner blocking logic in `app/scripts/lib/releaseReadinessRunner.ts`
- [X] T033 [US3] Add optional-scope opt-in handling in release-readiness CLI and scope resolver in `app/scripts/verify-release-readiness.ts`

**Checkpoint**: All user stories are independently functional with committed field-test coverage enforcement.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize CI authority enforcement, release publication blocking, and operator documentation.

- [X] T034 [P] Add CI enforcement contract test for block/allow publication decisions in `app/tests/contract/release-ci-enforcement-contract.spec.ts`
- [X] T035 [P] Implement CI publication decision helper from readiness report output in `app/scripts/lib/ciReleaseDecision.ts`
- [X] T036 Add authoritative release-readiness workflow with `not_ready` publication block in `.github/workflows/release-readiness.yml`
- [X] T037 [P] Update finalized release-readiness operator flow in `specs/003-release-hardening/quickstart.md`
- [X] T038 [P] Update evidence guidance for readiness report and CI decision artifacts in `evidence/README.md`
- [X] T039 Run release-readiness regression and capture sample output references in `evidence/sample-release-readiness/README.md`
- [X] T040 [P] Add integration test asserting all committed verification IDs are evaluated exactly once per run in `app/tests/integration/release-verification-id-completeness.spec.ts`
- [X] T041 [P] Add integration test asserting release-readiness report generation stays within the 10-minute budget for standard fixtures in `app/tests/integration/release-readiness-runtime-budget.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks all user stories
- User Stories (Phases 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on completion of User Stories 1-3

### User Story Dependencies

- User Story 1 (P1): Starts after Foundational; no dependency on other stories
- User Story 2 (P2): Starts after Foundational; integrates into shared readiness runner from US1
- User Story 3 (P3): Starts after Foundational; integrates field-test coverage checks into shared readiness runner

### Within Each User Story

- Write tests/checks first and verify failure
- Implement validators and runner logic
- Wire CLI/command behavior
- Re-run story tests for independent validation

### Parallel Opportunities

- Phase 1: T002-T004 can run in parallel after T001
- Phase 2: T006-T008 can run in parallel after T005
- US1: T010-T013 can run in parallel
- US2: T018-T022 can run in parallel
- US3: T027-T030 can run in parallel
- Polish: T034, T035, T037, T038, T040, and T041 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "T010 Add release-readiness contract test in app/tests/contract/release-readiness-contract.spec.ts"
Task: "T011 Add committed-ready integration test in app/tests/integration/release-readiness-ready.spec.ts"
Task: "T012 Add committed-not_ready integration test in app/tests/integration/release-readiness-not_ready.spec.ts"
Task: "T013 Add deterministic-rerun integration test in app/tests/integration/release-readiness-deterministic.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T018 Add missing-artifact integration test in app/tests/integration/release-evidence-missing-artifacts.spec.ts"
Task: "T019 Add malformed-JSON integration test in app/tests/integration/release-evidence-malformed-json.spec.ts"
Task: "T020 Add release-id-mismatch integration test in app/tests/integration/release-evidence-release-id-mismatch.spec.ts"
Task: "T021 Add approval freshness/completeness integration test in app/tests/integration/release-approvals-validation.spec.ts"
Task: "T022 Add owner-boundary contract test in app/tests/contract/release-owner-boundary-contract.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T027 Add field-test-coverage pass integration test in app/tests/integration/release-field-test-coverage-pass.spec.ts"
Task: "T028 Add field-test-coverage fail integration test in app/tests/integration/release-field-test-coverage-fail.spec.ts"
Task: "T029 Add committed-default scope integration test in app/tests/integration/release-scope-default-committed.spec.ts"
Task: "T030 Add optional-scope opt-in integration test in app/tests/integration/release-scope-optional-opt-in.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate deterministic ready/not_ready behavior for committed inputs
4. Demo the release-readiness command output

### Incremental Delivery

1. Deliver Setup + Foundational
2. Add US1 release-readiness decision path
3. Add US2 evidence and approval enforcement
4. Add US3 field-test coverage enforcement and scope behavior
5. Finalize CI authority/publication blocking and docs

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Engineer A drives US1 runner and CLI command
   - Engineer B drives US2 evidence/approval validation
   - Engineer C drives US3 field-test coverage validation
3. Merge by story checkpoints and run story-specific tests

---

## Constitution Compliance Check (Required Before `//speckit.implement`)

- [X] Principle I (Think Before Coding): assumptions, decision points, and deterministic acceptance criteria are explicit in `spec.md` and mapped in tasks.
- [X] Principle II (Simplicity First): scope is constrained to release-hardening workflow, validation, and CI enforcement only.
- [X] Principle III (Surgical Changes): planned implementation targets only release-readiness scripts, tests, workflow wiring, and related docs.
- [X] Principle IV (Goal-Driven Verification): behavior-changing tasks include failing tests or deterministic checks before implementation completion.
- [X] Principle V (Contract and Reliability Invariants): tasks preserve canonical ownership in `specs/00`, `specs/10`, `specs/20`, and `specs/30`.

---

## Notes

- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (US1)
- Total tasks: 41
- Task count by story: US1 = 8, US2 = 9, US3 = 7
- Non-story tasks: 17
- All tasks follow required checklist format: checkbox, task ID, optional `[P]`, required `[US#]` in story phases, and explicit file path

