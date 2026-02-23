# 001 Functional Specs

Parsed from the Spec Kit `spec-template.md` Requirements section.

## Source Mapping

- `specs/00-product-spec.md`
- `specs/10-roadmap-and-gates.md`
- `specs/20-architecture-contracts.md`
- `specs/30-backlog-and-validation.md`

## Functional Requirements

- **FR-001**: The system MUST authenticate users with Firebase Auth and resolve household membership before core list operations.
- **FR-002**: The committed authorization model MUST support only `suggest` and `validate` roles.
- **FR-003**: The system MUST enforce canonical lifecycle states (`draft`, `suggested`, `validated`, `bought`) and committed transition rules.
- **FR-004**: The system MUST provide multiple lists and a unified Active Shopping view that includes only `validated` items.
- **FR-005**: The item write path MUST normalize names and apply merge-on-add deduplication.
- **FR-006**: The dedup merge behavior MUST prevent net duplicate rows for identical dedup keys.
- **FR-007**: The system MUST support offline queueing and replay with `data_loss_count = 0` and `duplicate_replay_count = 0`.
- **FR-008**: The system MUST enforce household isolation for reads and writes with deny-by-default authorization.
- **FR-009**: The system MUST persist committed event coverage for `add`, `merge`, `validate`, `toggle`, `undo`, and `error_retry`.
- **FR-010**: The UI MUST render explicit empty, loading, error, and offline states across core committed screens.
- **FR-011**: Committed UX MUST follow Material 3 Expressive component mapping and responsive web breakpoint contracts.
- **FR-012**: Web committed flows MUST preserve keyboard and pointer outcome parity for add, validate, and offline recovery actions.
- **FR-013**: Optional modules (suggestions, OCR, voice, forecasting, integrations) MUST be gate-controlled and fail-closed.
- **FR-014**: Release readiness MUST require passing committed verification rules, including mandatory `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.

## Committed Out-of-Scope (Non-Goals)

- OCR extraction
- Voice capture
- Purchase forecasting
- Direct third-party commerce integrations
- Advanced ML models
