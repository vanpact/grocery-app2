# Tasks: Quick Wins Bulk Add Packs and Recipes

**Input**: Design documents from `/specs/004-quick-wins-bulk-add/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test and verification tasks for runtime behavior, dedup merge integrity, gate-evidence generation, and committed-boundary safety.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add fixtures and helpers used by quick-wins runtime and verification stories.

- [x] T001 Create household-shared pack/recipe template fixtures in `app/tests/fixtures/quick-wins/templates.json`
- [x] T002 [P] Create projection/apply scenario fixtures (valid, cancel, invalid multiplier) in `app/tests/fixtures/quick-wins/projection-scenarios.json`
- [x] T003 [P] Create timing-run fixtures for pass/fail gate cases in `app/tests/fixtures/quick-wins/timing-runs.json`
- [x] T004 [P] Create shared quick-wins test workspace helper in `app/tests/helpers/quickWins.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core quick-wins domain primitives required before user-story implementation.

**CRITICAL**: No user story work begins before this phase is complete.

- [x] T005 Define quick-wins runtime and timing-report contract types in `app/src/runtime/contracts.ts`
- [x] T006 [P] Implement positive-integer multiplier validator with fail-closed reason codes in `app/src/items/quickWinsValidation.ts`
- [x] T007 [P] Implement deterministic projection builder for template items in `app/src/items/quickWinsProjection.ts`
- [x] T008 Implement apply service that reuses committed dedup path (`addItemWithDedup`) in `app/src/items/quickWinsApplyService.ts`
- [x] T009 [P] Register quick-wins optional-module gate ID and activation helper usage in `app/src/features/optionalModuleGuards.ts`
- [x] T010 Implement household-shared template repository interface and scope checks in `app/src/items/quickTemplateRepository.ts`

**Checkpoint**: Foundation ready; story phases can start.

---

## Phase 3: User Story 1 - Insert Pack/Recipe in One Action (Priority: P1) 🎯 MVP

**Goal**: Enable one-action pack/recipe insertion with deterministic projection and explicit confirm/cancel flow.

**Independent Test**: Apply a template with multiplier to an empty list and verify projected quantities, confirm mutation, and cancel no-mutation behavior.

### Tests for User Story 1

- [x] T011 [P] [US1] Add runtime contract test for projection and outcome shape in `app/tests/contract/quick-wins-bulk-add-contract.spec.ts`
- [x] T012 [P] [US1] Add integration test for successful projection and apply on empty list in `app/tests/integration/quick-wins-apply-pass.spec.ts`
- [x] T013 [P] [US1] Add integration test for cancel path and invalid multiplier fail-closed behavior in `app/tests/integration/quick-wins-validation-fail-closed.spec.ts`

### Implementation for User Story 1

- [x] T014 [US1] Implement quick-wins orchestration service (select template, build projection, confirm/cancel) in `app/src/items/quickWinsService.ts`
- [x] T015 [US1] Wire projection and apply services into quick-wins orchestrator in `app/src/items/quickWinsService.ts`
- [x] T016 [US1] Enforce optional-module gate check before quick-wins apply path in `app/src/items/quickWinsService.ts`
- [x] T017 [US1] Export quick-wins domain types used by runtime/tests in `app/src/types.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Merge Projected Items Without Duplicate Rows (Priority: P2)

**Goal**: Reuse committed dedup behavior so projected overlaps merge deterministically without duplicate rows.

**Independent Test**: Apply overlapping template inputs against existing list snapshots and confirm deterministic merge results with no duplicate rows, including offline replay scenarios.

### Tests for User Story 2

- [x] T018 [P] [US2] Add integration test for overlap merge without duplicate row creation in `app/tests/integration/quick-wins-dedup-merge.spec.ts`
- [x] T019 [P] [US2] Add integration test for non-overlap insertion exactly once in `app/tests/integration/quick-wins-insert-once.spec.ts`
- [x] T020 [P] [US2] Add integration test for deterministic reruns with unchanged snapshots in `app/tests/integration/quick-wins-deterministic.spec.ts`
- [x] T021 [P] [US2] Add integration test for offline replay idempotency (no duplicate projection effects) in `app/tests/integration/quick-wins-offline-replay.spec.ts`

### Implementation for User Story 2

- [x] T022 [US2] Implement projection dedup folding for repeated template lines in `app/src/items/quickWinsProjection.ts`
- [x] T023 [US2] Implement deterministic apply ordering and merged/inserted outcome accounting in `app/src/items/quickWinsApplyService.ts`
- [x] T024 [US2] Enforce same-household template/list boundary validation in `app/src/items/quickTemplateRepository.ts`
- [x] T025 [US2] Add replay idempotency token handling for bulk-add operations in `app/src/sync/replayOrchestrator.ts`
- [x] T026 [US2] Add quick-wins security regression coverage for household isolation and role invariants in `app/tests/security/quick-wins-security-regression.spec.ts`

**Checkpoint**: User Stories 1 and 2 both operate independently with deterministic dedup behavior.

---

## Phase 5: User Story 3 - Produce Gate Evidence for Quick-Input Decision (Priority: P3)

**Goal**: Generate deterministic timing evidence and gate-compatible artifacts for `VR-CND-101-BULK-ADD-TIME` / `G-QW-01`.

**Independent Test**: Run timing evidence generation with pass and fail fixtures and verify threshold logic, artifact paths, and fail-closed behavior.

### Tests for User Story 3

- [x] T027 [P] [US3] Add contract test for timing-evaluation formula and reason-code output in `app/tests/contract/quick-wins-timing-contract.spec.ts`
- [x] T028 [P] [US3] Add integration test for pass case (`>= 10` runs, `>= 25%` improvement) in `app/tests/integration/quick-wins-timing-pass.spec.ts`
- [x] T029 [P] [US3] Add integration test for fail-closed cases (insufficient/malformed runs) in `app/tests/integration/quick-wins-timing-fail.spec.ts`

### Implementation for User Story 3

- [x] T030 [US3] Implement median/improvement timing evaluator for `VR-CND-101-BULK-ADD-TIME` in `app/scripts/lib/quickWinsTimingEvaluation.ts`
- [x] T031 [US3] Implement timing-report builder with deterministic ordering and reason codes in `app/scripts/lib/quickWinsTimingReport.ts`
- [x] T032 [US3] Implement quick-wins verification command for advisory local evidence in `app/scripts/verify-quick-wins.ts`
- [x] T033 [US3] Add quick-wins verification npm command in `app/package.json`
- [x] T034 [US3] Integrate quick-wins gate artifact emission into evidence writer flow in `app/scripts/lib/evidenceWriter.ts`
- [x] T035 [US3] Add CI workflow for authoritative quick-wins gate evidence evaluation in `.github/workflows/quick-wins-gate.yml`

**Checkpoint**: All user stories are independently functional with deterministic quick-wins gate evidence flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, sample artifacts, and regression confidence across story boundaries.

- [x] T036 [P] Update quick-wins operator flow and command matrix in `specs/004-quick-wins-bulk-add/quickstart.md`
- [x] T037 [P] Update evidence guidance for `G-QW-01` / `EV-QW-BULK-ADD` artifacts in `evidence/README.md`
- [x] T038 [P] Add sample quick-wins evidence references in `evidence/sample-quick-wins/README.md`
- [x] T039 [P] Add sample advisory timing report artifact in `evidence/sample-quick-wins/local-timing-report.json`
- [x] T040 [P] Add sample gate-decision artifact in `evidence/sample-quick-wins/local-gate-decision.json`
- [x] T041 Run quick-wins regression command set and record validation notes in `evidence/sample-quick-wins/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks all user stories
- User Stories (Phases 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on completion of User Stories 1-3

### User Story Dependencies

- User Story 1 (P1): Starts after Foundational; no dependency on other stories
- User Story 2 (P2): Starts after Foundational; integrates with US1 runtime services but remains independently testable
- User Story 3 (P3): Starts after Foundational; uses shared evidence infrastructure and can proceed independently of US2

### Within Each User Story

- Write tests/checks first and verify failure
- Implement service/validator logic
- Wire command/runtime entrypoints
- Re-run story tests for independent validation

### Parallel Opportunities

- Phase 1: T002-T004 can run in parallel after T001
- Phase 2: T006, T007, and T009 can run in parallel after T005
- US1: T011-T013 can run in parallel
- US2: T018-T021 can run in parallel
- US3: T027-T029 can run in parallel
- Polish: T036-T040 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "T011 Add runtime contract test in app/tests/contract/quick-wins-bulk-add-contract.spec.ts"
Task: "T012 Add apply-pass integration test in app/tests/integration/quick-wins-apply-pass.spec.ts"
Task: "T013 Add cancel/invalid integration test in app/tests/integration/quick-wins-validation-fail-closed.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T018 Add dedup-merge integration test in app/tests/integration/quick-wins-dedup-merge.spec.ts"
Task: "T019 Add insert-once integration test in app/tests/integration/quick-wins-insert-once.spec.ts"
Task: "T020 Add deterministic-rerun integration test in app/tests/integration/quick-wins-deterministic.spec.ts"
Task: "T021 Add offline-replay integration test in app/tests/integration/quick-wins-offline-replay.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T027 Add timing contract test in app/tests/contract/quick-wins-timing-contract.spec.ts"
Task: "T028 Add timing-pass integration test in app/tests/integration/quick-wins-timing-pass.spec.ts"
Task: "T029 Add timing-fail integration test in app/tests/integration/quick-wins-timing-fail.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate projection/apply/cancel determinism on isolated fixtures
4. Demo one-action pack/recipe insertion

### Incremental Delivery

1. Deliver Setup + Foundational
2. Add US1 insertion and validation flow
3. Add US2 merge/no-duplicate and replay idempotency behavior
4. Add US3 timing evidence and gate artifacts
5. Finalize docs and sample artifacts

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Engineer A drives US1 runtime projection/apply flow
   - Engineer B drives US2 dedup/replay behavior
   - Engineer C drives US3 timing evidence and workflow automation
3. Merge by story checkpoint and run story-specific tests

---

## Constitution Compliance Check (Required Before `//speckit.implement`)

- [X] Principle I (Think Before Coding): assumptions and clarifications are explicit in `spec.md`; tasks map directly to resolved requirements.
- [X] Principle II (Simplicity First): scope is constrained to `GS-101` with no adjacent M1.1 story expansion.
- [X] Principle III (Surgical Changes): planned edits target quick-wins runtime/evidence paths and directly related docs/tests only.
- [X] Principle IV (Goal-Driven Verification): behavior changes include deterministic tests or explicit evidence checks before implementation.
- [X] Principle V (Contract and Reliability Invariants): tasks preserve committed security, household isolation, and fail-closed optional-module behavior.

---

## Notes

- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (US1)
- Total tasks: 41
- Task count by story: US1 = 7, US2 = 9, US3 = 9
- Non-story tasks: 16
- All tasks follow required checklist format: checkbox, task ID, optional `[P]`, required `[US#]` in story phases, and explicit file path
