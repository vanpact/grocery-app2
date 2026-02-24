# 004 Success Criteria

Parsed from the Spec Kit `spec-template.md` Success Criteria section.

## Source Mapping

- `specs/00-product-spec.md`
- `specs/10-roadmap-and-gates.md`
- `specs/30-backlog-and-validation.md`

## Measurable Outcomes (Committed, Release-Blocking)

- **SC-001** (`VR-COM-001-OFFLINE-REPLAY`): After reconnect, `data_loss_count = 0` and
  `duplicate_replay_count = 0`.
- **SC-002** (`VR-COM-002-DEDUP-KEY-COLLISION`): Two adds with the same dedup key create one
  merged item record.
- **SC-003** (`VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`): `suggest` cannot perform validator-only
  transitions and `validate` can.
- **SC-004** (`VR-COM-004-ACTIVE-SHOPPING-FILTER`): Active Shopping includes only `validated`
  items across selected lists.
- **SC-005** (`VR-COM-005-STATE-VISIBILITY`): Core screens show required empty/loading/error/
  offline state feedback with no silent failure.
- **SC-006** (`VR-COM-006-EVENT-COVERAGE`): Committed action events
  (`add`,`merge`,`validate`,`toggle`,`undo`,`error_retry`) are logged in committed flows.
- **SC-007** (`VR-COM-007-NAV-STABILITY`): Navigation shell remains stable across route changes
  and app foreground/background transitions.
- **SC-008** (`VR-COM-008-M3E-COMPONENT-MAPPING`): Sign-in, Active Shopping, Overview, and
  Settings use canonical MD3 component families.
- **SC-009** (`VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE`): Layout contract passes at `<600`,
  `600-839`, `840-1199`, and `>=1200` breakpoints. Non-finite viewport widths MUST fail
  closed to the `<600` mobile layout.
- **SC-010** (`VR-COM-010-INPUT-PARITY-WEB`): Keyboard-only web flow matches pointer outcomes for
  add, validate, and offline recovery.

## Optional Outcomes (Non-Blocking, Gate-Controlled)

- **SC-101** (`VR-CND-101-BULK-ADD-TIME`): Median quick-input bulk add time improves `>= 25%`
  versus baseline across the required scripted run set.
- **SC-102** (`VR-CND-102-REMINDER-DELIVERY`): Reminder delivery success is `100%` across the
  required due-event sample.
- **SC-201** (`VR-CND-201-SUGGESTION-ACCEPTANCE`): Suggestion acceptance rate `>= 20%` with
  `shown >= 100`.
- **SC-202** (`VR-CND-202-SUGGESTION-LATENCY`): Suggestion response p95 latency `< 400 ms` over
  required samples.

Gate failures for optional outcomes trigger `cut`/disable fallback and do not block committed
release readiness.
