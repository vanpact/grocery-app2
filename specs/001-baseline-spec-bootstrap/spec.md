# Feature Specification: Grocery App Committed Baseline Plan Bootstrap

**Feature Branch**: `001-baseline-spec-bootstrap`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "Bootstrap baseline planning feature from existing grocery app canonical specs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Core Household Shopping Reliably (Priority: P1)

As a household user, I can sign in, add items, validate items, continue offline, and recover after reconnect without data loss or net duplicate effects.

**Why this priority**: This is the committed finished-product baseline path and must be releasable without optional modules.

**Independent Test**: Execute `FT-1 Core Shopping Reliability` plus `GS-010` baseline flow checks.

**Acceptance Scenarios**:

1. **Given** authenticated household context, **When** duplicate items are added across lists, **Then** dedup merge rules produce one merged row per dedup key.
2. **Given** offline mode during add/validate actions, **When** network returns, **Then** queued mutations replay with `data_loss_count = 0` and `duplicate_replay_count = 0`.

---

### User Story 2 - Enforce Role-Safe Collaboration (Priority: P2)

As a collaborator, I can perform only actions allowed by my role, and blocked actions are denied deterministically.

**Why this priority**: Role transition enforcement is a release-blocking security rule.

**Independent Test**: Execute emulator allow/deny suite mapped to `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` and `FT-2 Collaboration and Security`.

**Acceptance Scenarios**:

1. **Given** a `suggest` user, **When** they attempt `suggested -> validated`, **Then** the action is denied.
2. **Given** a `validate` user, **When** they perform validator transitions (`suggested -> validated`, `validated -> bought`, `bought -> validated`), **Then** actions succeed and are logged.

---

### User Story 3 - Preserve Cross-Platform UX Reliability (Priority: P3)

As a user on Android or Web, I can complete committed flows with clear state feedback and responsive layouts.

**Why this priority**: Required UX verification rules must pass for committed release.

**Independent Test**: Execute `FT-UX-ANDROID-M3E`, `FT-UX-WEB-600-839`, `FT-UX-WEB-MID-RANGE-840-1199`, and `FT-UX-WEB-DESKTOP-2PANE`.

**Acceptance Scenarios**:

1. **Given** empty/loading/error/offline conditions, **When** core screens render, **Then** explicit state feedback appears with no silent failure.
2. **Given** keyboard-only and pointer interactions on web, **When** the same scripted add/validate/offline-recovery flow is executed, **Then** persisted item states and emitted committed event types are identical.

### Edge Cases

- Network drop during a sequence of queued item mutations.
- Concurrent adds of equivalent items from multiple users/lists.
- Unauthorized validator transition attempts from `suggest` role.
- Cross-household read or write attempts by authenticated users.
- Active Shopping aggregation receiving mixed lifecycle states.
- Optional feature gate marked `cut` and fallback path activation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users with Firebase Auth and resolve household membership before list operations.
- **FR-002**: System MUST enforce committed role set `suggest` and `validate` with deny-by-default policy.
- **FR-003**: System MUST enforce canonical lifecycle states (`draft`, `suggested`, `validated`, `bought`) and authorized transition rules.
- **FR-004**: System MUST provide multiple lists and a unified Active Shopping view including only `validated` items.
- **FR-005**: System MUST apply normalized dedup key merge-on-add behavior for item writes.
- **FR-006**: System MUST preserve offline mutation intent and replay safely on reconnect.
- **FR-007**: System MUST enforce strict household isolation for reads and writes.
- **FR-008**: System MUST log committed event coverage (`add`, `merge`, `validate`, `toggle`, `undo`, `error_retry`).
- **FR-009**: System MUST render required empty/loading/error/offline states across committed screens.
- **FR-010**: System MUST satisfy Material 3 Expressive mapping and responsive breakpoint contracts on Android and Web.
- **FR-011**: Optional modules MUST remain gate-controlled and fail-closed without breaking committed flows.
- **FR-012**: Release readiness MUST depend on passing committed verification rules, including mandatory `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.

### Key Entities *(include if feature involves data)*

- **Household**: Collaboration boundary with metadata and lifecycle timestamps.
- **Membership**: Household-user role binding with role in `suggest | validate`.
- **Store**: Household-scoped aisle ordering configuration.
- **List**: Shopping/planning container with type, recurrence, and optional store binding.
- **Item**: List-scoped grocery line with normalized name, dedup metadata, lifecycle status, and actor references.
- **Event**: Immutable household-scoped action record used for diagnostics and verification evidence.

## Constitution Alignment *(mandatory)*

- **CA-001**: Assumptions are explicit: this feature bootstraps a plan from canonical baseline docs, not a net-new product direction.
- **CA-002**: Scope is minimal: committed baseline planning artifacts only; optional modules remain gate-controlled and non-blocking.
- **CA-003**: Canonical ownership is preserved across `specs/00`, `specs/10`, `specs/20`, and `specs/30`; this spec references and consolidates without redefining ownership.
- **CA-004**: Deterministic verification references are explicit through `VR-COM-*` rules and required field-test scenarios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `VR-COM-001-OFFLINE-REPLAY` passes with `data_loss_count = 0` and `duplicate_replay_count = 0`.
- **SC-002**: `VR-COM-002-DEDUP-KEY-COLLISION` passes with one merged row for identical dedup-key adds.
- **SC-003**: `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` passes for all required allow/deny cases.
- **SC-004**: `VR-COM-004-ACTIVE-SHOPPING-FILTER` passes with Active Shopping showing only `validated` items.
- **SC-005**: `VR-COM-005-STATE-VISIBILITY` and `VR-COM-008-M3E-COMPONENT-MAPPING` pass across committed screens.
- **SC-006**: `VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE` and `VR-COM-010-INPUT-PARITY-WEB` pass at all required web breakpoints.
