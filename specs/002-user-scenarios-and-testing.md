# 002 User Scenarios and Testing

Parsed from the Spec Kit `spec-template.md` User Scenarios & Testing section.

## Source Mapping

- `specs/00-product-spec.md`
- `specs/20-architecture-contracts.md`
- `specs/30-backlog-and-validation.md`

## User Story 1 - Complete a Reliable Household Shopping Cycle (Priority: P1)

As a household shopper, I need to add and validate grocery items, continue while offline, and
resync safely so shopping remains reliable under real in-store conditions.

**Why this priority**: This is the committed finished-product baseline path.

**Independent Test**: `FT-1 Core Shopping Reliability` plus committed baseline flow in `GS-010`.

**Acceptance Scenarios**:

1. **Given** a valid household and mixed item inputs, **When** duplicate items are added, **Then** the list retains one merged item per dedup key.
2. **Given** the client is offline, **When** add/validate actions are queued and network returns, **Then** intended state is restored with no data loss and no duplicate replay effects.

---

## User Story 2 - Enforce Secure Collaboration by Role (Priority: P2)

As a household collaborator, I need role-gated state transitions so only authorized users can
perform validator-only actions.

**Why this priority**: Security policy is release-blocking for committed scope.

**Independent Test**: `FT-2 Collaboration and Security` with emulator allow/deny suite.

**Acceptance Scenarios**:

1. **Given** a `suggest` user, **When** they attempt `suggested -> validated`, **Then** the action is denied.
2. **Given** a `validate` user, **When** they perform committed validator transitions, **Then** transitions succeed and are logged.

---

## User Story 3 - Preserve UX Reliability Across Android and Web (Priority: P3)

As a household user, I need explicit state feedback and predictable interactions across Android and
responsive web breakpoints so core actions remain usable.

**Why this priority**: Committed UX verification rules are required for release readiness.

**Independent Test**: `FT-UX-ANDROID-M3E`, `FT-UX-WEB-600-839`, `FT-UX-WEB-MID-RANGE-840-1199`,
and `FT-UX-WEB-DESKTOP-2PANE`.

**Acceptance Scenarios**:

1. **Given** a core screen enters empty/loading/error/offline state, **When** the state occurs, **Then** explicit feedback is rendered with no silent failure.
2. **Given** equivalent shopping actions on touch, keyboard, and pointer paths, **When** flows complete, **Then** persisted state outcomes are equivalent.

## Edge Cases

- Network drops during queued mutations and reconnect happens after multiple pending writes.
- Two users add equivalent items with the same dedup key from different lists.
- `suggest` users attempt validator-only lifecycle transitions.
- Cross-household read or write attempts are made by authenticated users.
- Active Shopping view receives mixed `draft`, `suggested`, `validated`, and `bought` items.
- Desktop (`>=1200`) layout drifts into unsupported secondary pane content or full edit behavior.
- Optional module gate is `cut` and fallback path must activate immediately.
- Offline indicator or error state is missing while operations continue.
