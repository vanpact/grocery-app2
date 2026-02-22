# Research: Grocery App Committed Baseline Bootstrap

## Decision 1: Keep Single Cross-Platform App Codebase

- **Decision**: Use one Expo React Native codebase targeting Android and Web.
- **Rationale**: Canonical architecture defines one committed core path and shared UI/token
  contracts across platforms.
- **Alternatives considered**:
  - Separate Android and Web repos.
  - Backend/frontend split by default.

## Decision 2: Keep Firebase Auth + Firestore as Canonical Identity/Data Stack

- **Decision**: Use Firebase Auth for identity and Firestore as source of truth.
- **Rationale**: Canonical product and architecture docs define this stack and rely on emulator
  evidence for release-blocking security verification.
- **Alternatives considered**:
  - Custom auth and SQL backend.
  - Self-hosted identity provider plus separate sync service.

## Decision 3: Preserve Deterministic Verification Contract Model

- **Decision**: Model release readiness strictly via committed `VR-COM-*` pass conditions.
- **Rationale**: Canonical docs explicitly reject non-deterministic KPI-only release decisions.
- **Alternatives considered**:
  - Qualitative review-only release checks.
  - Aggregated health score without rule-level pass/fail.

## Decision 4: Security Evidence Must Be Emulator-First

- **Decision**: Security validation uses emulator allow/deny suites as baseline evidence source.
- **Rationale**: `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` is release-blocking and maps directly to
  required deny/allow scenarios.
- **Alternatives considered**:
  - Manual security QA only.
  - Production-log-only validation.

## Decision 5: Optional Modules Are Fail-Closed

- **Decision**: Keep optional features (`conditional`/`exploratory`) strictly gate-controlled with
  immediate cut fallback on failure.
- **Rationale**: Roadmap gate contract requires optional failures not to block committed release.
- **Alternatives considered**:
  - Keep optional modules enabled by default with warning-only gates.
  - Defer gate decisions until post-release.

## Decision 6: Use Documentation Contracts Instead of Over-Specified API Formats

- **Decision**: For this planning bootstrap, represent interfaces as markdown contracts in
  `contracts/` rather than forcing OpenAPI/JSON schema for non-HTTP boundaries.
- **Rationale**: Current system boundary is app + Firestore rules; markdown contracts capture
  canonical interfaces without adding speculative implementation detail.
- **Alternatives considered**:
  - Full OpenAPI-first modeling despite no canonical HTTP surface.
  - No contract artifacts beyond prose in plan.md.
