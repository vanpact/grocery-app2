# Verification and Gate Contract

## Verification Rule Interface

```ts
export type VerificationRule = {
  verification_id: string;
  scope: 'committed' | 'conditional' | 'exploratory';
  required_evidence: string[];
  pass_condition: string;
  fail_action: string;
  owners: string[];
};
```

## Committed Verification Set

- `VR-COM-001-OFFLINE-REPLAY`
- `VR-COM-002-DEDUP-KEY-COLLISION`
- `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` (mandatory release blocker)
- `VR-COM-004-ACTIVE-SHOPPING-FILTER`
- `VR-COM-005-STATE-VISIBILITY`
- `VR-COM-006-EVENT-COVERAGE`
- `VR-COM-007-NAV-STABILITY`
- `VR-COM-008-M3E-COMPONENT-MAPPING`
- `VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE`
- `VR-COM-010-INPUT-PARITY-WEB`
- `VR-COM-011-AUTH-MEMBERSHIP-FAILURE-HANDLING`
- `VR-COM-012-TRANSITION-OUTCOME-SEMANTICS`
- `VR-COM-013-ACTIVE-SHOPPING-ORDERING`
- `VR-COM-014-REPLAY-ORDER-IDEMPOTENCY`
- `VR-COM-015-REPLAY-PARTIAL-FAILURE-RECOVERY`
- `VR-COM-016-HOUSEHOLD-ISOLATION-QUERY-SURFACES`
- `VR-COM-017-OPTIONAL-GATE-ACTIVATION-OWNERSHIP`
- `VR-COM-018-CONCURRENT-EDIT-CONFLICT-POLICY`
- `VR-COM-019-LATENCY-RESPONSIVENESS-THRESHOLDS`
- `VR-COM-020-ACCESSIBILITY-BASELINE`
- `VR-COM-021-NAV-LIFECYCLE-STABILITY`
- `VR-COM-022-DEPENDENCY-DEGRADED-MODE`
- `VR-COM-023-ACTOR-SCOPE-ENFORCEMENT`

## Gate Interface

```ts
export type Gate = {
  gate_id: string;
  verification_refs: string[];
  evidence_bundle: string;
  decision_if_fail: string;
  owners: string[];
};
```

## Evidence Artifact Contract

- Canonical path: `evidence/<release>/<gate_id>/<bundle_id>/`
- Required files:
  - `manifest.json`
  - `verification-results.md`
  - `raw-data/`
  - `decision.json`
  - `approvals.json`

## Evidence Requirements by Rule Class

- Replay and ordering rules (`VR-COM-001`, `VR-COM-014`, `VR-COM-015`) require mutation timeline logs and duplicate/idempotency counters.
- Security and isolation rules (`VR-COM-003`, `VR-COM-012`, `VR-COM-016`, `VR-COM-023`) require emulator allow/deny matrices and rule-evaluation traces.
- UX and accessibility rules (`VR-COM-005`, `VR-COM-007`, `VR-COM-008`, `VR-COM-009`, `VR-COM-010`, `VR-COM-020`, `VR-COM-021`) require scripted run outputs and platform/breakpoint coverage artifacts.
- Gate and dependency rules (`VR-COM-017`, `VR-COM-022`) require gate decision records, owner approvals, and degraded-mode behavior logs.

## Verification Ownership Matrix

| Verification Group | Primary Owner | Secondary Owner |
|--------------------|---------------|-----------------|
| Security/Isolation (`VR-COM-003`, `012`, `016`, `023`) | Security Engineering | Mobile/Web Platform |
| Replay/Reliability (`VR-COM-001`, `002`, `014`, `015`, `018`) | Platform Reliability | Data Services |
| UX/Accessibility (`VR-COM-004`, `005`, `007`, `008`, `009`, `010`, `013`, `019`, `020`, `021`) | UX Engineering | QA |
| Gate/Dependency (`VR-COM-006`, `011`, `017`, `022`) | Release Management | Feature Owners |

## Gate Policy

- Optional (`conditional`/`exploratory`) features are fail-closed on gate failure.
- Gate decisions cannot weaken committed security invariants.
- Optional gate failure cannot block committed release.
- Optional module activation is permitted only when gate decision is `pass` and accountable owner approval is recorded.
