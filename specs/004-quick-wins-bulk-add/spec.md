# Feature Specification: Quick Wins Bulk Add Packs and Recipes

**Feature Branch**: `004-quick-wins-bulk-add`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Start the next feature after 003 using `//speckit.specify`."

## Clarifications

### Session 2026-02-24

- Q: Should pack/recipe templates be household-shared or member-private for GS-101? → A: Household-shared.
- Q: How should multiplier precision be handled for deterministic quantity outcomes? → A: Accept positive integers only (`1, 2, 3, ...`); reject fractional multipliers.
- Q: What is the required evidence workflow for `VR-CND-101-BULK-ADD-TIME`? → A: Local runs generate advisory timing evidence; CI is authoritative for gate decision recording.

## Scope

This feature covers only `GS-101` from `specs/30-backlog-and-validation.md`:
- Add packs/recipes with quantity multiplier for one-action multi-item insertion.
- Validate against gate `G-QW-01` and verification `VR-CND-101-BULK-ADD-TIME`.

It does not include `GS-102` (paste-text parsing) or `GS-105` (recurrence reminders).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Insert Pack/Recipe in One Action (Priority: P1)

As a shopper, I can apply a saved pack/recipe to the active list with one action so routine planning is faster than manual item-by-item entry.

**Why this priority**: This is the primary user value of `GS-101` and the core path for the quick-input milestone.

**Independent Test**: Apply one pack with a valid multiplier to an empty list and confirm all projected items are inserted with expected multiplied quantities.

**Acceptance Scenarios**:

1. **Given** a pack with base quantities and integer multiplier `m >= 1`, **When** the user applies it, **Then** each projected item quantity equals `base_quantity * m`.
2. **Given** a recipe projection preview, **When** the user cancels before confirm, **Then** no list mutation occurs.

---

### User Story 2 - Merge Projected Items Without Duplicate Rows (Priority: P2)

As a collaborator, I need bulk insertion to reuse existing dedup semantics so pack usage does not create duplicate rows for equivalent items.

**Why this priority**: Duplicate rows directly degrade list quality and violates GS-101 acceptance behavior.

**Independent Test**: Apply a pack whose projected items overlap existing list items and confirm outcomes reuse committed merge behavior instead of creating duplicate rows.

**Acceptance Scenarios**:

1. **Given** existing list items that match projected items by canonical dedup identity, **When** a pack is applied, **Then** the system merges quantities/status using existing committed dedup behavior.
2. **Given** projected items not present in the list, **When** a pack is applied, **Then** new rows are added exactly once.

---

### User Story 3 - Produce Gate Evidence for Quick-Input Decision (Priority: P3)

As a gate owner, I can evaluate deterministic timing evidence comparing baseline add flow vs quick-input flow before recording `G-QW-01`.

**Why this priority**: Quick wins are conditional; evidence is required to retain or cut feature scope.

**Independent Test**: Run scripted baseline and quick-input timing scenarios and verify evidence includes run set size and median-improvement calculation used by `VR-CND-101-BULK-ADD-TIME`.

**Acceptance Scenarios**:

1. **Given** a run set with `>= 10` scripted runs (`5 baseline + 5 quick`), **When** evidence is generated, **Then** median completion improvement is recorded deterministically.
2. **Given** gate evidence is incomplete or below threshold, **When** gate decision is evaluated, **Then** release scope records quick-input as cut for that cycle.

### Edge Cases

- Multiplier is `0`, negative, or non-numeric; operation must be rejected before any list mutation.
- Multiplier is fractional; operation must be rejected before any list mutation.
- Pack projection overlaps multiple existing list rows differing only by case/spacing; merge must follow canonical dedup identity and remain deterministic.
- User triggers bulk insert while offline and reconnect replay occurs; final state must not create duplicate projection effects.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to select a saved pack/recipe and apply a positive integer quantity multiplier before insertion.
- **FR-002**: The system MUST project item outcomes prior to commit and MUST allow explicit confirm or cancel.
- **FR-003**: For every projected item, final quantity MUST be derived deterministically from `base_quantity * multiplier`.
- **FR-004**: Pack/recipe insertion MUST reuse committed dedup merge behavior already defined for manual add flows.
- **FR-005**: Applying a pack/recipe MUST produce deterministic outcomes for inserted vs merged items and MUST not create duplicate rows for equivalent items.
- **FR-006**: Invalid multiplier (including fractional, zero, negative, or non-numeric) or malformed pack item input MUST fail closed and MUST not mutate list state.
- **FR-007**: The feature MUST generate timing evidence compatible with `VR-CND-101-BULK-ADD-TIME` requirements in `specs/00-product-spec.md`.
- **FR-008**: Gate evidence for this feature MUST be written to `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/` and include mandatory files from the canonical evidence contract.
- **FR-009**: If gate evidence does not satisfy `VR-CND-101-BULK-ADD-TIME`, feature decision for the release cycle MUST follow gate fail action (cut quick-input features).
- **FR-010**: This feature MUST not weaken committed security invariants or role boundaries from `specs/00-product-spec.md`.
- **FR-011**: Pack/recipe templates for this feature MUST be household-shared so collaborators evaluate and apply the same template set.

### Key Entities *(include if feature involves data)*

- **Pack/Recipe Template**: Reusable collection of item lines with base quantities used for quick insertion.
- **Projection Item**: Computed candidate item containing normalized identity and multiplied quantity prior to commit.
- **Bulk Add Outcome Set**: Deterministic record of inserted and merged items from one apply action.
- **Quick-Input Timing Run**: One measured execution of baseline or quick-input flow used in median-improvement evidence.
- **Gate Evidence Bundle (`EV-QW-BULK-ADD`)**: Release-scoped artifact set proving quick-input timing and decision rationale for `G-QW-01`.

### Assumptions

- Existing committed add flow and dedup behavior are already stable and remain the baseline comparator.
- Pack/recipe capability remains conditional and gate-controlled, with fail action defined in `specs/10-roadmap-and-gates.md`.
- Gate owner approvals for `G-QW-01` remain `Product Owner` and `Engineering Lead`.

### Clarification Outcome

- All ambiguities identified in `//speckit.specify` (`AQ-001` to `AQ-003`) are resolved in `Clarifications`.
- No open clarification blockers remain for `//speckit.plan`.

### Dependencies

- Verification rule and deterministic threshold definitions in `specs/00-product-spec.md` (`VR-CND-101-BULK-ADD-TIME`).
- Gate registry, evidence path, and fail-action policy in `specs/10-roadmap-and-gates.md` (`G-QW-01`, `EV-QW-BULK-ADD`).
- Story acceptance and milestone mapping in `specs/30-backlog-and-validation.md` (`GS-101`, M1.1).
- Architecture contracts for unchanged committed behavior boundaries in `specs/20-architecture-contracts.md`.

### Out of Scope

- Paste-text parsing and correction workflow (`GS-102`).
- Recurrence reminders (`GS-105`).
- Suggestion, aisle personalization, OCR, voice, forecasting, export/import, and buyer-role tracks.
- Redefining canonical committed verification rules or gate ownership vocabularies.

## Constitution Alignment *(mandatory)*

- **CA-001**: Assumptions and clarification decisions are explicit in `Assumptions` and `Clarifications`.
- **CA-002**: Scope is minimal to `GS-101` and explicitly excludes adjacent M1.1 stories and later milestones.
- **CA-003**: Canonical ownership is preserved by referencing `specs/00`, `specs/10`, `specs/20`, and `specs/30` without redefining them.
- **CA-004**: Deterministic verification expectations are explicit through FR-003 to FR-009 and `VR-CND-101-BULK-ADD-TIME` evidence requirements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance test fixtures for `GS-101`, 100% of projected item quantities match deterministic multiplier calculation.
- **SC-002**: In deterministic overlap scenarios, duplicate row creation rate for equivalent items is 0%.
- **SC-003**: Timing evidence includes at least 10 scripted runs (`5 baseline + 5 quick`) and computes a reproducible median-improvement metric.
- **SC-004**: `VR-CND-101-BULK-ADD-TIME` pass condition is met only when median quick-input completion time improvement is `>= 25%` vs baseline.
- **SC-005**: If SC-004 is not met, release decision records quick-input as cut for that cycle and committed baseline behavior remains unaffected.
