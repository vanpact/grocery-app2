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
- Concurrent edits of the same item with stale version writes.
- Unauthorized validator transition attempts from `suggest` role.
- Cross-household read or write attempts by authenticated users.
- Auth success with missing household membership.
- Active Shopping aggregation receiving mixed lifecycle states.
- Replay interruption after partial mutation apply during reconnect.
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
- **FR-013**: If authentication succeeds but household membership cannot be resolved, system MUST block list/item/event operations, emit `membership_required`, and provide retry and sign-out recovery actions.
- **FR-014**: Only authenticated household members with role `suggest` or `validate` MAY initiate lifecycle mutations; service/system automation MUST NOT bypass role or household checks.
- **FR-015**: Transition evaluation MUST return explicit outcomes (`allowed`, `transition_not_allowed`, `household_mismatch`, `noop`), and `noop` outcomes MUST NOT mutate state or version.
- **FR-016**: Active Shopping MUST include only `validated` items, exclude `draft|suggested|bought`, and sort deterministically by `aisleKey` then `nameSlug`.
- **FR-017**: Offline replay MUST process queued mutations in FIFO order per household, enforce idempotency by stable `mutationId`, and increment duplicate replay telemetry when duplicates are ignored.
- **FR-018**: During replay partial failure, successful mutations MUST remain committed, the failed mutation MUST be retained with retry metadata, and later queued mutations MUST NOT execute out of order.
- **FR-019**: Household isolation MUST apply to document reads/writes, aggregate queries, and event-stream subscriptions.
- **FR-020**: Concurrent item mutations MUST use version checks; stale-version writes MUST be denied with `version_conflict` and client retry guidance.
- **FR-021**: Optional modules MUST only activate when both feature flag is enabled and gate decision is `pass`; each optional gate MUST declare accountable owner(s).
- **FR-022**: Committed online add/validate interactions MUST meet `p95 <= 300ms`, and route transition render completion MUST meet `<= 500ms` on reference devices.
- **FR-023**: Accessibility requirements MUST include keyboard-only completion on web, visible focus indicators on interactive controls, and screen-reader labels for core committed actions.
- **FR-024**: Navigation stability MUST preserve route identity and unsent mutation queue across foreground/background transitions for offline periods up to 30 minutes.
- **FR-025**: Dependency assumptions MUST define degraded mode for Firebase outage: queue-only local intent capture, explicit outage state visibility, and deferred verification execution.
- **FR-026**: Security-rule maintenance and verification evidence ownership MUST be explicitly assigned per committed verification rule.

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
- **SC-007**: `VR-COM-011-AUTH-MEMBERSHIP-FAILURE-HANDLING` passes with operation deny behavior and explicit `membership_required` recovery state.
- **SC-008**: `VR-COM-012-TRANSITION-OUTCOME-SEMANTICS` passes for `allowed`, `transition_not_allowed`, `household_mismatch`, and `noop` outcomes.
- **SC-009**: `VR-COM-013-ACTIVE-SHOPPING-ORDERING` passes with deterministic ordering (`aisleKey`, `nameSlug`) and strict status exclusions.
- **SC-010**: `VR-COM-014-REPLAY-ORDER-IDEMPOTENCY` passes with FIFO replay and duplicate suppression by `mutationId`.
- **SC-011**: `VR-COM-015-REPLAY-PARTIAL-FAILURE-RECOVERY` passes with committed-success retention and ordered retry resume.
- **SC-012**: `VR-COM-016-HOUSEHOLD-ISOLATION-QUERY-SURFACES` passes for documents, aggregates, and event streams.
- **SC-013**: `VR-COM-017-OPTIONAL-GATE-ACTIVATION-OWNERSHIP` passes with gate-owner declaration and activation only on `pass`.
- **SC-014**: `VR-COM-018-CONCURRENT-EDIT-CONFLICT-POLICY` passes with stale-version denial and retry path.
- **SC-015**: `VR-COM-019-LATENCY-RESPONSIVENESS-THRESHOLDS` passes with `p95` action and route transition budgets.
- **SC-016**: `VR-COM-020-ACCESSIBILITY-BASELINE` passes for keyboard completion, focus visibility, and screen-reader labels.
- **SC-017**: `VR-COM-021-NAV-LIFECYCLE-STABILITY` passes with preserved route and queue state through lifecycle transitions.
- **SC-018**: `VR-COM-022-DEPENDENCY-DEGRADED-MODE` passes with outage state, local queue capture, and deferred verification handling.
- **SC-019**: `VR-COM-023-ACTOR-SCOPE-ENFORCEMENT` passes with no role/household bypass for service/system actors.
