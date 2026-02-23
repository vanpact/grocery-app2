# Feature Specification: Grocery App End-to-End Runnable Baseline

**Feature Branch**: `002-run-app-e2e`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "Make the app runnable end-to-end."

## Clarifications

### Session 2026-02-23

- Q: Which dependency source should runnable mode use (local emulators, staging/online, or mocks)? → A: Use an online Firebase database (no mocks/local DB emulators) and provide setup scripts to prepare required data structures.
- Q: Should runnable mode support one or multiple online database environments? → A: Support multiple online Firebase projects, with a dedicated non-production project as the default.
- Q: Should setup scripts reset data by default or remain non-destructive? → A: Default to non-destructive add/update behavior, with a separate explicit reset mode.
- Q: How should test auth accounts be prepared for runnable verification? → A: Setup scripts validate required accounts and create missing ones only in an explicit account-provision mode.
- Q: Should full committed verification run automatically at startup? → A: Startup runs quick health checks; full committed verification runs only by explicit command.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Launch and Complete Core Flow Locally (Priority: P1)

As a product tester, I can start the app in a local runtime and complete sign-in, add, validate, and active-shopping viewing in one session.

**Why this priority**: If the core flow is not runnable, the project cannot be demonstrated or validated as a product.

**Independent Test**: Start the local runtime from a clean checkout, sign in with a valid household account, add and validate an item, and confirm the item appears in active shopping after restart.

**Acceptance Scenarios**:

1. **Given** a clean local environment, **When** the tester runs the documented startup path, **Then** the app reaches an interactive home workspace without manual code edits.
2. **Given** an authenticated household session, **When** the tester adds and validates an item, **Then** the item appears in active shopping and remains visible after app restart.

---

### User Story 2 - Recover Correctly Through Offline and Reconnect (Priority: P2)

As a household user, I can continue committed actions while disconnected and recover correctly when connectivity returns.

**Why this priority**: End-to-end runnable status is incomplete if real user recovery paths are not demonstrably stable.

**Independent Test**: During an active session, perform add/validate actions while disconnected, reconnect, and verify replay completes with no net duplicate effects.

**Acceptance Scenarios**:

1. **Given** a connected authenticated session, **When** connectivity is lost and user actions are queued, **Then** the app keeps the session usable with explicit offline state messaging.
2. **Given** queued actions created offline, **When** connectivity returns, **Then** queued actions replay in order with no data loss and no duplicate net effect.

---

### User Story 3 - Execute Runnable Verification and Evidence Path (Priority: P3)

As a release reviewer, I can run a single verification path and obtain pass/fail evidence for committed behavior and security boundaries.

**Why this priority**: A runnable product must have an operator-ready validation path that supports release decisions.

**Independent Test**: Execute the documented verification run, including allow/deny security checks and UX/state checks, and produce a complete evidence bundle.

**Acceptance Scenarios**:

1. **Given** a running local runtime, **When** the reviewer executes the verification sequence, **Then** each committed rule reports deterministic pass/fail output.
2. **Given** an unauthorized action attempt, **When** the reviewer runs the security checks, **Then** the action is denied and the result is included in evidence artifacts.

### Edge Cases

- Online database service unavailable at startup.
- Online database project misconfigured for current app credentials.
- Production project selected unintentionally for local runnable setup.
- Setup scripts run with reset mode unintentionally.
- Required test auth accounts missing at runtime.
- Authentication succeeds but household membership resolution fails.
- Reconnect replay interrupted after partial success.
- Local cache contains stale queued actions from a prior run.
- Startup quick checks pass but full verification has not yet been executed.
- Verification run is interrupted mid-execution.
- Optional feature path is configured but not gate-approved.

## Operational Definitions

- **Clean Checkout Prerequisites**: Repository is freshly checked out, documented local toolchain is installed, at least one Android execution target is available (running emulator or connected phone), network connectivity is available, and operator credentials are available for the selected Firebase project.
- **Startup Entrypoint**: A single documented startup command path launched from repository root, defaulting to the dedicated non-production project when no explicit target is provided.
- **Interactive Home Workspace**: App state where (1) user is authenticated, (2) household membership is resolved, (3) home route is visible, and (4) add-item, validate-item, and active-shopping views are reachable without a blocking startup error.
- **Quick Health Checks**: Startup checks limited to environment readiness only: project reachability, required verification account readiness, and Android execution target availability.
- **Non-Default Target Confirmation Token**: Exact, case-sensitive input `TARGET:<target_id>:CONFIRM`, where `<target_id>` must equal the selected target identifier.
- **Reset Confirmation Token**: Exact, case-sensitive input `RESET:<target_id>:CONFIRM`, where `<target_id>` must equal the selected reset target identifier.
- **Required Verification Auth Accounts**:
  1. `owner_primary`: owner role in `household_alpha`.
  2. `member_primary`: member role in `household_alpha`.
  3. `outsider_primary`: member role in `household_beta` for cross-household deny verification.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a documented startup path from a clean checkout that includes clean-checkout prerequisites, a single startup entrypoint, and readiness output containing selected target, account-readiness status, quick-check result summary, and final startup status.
- **FR-002**: System MUST support authenticated session entry for a valid household account in local runnable mode.
- **FR-003**: System MUST block household operations when membership cannot be resolved and provide clear recovery actions.
- **FR-004**: System MUST allow item add, validate, and active-shopping viewing in one continuous local session.
- **FR-005**: System MUST persist committed user actions across app restart in local runnable mode.
- **FR-006**: System MUST support queued committed actions during disconnection with explicit offline status visibility.
- **FR-007**: System MUST replay queued actions in deterministic order after reconnect.
- **FR-008**: System MUST prevent duplicate net effects when replaying previously queued actions.
- **FR-009**: System MUST enforce role-bound and household-bound authorization during runnable verification checks.
- **FR-010**: System MUST deny unauthorized transitions and cross-household access attempts in runnable mode.
- **FR-011**: System MUST provide a documented verification run path that can be executed by a reviewer without code modification.
- **FR-012**: System MUST emit deterministic pass/fail results for committed verification rules.
- **FR-013**: System MUST generate evidence artifacts for each verification run, including decision inputs and outcomes.
- **FR-014**: System MUST run as an Android app on both a physical phone and a local Android emulator for committed baseline flows.
- **FR-015**: Optional behavior MUST remain disabled unless explicitly approved through gate decision and owner authorization.
- **FR-016**: Runnable mode MUST connect to an online Firebase database project rather than a mock or local database emulator.
- **FR-017**: System MUST provide setup scripts that prepare required online database structures and baseline fixture data for runnable verification.
- **FR-018**: Setup scripts MUST be repeatable so reruns do not produce duplicate baseline fixtures.
- **FR-019**: System MUST support multiple online Firebase project targets while defaulting startup and setup scripts to a dedicated non-production project.
- **FR-020**: System MUST require explicit operator confirmation before allowing setup scripts to target any non-default project, and confirmation input MUST exactly match the Non-Default Target Confirmation Token.
- **FR-021**: Setup scripts MUST run in non-destructive add/update mode by default and MUST provide reset behavior only through an explicit reset mode.
- **FR-022**: Reset mode MUST require explicit operator confirmation input that exactly matches the Reset Confirmation Token before destructive actions execute, and reset actions MUST be limited to baseline verification fixtures and verification auth accounts for the selected non-production target.
- **FR-023**: Setup scripts MUST validate presence of required verification auth accounts (`owner_primary`, `member_primary`, `outsider_primary`) and their required role/household mapping before runnable verification starts.
- **FR-024**: Creation of missing verification auth accounts MUST occur only in an explicit account-provision mode.
- **FR-025**: Startup MUST execute quick health checks (project reachability, verification-account readiness, Android execution target availability) and report environment readiness without running the full committed verification suite.
- **FR-026**: Full committed verification MUST execute only through an explicit operator command and MUST run the committed verification suite as a separate path from startup quick checks.
- **FR-027**: If startup detects queued local actions from a prior run, system MUST report queue count and oldest queued timestamp before write operations begin.
- **FR-028**: If startup detects queued local actions older than 24 hours, system MUST block new write operations until queued actions are either replayed successfully or explicitly discarded.

### Key Entities *(include if feature involves data)*

- **Runtime Session**: A single authenticated user run containing startup state, household context, and active route state.
- **Queued Action**: A user action captured while disconnected, including order, identity, and replay status.
- **Verification Run**: A bounded execution of committed checks producing deterministic pass/fail outputs.
- **Evidence Bundle**: Structured verification artifacts for a release decision, including results, approvals, and audit metadata.
- **Gate Decision**: Owner-approved decision that controls whether optional behavior is allowed in a runnable environment.

### Assumptions

- Operator has access to an online Firebase project intended for runnable validation.
- A dedicated non-production Firebase project exists and is the default runnable target.
- Test accounts and household fixtures are available for local verification runs.
- Operators can supply account-provision credentials when explicit account-provision mode is used.
- Committed baseline behavior remains the authoritative scope for runnable validation.

### Out of Scope

- Net-new product features outside committed baseline behavior.
- Production deployment hardening, scaling, or traffic migration.
- Optional feature expansion beyond gate-controlled verification.
- Browser-target support for this runnable phase.
- Automatic execution against production Firebase projects.
- Implicit creation of auth accounts during default setup execution.

## Constitution Alignment *(mandatory)*

- **CA-001**: Assumptions and scope boundaries are explicit through the Assumptions and Out of Scope sections.
- **CA-002**: Scope is limited to runnable end-to-end execution of committed baseline behavior.
- **CA-003**: This spec references and applies canonical ownership from `specs/00-product-spec.md`, `specs/10-roadmap-and-gates.md`, `specs/20-architecture-contracts.md`, and `specs/30-backlog-and-validation.md` without redefining their ownership.
- **CA-004**: Deterministic verification expectations are explicit through requirements for pass/fail outputs and evidence bundles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a clean checkout, a reviewer reaches the defined interactive home workspace within 15 minutes using only documented steps, and startup output includes selected target, account-readiness status, quick-check summary, and final startup status.
- **SC-002**: In 10 repeated local runs, at least 9 complete the core sign-in/add/validate/active-shopping flow without manual code edits.
- **SC-003**: Offline-reconnect verification completes with `data_loss_count = 0` and `duplicate_replay_count = 0` for committed flow scenarios.
- **SC-004**: Unauthorized transition and cross-household checks show 100% deny behavior for required deny cases in reviewer-run verification.
- **SC-005**: Each verification run generates a complete evidence bundle containing manifest, results, decision record, and approvals.
- **SC-006**: Committed baseline flow parity is demonstrated on both an Android phone and a local Android emulator in the same release candidate.
- **SC-007**: Across 5 consecutive default setup runs against the same non-production target, non-target records remain unchanged and duplicate baseline fixtures created per run equals `0`.
- **SC-008**: In 10 startup executions, account-readiness status is reported before runtime launch in 10/10 runs, and default setup mode performs `0` auth-account create operations.
- **SC-009**: Startup quick health checks complete in under 2 minutes in at least 9 of 10 runs, and full verification remains invokable only through a separate documented command path.
- **SC-010**: Optional module activation attempts without gate decision and required owner approvals are denied in 100% of verification runs.
