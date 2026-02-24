# Research: UI Usability Alignment

## Decision 1: Enforce Committed Screen Scope Across Four Destinations

- **Decision**: Treat Sign-in, Active Shopping, Overview, and Settings as one required usability scope.
- **Rationale**: Committed UX verification (`VR-COM-008`) already binds these four surfaces; partial fixes risk release-blocking gaps.
- **Alternatives considered**:
  - Active Shopping-only scope.
  - Triage-only scope for worst UI issues.

## Decision 2: Standardize Recovery Actions by State

- **Decision**: Use a fixed recovery action contract: `error -> retry`, `offline -> continue + retry connection`, `membership-required -> retry membership + sign out`.
- **Rationale**: A shared contract avoids per-screen drift and keeps state-recovery behavior testable.
- **Alternatives considered**:
  - One generic action per state.
  - Fully screen-specific recovery action sets.

## Decision 3: Operationalize SC-006 with Deterministic Task-Run Evidence

- **Decision**: Measure SC-006 with deterministic scripted run sets across Android and Web and compute pass/fail from recorded run durations.
- **Rationale**: Repeatable scripted evidence is required for stable release decisions and re-run comparability.
- **Alternatives considered**:
  - Moderated human-only usability sessions.
  - Optional mixed evidence methods per release.

## Decision 4: Keep Responsive and Input-Parity Verification Contract-Centered

- **Decision**: Bind implementation and tests directly to committed verification IDs `VR-COM-005`, `VR-COM-008`, `VR-COM-009`, and `VR-COM-010`.
- **Rationale**: These IDs are already release-blocking and map directly to the user complaint about unusable, off-spec UI behavior.
- **Alternatives considered**:
  - Introducing new parallel UX verification IDs for this feature.
  - Deferring verification alignment to post-implementation manual review.

## Decision 5: Preserve Existing Domain and Security Invariants

- **Decision**: Make no role/lifecycle/sync-policy changes while improving UI usability.
- **Rationale**: The reported issue is UX alignment, and domain/security refactors would increase risk without solving requested outcomes.
- **Alternatives considered**:
  - Adjust role or transition semantics to simplify UI.
  - Modify replay/lifecycle behavior as part of UI work.

## Decision 6: Treat SC-006/SC-007 Failure as Committed Release Blocker

- **Decision**: If usability timing evidence fails SC-006 or SC-007, readiness remains `not_ready` until remediated.
- **Rationale**: User-facing usability failure in committed scope should not ship as a known defect.
- **Alternatives considered**:
  - Non-blocking follow-up ticket model.
  - Team-judgment severity override per release.
