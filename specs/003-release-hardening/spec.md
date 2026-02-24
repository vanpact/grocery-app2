# Feature Specification: Baseline Release Hardening

**Feature Branch**: `003-release-hardening`  
**Created**: 2026-02-23  
**Status**: Draft  
**Input**: User description: "Define baseline release hardening workflow covering committed gate execution, evidence bundle validation, owner approvals, and CI enforcement for final release readiness."

## Clarifications

### Session 2026-02-23

- Q: What should the release-readiness workflow treat as its authoritative committed verification input? → A: Consume pre-generated committed verification outputs/evidence artifacts only.
- Q: Where should the authoritative baseline release-readiness decision be produced? → A: CI is authoritative; manual runs are advisory previews.
- Q: How fresh must required owner approvals be to count for release readiness? → A: Within the last 24 hours.
- Q: What should be the default scope for the release-readiness workflow? → A: Committed scope only by default; optional scope must be explicitly requested.
- Q: When the authoritative CI run returns `not_ready`, what should happen to release publication? → A: Hard block release publication.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Final Release Readiness Check (Priority: P1)

As a release manager, I can run one release-readiness workflow that evaluates all committed product outcomes and returns a clear `ready` or `not_ready` decision.

**Why this priority**: This is the direct ship/no-ship control for the finished baseline product and blocks release if absent.

**Independent Test**: Execute the release-readiness workflow for a candidate release with committed verification outputs and confirm it returns a deterministic final decision with a complete result summary.

**Acceptance Scenarios**:

1. **Given** a release candidate with complete committed verification outputs, **When** the release-readiness workflow runs, **Then** it returns `ready` only if every committed verification rule passes.
2. **Given** any failed committed verification rule, **When** the release-readiness workflow runs, **Then** it returns `not_ready` and identifies failing verification IDs.

---

### User Story 2 - Validate Evidence and Approvals (Priority: P2)

As a gate owner, I can verify that required evidence artifacts and owner approvals are complete and valid before a release decision is accepted.

**Why this priority**: Missing or invalid evidence invalidates release decisions and weakens auditability.

**Independent Test**: Provide an evidence set with one missing mandatory artifact or missing owner approval and confirm the workflow rejects the release as `not_ready`.

**Acceptance Scenarios**:

1. **Given** an evidence bundle missing a mandatory artifact, **When** evidence validation runs, **Then** the release is marked `not_ready` with a missing-artifact reason.
2. **Given** a gate approval set that does not include all required owners, **When** approval validation runs, **Then** the release is marked `not_ready` with missing-owner details.

---

### User Story 3 - Confirm Field-Test Coverage Before Ship (Priority: P3)

As a quality operator, I can confirm that all committed field-test scenarios have current pass evidence tied to the candidate release.

**Why this priority**: Passing unit and contract checks alone is not enough; final confidence requires committed field-test coverage.

**Independent Test**: Run the workflow with one committed field-test scenario absent from evidence and confirm release readiness is blocked.

**Acceptance Scenarios**:

1. **Given** all committed field-test scenarios contain pass evidence for the release candidate, **When** field-test coverage validation runs, **Then** the workflow records full coverage and does not block readiness.
2. **Given** any committed field-test scenario is missing or failed, **When** field-test coverage validation runs, **Then** the workflow marks the release `not_ready` and lists the missing or failing scenario IDs.

### Edge Cases

- A verification result exists but uses a non-deterministic status expression; release validation must reject it as invalid evidence.
- Evidence files exist but reference a different release identifier than the candidate under review; validation must reject cross-release contamination.
- All tests pass but approvals are stale from an older decision timestamp; release validation must reject stale approvals.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide one baseline release-readiness workflow for committed-scope release decisions.
- **FR-002**: The workflow MUST evaluate every committed verification rule defined for baseline release readiness using pre-generated committed verification outputs and evidence artifacts for the candidate release, with each committed verification ID represented exactly once in the evaluated outcome set.
- **FR-003**: The workflow MUST return `ready` only when all committed verification outcomes are pass and deterministic.
- **FR-004**: The workflow MUST return `not_ready` when any committed verification outcome is fail, missing, duplicated, or non-deterministic.
- **FR-005**: The workflow MUST validate that each required evidence bundle contains all mandatory artifacts.
- **FR-006**: The workflow MUST validate that required approval owners are present for each gate decision and that approvals are no older than 24 hours at evaluation time (`freshness_hours <= 24` is valid, `freshness_hours > 24` is stale).
- **FR-007**: The workflow MUST reject evidence artifacts whose release identity does not match the candidate release under evaluation.
- **FR-008**: The workflow MUST validate committed field-test scenario coverage and block readiness when committed coverage is incomplete.
- **FR-009**: The workflow MUST produce a deterministic release report containing final status, failing checks, and required follow-up actions, with stable ordering of every issue list for identical input data.
- **FR-010**: The workflow MUST fail closed: missing inputs, malformed evidence, unresolved approvals, or unresolved canonical-source references MUST produce `not_ready`.
- **FR-011**: The workflow MUST default to committed-only validation scope and preserve optional-feature behavior as non-blocking unless optional gates are explicitly included in scope.
- **FR-012**: The workflow MUST identify the canonical source documents used for release validation and enforce owner boundaries of those documents.
- **FR-013**: The workflow MUST treat CI-produced release-readiness results as authoritative and label manual/local executions as advisory previews.
- **FR-014**: When the authoritative CI result is `not_ready`, release publication MUST be blocked.

### Key Entities *(include if feature involves data)*

- **Release Candidate**: A named release under evaluation with identifiers, evaluation timestamp, and final readiness status.
- **Verification Outcome Set**: The committed verification IDs with deterministic pass/fail results and trace references.
- **Evidence Bundle**: A release-scoped artifact collection containing mandatory manifest, decision, approvals, human-readable results, and raw evidence.
- **Gate Approval Record**: Required owners, provided approvals, and approval timestamp used to validate decision authority.
- **Field-Test Coverage Record**: Pass/fail coverage mapping for each committed field-test scenario required for baseline release.
- **Release Readiness Report**: Final report with status, blocking reasons, and remediation actions.

### Assumptions

- The committed verification rule set and field-test scenario list are already defined in canonical product documentation.
- Gate owner assignments are authoritative and stable for the evaluated release.
- Evidence producers follow the canonical evidence artifact naming and directory contract.

### Operational Definitions

- **Complete Evidence Bundle**: Mandatory artifacts exist, parse successfully where required, and carry matching `release_id` for the candidate under evaluation.
- **Valid Approval Set**: All required owners are present and approval freshness satisfies `freshness_hours <= 24`.
- **Deterministic Verification Outcome**: Each committed verification ID resolves to one explicit status value (`pass`, `fail`, `missing`, or `invalid`) with no deferred interpretation.

### Dependencies

- Committed verification rule definitions in `specs/00-product-spec.md`.
- Gate registry and evidence artifact contract in `specs/10-roadmap-and-gates.md`.
- Validation backlog and field-test scenario definitions in `specs/30-backlog-and-validation.md`.
- Technical and data contracts in `specs/20-architecture-contracts.md`.

### Out of Scope

- Adding or modifying conditional and exploratory feature gates.
- Changing the canonical committed verification rule semantics.
- Introducing new product functionality unrelated to release hardening.

## Constitution Alignment *(mandatory)*

- **CA-001**: Assumptions and ambiguities are documented in `Assumptions`, `Dependencies`, and `Out of Scope`; no unresolved clarification markers remain.
- **CA-002**: Scope is minimal and release-hardening specific; out-of-scope items explicitly exclude new product feature work.
- **CA-003**: Canonical ownership is preserved: this spec references `specs/00`, `specs/10`, `specs/20`, and `specs/30` without redefining their source-owned sections.
- **CA-004**: Deterministic verification expectations are explicit via FR-002 to FR-014, including fail-closed behavior for missing or invalid evidence and publication blocking for `not_ready` outcomes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of committed verification IDs are evaluated in each release-readiness run, with no omitted or duplicate committed checks.
- **SC-002**: 100% of release decisions marked `ready` have complete mandatory evidence artifacts and complete required-owner approvals.
- **SC-003**: 100% of runs with any missing committed evidence, missing committed field-test coverage, or missing required approvals end as `not_ready`.
- **SC-004**: The final release readiness report is generated within 10 minutes for a standard candidate release package.
- **SC-005**: Two consecutive runs against unchanged candidate inputs produce the same final status and the same blocking reason set.
- **SC-006**: 100% of authoritative CI runs returning `not_ready` prevent release publication.

## Requirement Traceability

| Requirement | Primary Story | Acceptance Scenario Anchor |
| --- | --- | --- |
| FR-001, FR-002, FR-003, FR-004, FR-009 | US1 | US1 Scenario 1-2 |
| FR-005, FR-006, FR-007, FR-010, FR-012 | US2 | US2 Scenario 1-2 + Edge Cases |
| FR-008, FR-011 | US3 | US3 Scenario 1-2 |
| FR-013, FR-014 | Cross-cutting (CI authority) | Clarifications + CI enforcement behavior |
| SC-001, SC-005 | US1 quality gates | US1 Independent Test |
| SC-002, SC-003 | US2 quality gates | US2 Independent Test |
| SC-004 | Cross-cutting runtime budget | US1/CI report generation path |
| SC-006 | Cross-cutting publication control | FR-014 + CI authority model |
