# Tasks: Cross-Platform UX/UI Refresh

**Input**: Design documents from `/specs/006-ux-ui-refresh/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test and verification tasks for UI behavior, responsive layout, accessibility, parity, and release-evidence paths.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare deterministic fixtures and helper inputs reused across all UX refresh stories.

- [x] T001 Create refreshed usability timing fixture set in `app/tests/fixtures/usability/ui-refresh-task-runs.json`
- [x] T002 [P] Create web evidence scenario fixture for `playwright` captures in `app/tests/fixtures/usability/ui-refresh-playwright-scenarios.json`
- [x] T003 [P] Create android evidence scenario fixture for `mobile-mcp` captures in `app/tests/fixtures/usability/ui-refresh-mobile-scenarios.json`
- [x] T004 [P] Create primary-action recognition fixture (`<=5s`) in `app/tests/fixtures/usability/ui-refresh-action-recognition.json`
- [x] T005 [P] Create mis-tap event fixture (`<5%`) in `app/tests/fixtures/usability/ui-refresh-mistap-events.json`
- [x] T006 [P] Create clarity-feedback fixture (`>=4.0/5`) in `app/tests/fixtures/usability/ui-refresh-clarity-feedback.json`
- [x] T007 [P] Extend usability fixture loader helpers for refresh artifacts in `app/tests/helpers/usability.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish runtime and evidence foundations required before user-story implementation.

**CRITICAL**: No user story work begins before this phase is complete.

- [x] T008 Define refreshed UI runtime contracts (`navigationPattern`, `layoutMode`, `secondaryPaneMode`, viewport matrix) in `app/src/runtime/contracts.ts`
- [x] T009 [P] Add tool-evidence ingestion and validation primitives in `app/scripts/lib/uiUsabilityEvaluation.ts`
- [x] T010 [P] Add SC summary output schema (`SC-001..SC-007`) and reason-code mapping in `app/scripts/lib/uiUsabilityReport.ts`
- [x] T011 [P] Enforce required refresh evidence artifacts (including paired before/after indexes) in committed verification flow in `app/scripts/lib/runCommittedVerification.ts`
- [x] T012 [P] Integrate refresh evidence failure propagation (`SC-001/002/003/004/005/006/007`) into readiness evaluation in `app/scripts/lib/releaseReadinessRunner.ts`
- [x] T013 [P] Update evidence writer support for refresh raw-data artifact filenames in `app/scripts/lib/evidenceWriter.ts`
- [x] T014 [P] Align runtime/evidence contract test baselines with refresh contracts in `app/tests/contract/ui-runtime-usability-contract.spec.ts` and `app/tests/contract/ui-usability-evidence-contract.spec.ts`
- [x] T015 Add before/after evidence pairing assertions to contract tests in `app/tests/contract/ui-usability-evidence-contract.spec.ts`

**Checkpoint**: Foundation ready; story phases can start.

---

## Phase 3: User Story 1 - Fast, Clear Shopping Actions (Priority: P1)

**Goal**: Make Active Shopping and core action hierarchy immediately understandable and low-friction on web and android.

**Independent Test**: Open Active Shopping on web and android, complete add + validate in one uninterrupted flow, and confirm users choose the primary action on first attempt.

### Tests for User Story 1

- [x] T016 [P] [US1] Extend action-language hierarchy checks in `app/tests/ux/usability-action-language.spec.ts`
- [x] T017 [P] [US1] Add add/validate sequence assertions for core shopping flow in `app/tests/integration/usability-core-flow-navigation.spec.ts`
- [x] T018 [P] [US1] Add primary-action recognition threshold assertions (`<=5s`) in `app/tests/ux/usability-action-recognition-threshold.spec.ts`
- [x] T019 [P] [US1] Add mis-tap rate assertions (`<5%`) for top controls in `app/tests/ux/usability-mistap-rate.spec.ts`
- [x] T020 [P] [US1] Add refreshed timing-threshold assertions for core add+validate flow (`SC-002`) in `app/tests/ux/usability-task-threshold.spec.ts`
- [x] T054 [P] [US1] Add empty/long/partially-synced list-state readability assertions in `app/tests/ux/usability-list-state-rendering.spec.ts`

### Implementation for User Story 1

- [x] T021 [US1] Implement clear primary-vs-secondary action grouping in `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [x] T022 [US1] Improve list-row readability and quantity scanability in `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [x] T023 [US1] Apply consistent heading/body/action visual hierarchy across committed screens in `app/src/ui/screens/SignInScreen.tsx`, `app/src/ui/screens/OverviewScreen.tsx`, and `app/src/ui/screens/SettingsScreen.tsx`
- [x] T024 [US1] Enforce non-overlapping, outcome-oriented action copy in `app/src/ui/screens/CommittedScreens.tsx` and `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [x] T025 [US1] Wire core-flow instrumentation for recognition, mis-tap, and timing summaries in `app/src/ui/screens/ActiveShoppingScreen.tsx` and `app/scripts/lib/uiUsabilityEvaluation.ts`
- [x] T055 [US1] Implement explicit empty/long/partially-synced list-state presentation rules in `app/src/ui/screens/ActiveShoppingScreen.tsx`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Consistent Navigation Across Screen Sizes (Priority: P2)

**Goal**: Keep navigation orientation stable on narrow and wide layouts, including wrapped top navigation at `<600` and two-pane desktop at `>=1200`.

**Independent Test**: Navigate Sign In, Active Shopping, Overview, and Settings on desktop and narrow layouts, confirming selected state visibility, wrapped top navigation, desktop two-pane context policy, and no initial-scroll control loss on defined mobile viewports.

### Tests for User Story 2

- [x] T026 [P] [US2] Extend responsive coverage for wrapped-top (`<600`) and two-pane (`>=1200`) behavior in `app/tests/ux/us3-responsive-layout.spec.ts`
- [x] T027 [P] [US2] Add context-only secondary pane assertions in `app/tests/ux/usability-desktop-two-pane.spec.ts`
- [x] T028 [P] [US2] Add cross-screen selected-destination persistence checks in `app/tests/integration/usability-core-flow-navigation.spec.ts`
- [x] T029 [P] [US2] Add viewport-matrix assertions (`360x640`, `390x844`, `412x915`) for no-initial-scroll key controls in `app/tests/ux/us3-responsive-layout.spec.ts`

### Implementation for User Story 2

- [x] T030 [US2] Implement wrapped top navigation behavior and selected-state clarity for narrow screens in `app/src/ui/screens/CommittedScreens.tsx`
- [x] T031 [US2] Implement explicit viewport-band mode resolution for single-pane vs two-pane layouts in `app/src/ui/layout/layoutModeResolver.ts`
- [x] T032 [US2] Implement two-pane desktop workspace composition at `>=1200` in `app/src/ui/layout/DesktopWorkspace.tsx`
- [x] T033 [US2] Enforce context-only secondary pane policy and primary-pane state-changing controls in `app/src/ui/layout/DesktopWorkspace.tsx` and `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [x] T034 [US2] Wire refreshed desktop workspace behavior through app shell routing in `app/App.tsx` and `app/src/ui/screens/CommittedScreens.tsx`

**Checkpoint**: User Stories 1 and 2 are independently functional and testable.

---

## Phase 5: User Story 3 - Trustworthy Status and Recovery Cues (Priority: P3)

**Goal**: Ensure status/recovery information is explicit and non-duplicative, with required accessibility and tool-evidence verification for refreshed screens.

**Independent Test**: Trigger status/retry paths from Sign In and Settings, verify clear action meaning, and confirm parity, accessibility, and tool evidence passes for all refreshed screens.

### Tests for User Story 3

- [x] T035 [P] [US3] Extend state visibility tests for non-duplicative status messaging in `app/tests/ux/us3-state-visibility.spec.ts`
- [x] T036 [P] [US3] Extend recovery-action clarity assertions in `app/tests/ux/usability-recovery-actions.spec.ts`
- [x] T037 [P] [US3] Extend keyboard/pointer parity assertions for `SC-005` in `app/tests/ux/us3-input-parity.spec.ts`
- [x] T038 [P] [US3] Extend accessibility baseline checks (focus, keyboard web traversal, scaling, touch targets) in `app/tests/ux/us3-accessibility-baseline.spec.ts`
- [x] T039 [P] [US3] Add readiness-blocking tests for missing `playwright`/`mobile-mcp` artifact indexes and failed `SC-004/SC-005/SC-006/SC-007` summaries in `app/tests/integration/usability-readiness-blocking.spec.ts`
- [x] T040 [P] [US3] Add security regression guard for unchanged role/household/replay invariants after status/recovery UI updates in `app/tests/security/usability-security-regression.spec.ts`

### Implementation for User Story 3

- [x] T041 [US3] Standardize status and recovery copy presentation across committed screens in `app/src/ui/components/StateFeedback.tsx` and `app/src/ui/screens/SignInScreen.tsx`
- [x] T042 [US3] Implement status-message de-duplication and recovery grouping in `app/src/ui/screens/SettingsScreen.tsx` and `app/src/ui/screens/OverviewScreen.tsx`
- [x] T043 [US3] Implement explicit control feedback states (idle, focused, pressed, disabled) in `app/src/ui/screens/ActiveShoppingScreen.tsx` and `app/src/ui/screens/CommittedScreens.tsx`
- [x] T044 [US3] Implement accessibility metadata and focus-order improvements across refreshed screens in `app/src/ui/screens/CommittedScreens.tsx` and `app/src/ui/screens/ActiveShoppingScreen.tsx`
- [x] T045 [US3] Ingest and validate `playwright` and `mobile-mcp` artifact index files plus before/after pairing index in `app/scripts/lib/uiUsabilityEvaluation.ts`
- [x] T046 [US3] Emit `SC-001/SC-002/SC-003/SC-004/SC-005/SC-006/SC-007` summaries and reason codes in `app/scripts/lib/uiUsabilityReport.ts` and `app/scripts/lib/runCommittedVerification.ts`
- [x] T047 [US3] Enforce `not_ready` on missing tool evidence or failed `SC-001/SC-002/SC-003/SC-004/SC-005/SC-006/SC-007` checks in `app/scripts/lib/releaseReadinessRunner.ts` and `app/scripts/verify-release-readiness.ts`

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, sample evidence artifacts, and verification runbook outputs.

- [x] T048 [P] Align operator runbook with paired before/after evidence workflow in `specs/006-ux-ui-refresh/quickstart.md`
- [x] T049 [P] Align runtime and evidence contract docs with implemented behavior in `specs/006-ux-ui-refresh/contracts/ui-runtime-refresh-contract.md` and `specs/006-ux-ui-refresh/contracts/ui-verification-evidence-contract.md`
- [x] T050 [P] Add sample web/mobile artifact index templates in `evidence/sample-ui-refresh/ui-refresh-playwright-artifacts.json` and `evidence/sample-ui-refresh/ui-refresh-mobile-mcp-artifacts.json`
- [x] T051 [P] Add sample before/after evidence index and summary templates in `evidence/sample-ui-refresh/ui-refresh-before-after-index.json` and `evidence/sample-ui-refresh/ui-refresh-before-after-summary.md`
- [x] T052 [P] Add sample accessibility, clarity, mis-tap, and timing summary templates in `evidence/sample-ui-refresh/ui-refresh-accessibility-summary.json`, `evidence/sample-ui-refresh/ui-refresh-clarity-summary.json`, `evidence/sample-ui-refresh/ui-refresh-mistap-summary.json`, and `evidence/sample-ui-refresh/ui-refresh-timing-summary.json`
- [x] T053 Run full UX refresh regression and readiness commands and capture run notes in `evidence/sample-ui-refresh/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup; blocks all story work
- User Stories (Phases 3-5): Depend on Foundational completion
- Polish (Phase 6): Depends on completion of User Stories 1-3

### User Story Dependencies

- User Story 1 (P1): Starts after Foundational; no dependency on other user stories
- User Story 2 (P2): Starts after Foundational; integrates with US1 shell outputs but remains independently testable
- User Story 3 (P3): Starts after Foundational; integrates with US1/US2 UI shell and evidence outputs but remains independently testable

### Within Each User Story

- Write tests/checks first and confirm they fail for missing behavior
- Implement UI/runtime/evidence behavior next
- Re-run story-specific tests and acceptance checks
- Move to the next priority only after story checkpoint passes

### Parallel Opportunities

- Phase 1: T002-T007 can run in parallel after T001
- Phase 2: T009-T014 can run in parallel after T008
- US1: T016-T020 and T054 can run in parallel
- US2: T026-T029 can run in parallel
- US3: T035-T040 can run in parallel
- Phase 6: T048-T052 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "T016 Extend action-language hierarchy checks in app/tests/ux/usability-action-language.spec.ts"
Task: "T017 Add add/validate sequence assertions in app/tests/integration/usability-core-flow-navigation.spec.ts"
Task: "T018 Add primary-action recognition threshold assertions in app/tests/ux/usability-action-recognition-threshold.spec.ts"
Task: "T019 Add mis-tap rate assertions in app/tests/ux/usability-mistap-rate.spec.ts"
Task: "T020 Add refreshed timing-threshold assertions in app/tests/ux/usability-task-threshold.spec.ts"
Task: "T054 Add empty/long/partially-synced list-state readability assertions in app/tests/ux/usability-list-state-rendering.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T026 Extend responsive coverage in app/tests/ux/us3-responsive-layout.spec.ts"
Task: "T027 Add context-only secondary pane assertions in app/tests/ux/usability-desktop-two-pane.spec.ts"
Task: "T028 Add selected-destination persistence checks in app/tests/integration/usability-core-flow-navigation.spec.ts"
Task: "T029 Add viewport-matrix no-initial-scroll assertions in app/tests/ux/us3-responsive-layout.spec.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T035 Extend state visibility tests in app/tests/ux/us3-state-visibility.spec.ts"
Task: "T036 Extend recovery-action clarity tests in app/tests/ux/usability-recovery-actions.spec.ts"
Task: "T037 Extend keyboard/pointer parity assertions in app/tests/ux/us3-input-parity.spec.ts"
Task: "T038 Extend accessibility baseline checks in app/tests/ux/us3-accessibility-baseline.spec.ts"
Task: "T039 Add readiness-blocking evidence tests in app/tests/integration/usability-readiness-blocking.spec.ts"
Task: "T040 Add security regression guard in app/tests/security/usability-security-regression.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate primary-action clarity, recognition (`SC-001`), mis-tap rate (`SC-003`), and add/validate flow timing (`SC-002`).
4. Demo refreshed core shopping usability on web and android.

### Incremental Delivery

1. Deliver Setup + Foundational.
2. Deliver US1 (core shopping action clarity + measurable core-flow outcomes).
3. Deliver US2 (navigation and responsive layout consistency).
4. Deliver US3 (state/recovery trust + parity + accessibility + tool evidence).
5. Finalize polish artifacts and runbook.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After Foundational:
   - Engineer A drives US1.
   - Engineer B drives US2.
   - Engineer C drives US3.
3. Merge by story checkpoints and rerun story-specific validations.

---

## Notes

- Suggested MVP scope: Phase 1 + Phase 2 + Phase 3 (US1)
- Total tasks: 55
- Task count by story: US1 = 12, US2 = 9, US3 = 13
- Non-story tasks: 21
- All tasks follow required checklist format: checkbox, task ID, optional `[P]`, required `[US#]` in story phases, and explicit file path
