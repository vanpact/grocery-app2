# Tasks: UI Usability Alignment

**Input**: Design documents from `/specs/005-ui-usability-alignment/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test and verification tasks for navigation usability, state recovery, responsive behavior, parity behavior, and usability-evidence reporting.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add fixture and helper scaffolding reused across all usability stories.

- [X] T001 Create deterministic usability task-run fixture set for pass/fail thresholds in `app/tests/fixtures/usability/task-runs.json`
- [X] T002 [P] Create committed screen-state matrix fixture for four destinations and required states in `app/tests/fixtures/usability/state-matrix.json`
- [X] T003 [P] Create viewport and input-parity fixture set for responsive/parity scenarios in `app/tests/fixtures/usability/layout-and-parity.json`
- [X] T004 [P] Create shared usability test helper for fixture loading and run summarization in `app/tests/helpers/usability.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core runtime and evidence primitives required before any user-story implementation.

**CRITICAL**: No user story work begins before this phase is complete.

- [X] T005 Define UI usability runtime/evidence contract types for committed destinations and SC-006/SC-007 summary in `app/src/runtime/contracts.ts`
- [X] T006 [P] Implement committed destination shell model (`sign-in`, `active-shopping`, `overview`, `settings`) in `app/src/ui/screens/CommittedScreens.tsx`
- [X] T007 [P] Implement standardized feedback-state and recovery-action contract primitives in `app/src/ui/components/StateFeedback.tsx`
- [X] T008 [P] Create usability evidence evaluator module scaffold and type-safe interfaces in `app/scripts/lib/uiUsabilityEvaluation.ts`
- [X] T009 [P] Create usability evidence report module scaffold and deterministic output schema in `app/scripts/lib/uiUsabilityReport.ts`
- [X] T010 Integrate foundational usability evidence types into committed verification runner pipeline in `app/scripts/lib/runCommittedVerification.ts`

**Checkpoint**: Foundation ready; story phases can start.

---

## Phase 3: User Story 1 - Complete Core Shopping Tasks Without UI Friction (Priority: P1) 🎯 MVP

**Goal**: Restore usable committed navigation and core add/validate flow completion across the four committed screens.

**Independent Test**: Run committed baseline flow on Android/Web and confirm all four destinations are reachable and add/validate flow completes with no dead-end navigation.

### Tests for User Story 1

- [X] T011 [P] [US1] Add contract test for committed destination shell and primary action metadata in `app/tests/contract/ui-runtime-usability-contract.spec.ts`
- [X] T012 [P] [US1] Add integration test for navigation reachability across Sign-in, Active Shopping, Overview, and Settings in `app/tests/integration/usability-core-flow-navigation.spec.ts`
- [X] T013 [P] [US1] Add UX test for explicit action language on committed primary controls in `app/tests/ux/usability-action-language.spec.ts`
- [X] T014 [P] [US1] Add UX threshold test for SC-006 (`>=90%` completion within `<=90s`) using deterministic task-run fixtures in `app/tests/ux/usability-task-threshold.spec.ts`

### Implementation for User Story 1

- [X] T015 [US1] Implement committed navigation shell composition and create destination modules in `app/src/ui/screens/CommittedScreens.tsx`, `app/src/ui/screens/SignInScreen.tsx`, `app/src/ui/screens/OverviewScreen.tsx`, and `app/src/ui/screens/SettingsScreen.tsx`
- [X] T016 [US1] Implement app-level route wiring for all committed destinations in `app/App.tsx`
- [X] T017 [US1] Implement core add/validate flow instrumentation hooks for usability timing capture in `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [X] T018 [US1] Implement committed verification raw-artifact emission for usability task runs in `app/scripts/lib/runCommittedVerification.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Understand System State and Recovery Options (Priority: P2)

**Goal**: Ensure explicit empty/loading/error/offline/membership-required feedback and standardized recovery actions across committed screens.

**Independent Test**: Force required states and verify explicit feedback plus standardized recovery actions render with no ambiguous dead-end UI.

### Tests for User Story 2

- [X] T019 [P] [US2] Extend state-visibility matrix test to include all required feedback states and destinations in `app/tests/ux/us3-state-visibility.spec.ts`
- [X] T020 [P] [US2] Add recovery-action contract test for `error/offline/membership-required` mappings in `app/tests/ux/usability-recovery-actions.spec.ts`
- [X] T021 [P] [US2] Add integration test for blocked-startup recovery messaging and actions in `app/tests/integration/usability-startup-recovery.spec.ts`
- [X] T022 [P] [US2] Add integration test for membership-required recovery (`retry membership`, `sign out`) in `app/tests/integration/usability-membership-recovery.spec.ts`

### Implementation for User Story 2

- [X] T023 [US2] Implement feedback-state model updates (including membership-required state and recovery action metadata) in `app/src/ui/components/StateFeedback.tsx`
- [X] T024 [US2] Implement standardized membership/offline/reconnecting recovery model outputs in `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [X] T025 [US2] Render standardized state and recovery controls for blocked/offline/error conditions in `app/App.tsx`
- [X] T026 [US2] Implement committed screen model recovery-action propagation in `app/src/ui/screens/CommittedScreens.tsx`
- [X] T027 [US2] Add regression test to confirm state-recovery updates do not alter committed security invariants in `app/tests/security/usability-security-regression.spec.ts`

**Checkpoint**: User Stories 1 and 2 are independently functional with explicit state visibility and recovery behavior.

---

## Phase 5: User Story 3 - Keep UX Consistent Across Breakpoints and Input Modes (Priority: P3)

**Goal**: Enforce committed responsive breakpoint behavior and keyboard/pointer parity outcomes, then feed deterministic usability evidence into release decisions.

**Independent Test**: Execute committed UX scenarios at all viewport bands and compare keyboard/pointer outcomes for add/validate/offline-recovery flows.

### Tests for User Story 3

- [X] T028 [P] [US3] Expand responsive breakpoint coverage assertions for committed destinations in `app/tests/ux/us3-responsive-layout.spec.ts`
- [X] T029 [P] [US3] Expand MD3 mapping assertions to include committed screen-family requirements in `app/tests/ux/us3-md3-component-mapping.spec.ts`
- [X] T030 [P] [US3] Expand web input parity scenarios for add/validate/offline-recovery flows in `app/tests/ux/us3-input-parity.spec.ts`
- [X] T031 [P] [US3] Add desktop two-pane constraint test for primary controls reachable within two interactions and without horizontal scroll in `app/tests/ux/usability-desktop-two-pane.spec.ts`
- [X] T032 [P] [US3] Add contract and readiness-integration tests for SC-006/SC-007/SC-008 semantics in `app/tests/contract/ui-usability-evidence-contract.spec.ts` and `app/tests/integration/usability-readiness-blocking.spec.ts`

### Implementation for User Story 3

- [X] T033 [US3] Implement committed-screen MD3 mapping coverage updates for four destinations in `app/src/ui/screens/CommittedScreens.tsx`
- [X] T034 [US3] Implement desktop two-pane primary-task constraints and workspace guardrails in `app/src/ui/layout/DesktopWorkspace.tsx`
- [X] T035 [US3] Implement strict viewport-band resolution updates in `app/src/ui/layout/layoutModeResolver.ts`
- [X] T036 [US3] Implement deterministic keyboard/pointer outcome equivalence hashing for committed actions in `app/src/ui/web/interactionParity.ts`
- [X] T037 [US3] Implement SC-006/SC-007 usability evidence evaluation thresholds and summary generation in `app/scripts/lib/uiUsabilityEvaluation.ts` and `app/scripts/lib/uiUsabilityReport.ts`
- [X] T038 [US3] Integrate SC-008 release-blocking propagation into committed verification and release-readiness paths in `app/scripts/lib/runCommittedVerification.ts`, `app/scripts/lib/evidenceWriter.ts`, `app/scripts/lib/releaseReadinessRunner.ts`, and `app/scripts/verify-release-readiness.ts`

**Checkpoint**: All user stories are independently functional with responsive and parity compliance plus deterministic usability evidence flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize operational docs, artifact examples, and end-to-end verification references.

- [X] T039 [P] Update finalized feature operator flow and command matrix in `specs/005-ui-usability-alignment/quickstart.md`
- [X] T040 [P] Update evidence documentation for UI usability artifacts and release interpretation in `evidence/README.md`
- [X] T041 [P] Add sample usability task-run artifact in `evidence/sample-ui-usability/ui-usability-task-runs.json`
- [X] T042 [P] Add sample usability summary artifact in `evidence/sample-ui-usability/ui-usability-summary.json`
- [X] T043 [P] Add sample interpretation and remediation notes in `evidence/sample-ui-usability/README.md`
- [X] T044 Run full UI-usability regression command set and capture validation notes in `evidence/sample-ui-usability/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks all user stories
- User Stories (Phases 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on completion of User Stories 1-3

### User Story Dependencies

- User Story 1 (P1): Starts after Foundational; no dependency on other stories
- User Story 2 (P2): Starts after Foundational; integrates with US1 shell behavior but is independently testable
- User Story 3 (P3): Starts after Foundational; integrates with US1/US2 outputs but is independently testable

### Within Each User Story

- Write tests/checks first and verify failure
- Implement model/service/layout/runtime behavior
- Wire evidence/reporting where required
- Re-run story tests for independent validation

### Parallel Opportunities

- Phase 1: T002-T004 can run in parallel after T001
- Phase 2: T006-T009 can run in parallel after T005
- US1: T011-T014 can run in parallel
- US2: T019-T022 can run in parallel
- US3: T028-T032 can run in parallel
- Polish: T039-T043 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "T011 Add runtime usability contract test in app/tests/contract/ui-runtime-usability-contract.spec.ts"
Task: "T012 Add committed navigation reachability integration test in app/tests/integration/usability-core-flow-navigation.spec.ts"
Task: "T013 Add explicit action-language UX test in app/tests/ux/usability-action-language.spec.ts"
Task: "T014 Add SC-006 usability-threshold UX test in app/tests/ux/usability-task-threshold.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T019 Extend state visibility matrix test in app/tests/ux/us3-state-visibility.spec.ts"
Task: "T020 Add recovery-action contract test in app/tests/ux/usability-recovery-actions.spec.ts"
Task: "T021 Add blocked-startup recovery integration test in app/tests/integration/usability-startup-recovery.spec.ts"
Task: "T022 Add membership-required recovery integration test in app/tests/integration/usability-membership-recovery.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T028 Expand responsive coverage test in app/tests/ux/us3-responsive-layout.spec.ts"
Task: "T029 Expand MD3 mapping coverage test in app/tests/ux/us3-md3-component-mapping.spec.ts"
Task: "T030 Expand input parity test in app/tests/ux/us3-input-parity.spec.ts"
Task: "T031 Add desktop two-pane constraint UX test in app/tests/ux/usability-desktop-two-pane.spec.ts"
Task: "T032 Add usability evidence contract and readiness-integration tests in app/tests/contract/ui-usability-evidence-contract.spec.ts and app/tests/integration/usability-readiness-blocking.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate navigation reachability, explicit action language, and SC-006 threshold behavior
4. Demo committed core-flow usability alignment

### Incremental Delivery

1. Deliver Setup + Foundational
2. Add US1 committed core-flow usability
3. Add US2 state feedback and recovery-action standardization
4. Add US3 responsive/parity and usability evidence integration
5. Finalize docs and sample evidence artifacts

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. After Foundational:
   - Engineer A drives US1 navigation/core-flow usability
   - Engineer B drives US2 state feedback and recovery actions
   - Engineer C drives US3 responsive/parity and evidence integration
3. Merge by story checkpoints and run story-specific tests

---

## Constitution Compliance Check (Required Before `//speckit.implement`)

- [X] Principle I (Think Before Coding): clarified scope and recovery/evidence decisions are mapped directly to story tasks.
- [X] Principle II (Simplicity First): tasks are limited to committed UI usability alignment with no optional/exploratory expansion.
- [X] Principle III (Surgical Changes): planned edits target existing UI/layout/parity/runtime/evidence paths and related tests/docs only.
- [X] Principle IV (Goal-Driven Verification): each story includes deterministic tests or evidence checks before implementation tasks.
- [X] Principle V (Contract and Reliability Invariants): role model, household isolation, and replay-safety invariants remain preserved.

---

## Notes

- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (US1)
- Total tasks: 44
- Task count by story: US1 = 8, US2 = 9, US3 = 11
- Non-story tasks: 16
- All tasks follow required checklist format: checkbox, task ID, optional `[P]`, required `[US#]` in story phases, and explicit file path
