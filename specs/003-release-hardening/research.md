# Research: Baseline Release Hardening

## Decision 1: Use Pre-Generated Committed Verification Outputs as Authoritative Inputs

- **Decision**: Release-readiness evaluation consumes committed verification outputs/evidence artifacts generated before readiness execution.
- **Rationale**: Keeps release evaluation deterministic and separates evidence production from readiness adjudication.
- **Alternatives considered**:
  - Execute all committed verification checks inside readiness workflow.
  - Hybrid run (partial execution + partial consumption).

## Decision 2: CI Is Authoritative; Local Runs Are Advisory

- **Decision**: CI execution is the only authoritative release decision source. Local/manual runs are preview-only.
- **Rationale**: Removes ambiguity and ensures one canonical publication gate for each release candidate.
- **Alternatives considered**:
  - CI-only with no local preview.
  - Equal authority for local and CI decisions.

## Decision 3: Default Scope Is Committed Only

- **Decision**: Readiness checks committed scope by default; optional scope requires explicit opt-in.
- **Rationale**: Aligns to finished baseline release criteria and prevents optional feature noise from blocking committed release.
- **Alternatives considered**:
  - Default committed + conditional scope.
  - Default all-tier scope.

## Decision 4: Approval Freshness Must Be <= 24 Hours

- **Decision**: Gate owner approvals older than 24 hours are invalid for release readiness.
- **Rationale**: Prevents stale sign-offs and keeps approvals tied to current release evidence.
- **Alternatives considered**:
  - Same-day freshness window.
  - 72-hour window.
  - No freshness requirement.

## Decision 5: `not_ready` Hard-Blocks Publication

- **Decision**: Authoritative CI `not_ready` status prevents release publication.
- **Rationale**: Enforces fail-closed release safety and guarantees committed criteria are non-bypassable.
- **Alternatives considered**:
  - Manual override path.
  - Provisional publication state.

## Decision 6: Deterministic Readiness Report Contract

- **Decision**: Readiness report includes final status, failing verification IDs, missing artifacts, missing/stale approvals, and missing field-test scenarios in a stable ordering.
- **Rationale**: Deterministic output is required for repeatability, automation, and audit trail quality.
- **Alternatives considered**:
  - Free-form human summary only.
  - Unordered issue reporting.

## Decision 7: Fail Closed on Evidence or Schema Validation Errors

- **Decision**: Missing evidence files, malformed required JSON artifacts, and release-ID mismatches produce `not_ready`.
- **Rationale**: Ensures correctness over convenience and preserves release contract integrity.
- **Alternatives considered**:
  - Warn and continue evaluation.
  - Partial readiness status.
