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

## Gate Policy

- Optional (`conditional`/`exploratory`) features are fail-closed on gate failure.
- Gate decisions cannot weaken committed security invariants.
- Optional gate failure cannot block committed release.
