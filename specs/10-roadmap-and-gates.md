# Grocery App Roadmap and Gates

## Source of Truth Map

This file owns:
- Feature commitment tiers (`committed`, `conditional`, `exploratory`).
- Milestone order and dependencies.
- Gate contract and gate registry.
- Committed security release rule.
- Cut rules for optional features.

This file does not own:
- Verification rule definitions (owned by [00-product-spec.md](./00-product-spec.md)).
- Technical implementation contracts (owned by [20-architecture-contracts.md](./20-architecture-contracts.md)).
- Story-level execution details (owned by [30-backlog-and-validation.md](./30-backlog-and-validation.md)).

## 1. Feature Commitment Tiers

- `committed`: required to ship the finished baseline product.
- `conditional`: implemented only if gate decisions retain the feature.
- `exploratory`: research or expansion tracks that can be deferred indefinitely.

Release readiness depends only on committed milestones and committed verification rules.

## 2. Gate Contract Interface

```ts
export type Gate = {
  gate_id: string;
  verification_refs: string[];
  evidence_bundle: string;
  decision_if_fail: string;
  owners: string[]; // must use VerificationOwner vocabulary from 00-product-spec.md
};
```

Gate decision lifecycle:
1. Complete related stories.
2. Submit evidence bundle.
3. Record gate decision (`retain` or `cut`).

Gate policy:
- A gate decision is invalid if any referenced `VerificationRule.pass_condition` is not deterministic (explicit comparator/target or explicit boolean outcome).
- A gate decision is invalid if any listed `owners` approval is missing.
- Every `verification_ref` in a gate must resolve to an existing rule in [00-product-spec.md](./00-product-spec.md).
- Every `owners[]` entry in a gate must match the canonical `VerificationOwner` vocabulary in [00-product-spec.md](./00-product-spec.md).

## 2.1 Evidence Artifact Contract

Canonical evidence path:
- `evidence/<release>/<gate_id>/<bundle_id>/`

Mandatory files per evidence bundle:
- `manifest.json` (bundle metadata, scope, timestamps)
- `verification-results.md` (verification outcomes by `verification_id`)
- `raw-data/` (source exports, logs, benchmark outputs)
- `decision.json` (`retain` or `cut` with rationale)
- `approvals.json` (owners sign-offs; all entries in `owners[]` are required)

### 2.2 Evidence JSON Schemas (Canonical)

`manifest.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "grocery.specs/evidence/manifest.schema.json",
  "type": "object",
  "required": [
    "release_id",
    "gate_id",
    "bundle_id",
    "scope",
    "generated_at_utc",
    "artifact_version"
  ],
  "additionalProperties": false,
  "properties": {
    "release_id": { "type": "string", "minLength": 1 },
    "gate_id": { "type": "string", "pattern": "^G-[A-Z]+-[0-9]{2}$" },
    "bundle_id": { "type": "string", "pattern": "^EV-[A-Z0-9-]+$" },
    "scope": { "type": "string", "enum": ["committed", "conditional", "exploratory"] },
    "generated_at_utc": { "type": "string", "format": "date-time" },
    "artifact_version": { "type": "string", "pattern": "^v[0-9]+$" },
    "story_ids": {
      "type": "array",
      "items": { "type": "string", "pattern": "^GS-[0-9]{3}$" },
      "uniqueItems": true
    },
    "verification_ids": {
      "type": "array",
      "items": { "type": "string", "pattern": "^VR-[A-Z]+-[0-9]{3}-[A-Z0-9-]+$" },
      "minItems": 1,
      "uniqueItems": true
    }
  }
}
```

`decision.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "grocery.specs/evidence/decision.schema.json",
  "type": "object",
  "required": [
    "gate_id",
    "bundle_id",
    "decision",
    "rationale",
    "decided_at_utc"
  ],
  "additionalProperties": false,
  "properties": {
    "gate_id": { "type": "string", "pattern": "^G-[A-Z]+-[0-9]{2}$" },
    "bundle_id": { "type": "string", "pattern": "^EV-[A-Z0-9-]+$" },
    "decision": { "type": "string", "enum": ["retain", "cut"] },
    "rationale": { "type": "string", "minLength": 1 },
    "decided_at_utc": { "type": "string", "format": "date-time" }
  }
}
```

`approvals.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "grocery.specs/evidence/approvals.schema.json",
  "type": "object",
  "required": [
    "gate_id",
    "bundle_id",
    "required_owners",
    "approvals"
  ],
  "additionalProperties": false,
  "properties": {
    "gate_id": { "type": "string", "pattern": "^G-[A-Z]+-[0-9]{2}$" },
    "bundle_id": { "type": "string", "pattern": "^EV-[A-Z0-9-]+$" },
    "required_owners": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1 }
    },
    "approvals": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1 }
    },
    "approved_at_utc": { "type": "string", "format": "date-time" }
  }
}
```

## 3. Dependency-Ordered Milestone Sequence

`M0 -> M1 -> M1.1 -> M1.2 -> M2 -> M2.5 -> M3`

No milestone depends on a later milestone.

## 4. Milestone Specifications

### M0 Foundations (`committed`)

Objective:
- Create runnable product skeleton and baseline quality controls.

Blocked by:
- None.

Entry criteria:
- Product intent and committed scope are frozen.

Exit criteria:
- Single app codebase structure exists.
- Core navigation shell and shared UI primitives exist.
- Baseline CI checks run successfully.
- Data contract placeholders exist for core entities.
- Security rules baseline and emulator security test harness are available.

Readiness rule:
- Stories complete with evidence submitted.

### M1 Living List MVP (`committed`)

Objective:
- Deliver end-to-end usable grocery product with offline-safe collaboration.

Blocked by:
- M0.

Entry criteria:
- M0 exit criteria complete.

Exit criteria:
- Auth and household membership are functional.
- Role-aware item lifecycle transitions work.
- Active Shopping view merges validated items and sorts by aisle.
- Offline sync recovers with no data loss and low duplication.
- Item history and event logging support diagnostics.
- Security verification evidence for role and household boundary controls is passing (`VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`).

Readiness rule:
- Stories complete with committed verification rules passing, including `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.

### M1.1 Quick Wins (`conditional`)

Objective:
- Improve speed of bulk input and routine planning.

Blocked by:
- M1.
- M0.

Entry criteria:
- Committed MVP is stable in field-like conditions.

Exit criteria:
- Packs/recipes with multiplier are usable.
- Paste-text parser with correction flow is usable.
- Recurrence reminders can run without degrading core reliability.

Readiness rule:
- Story completion + evidence submitted + gate decisions recorded (`G-QW-01`, `G-REM-01`).

### M1.2 Smart Suggestions (`conditional`)

Objective:
- Add suggestion relevance and aisle personalization only if value is proven.

Blocked by:
- M1.
- M0.

Entry criteria:
- M1 committed verification rules pass.

Exit criteria:
- Suggestion chips are reliable and measurable.
- Aisle order customization is persistent and reflected in Active Shopping.

Readiness rule:
- Story completion + evidence submitted + gate decisions recorded (`G-SUG-01`, `G-SUG-02`, `G-AISLE-01`).

### M2 Rich Inputs (`exploratory`)

Objective:
- Evaluate OCR and voice only if they produce clear user value.

Blocked by:
- M1.
- M0.

Entry criteria:
- Core product stability remains within committed quality budget.

Exit criteria:
- OCR and/or voice prototypes satisfy their verification rules.
- Failure paths revert to manual entry without blocking shopping flow.

Readiness rule:
- Story completion + evidence submitted + gate decisions recorded (`G-OCR-01`, `G-VOICE-01`).

### M2.5 Personalization (`exploratory`)

Objective:
- Add habit-driven automation when relevance is demonstrably high.

Blocked by:
- M1.
- M1.2.
- M0.

Entry criteria:
- Existing personalization settings are understandable and low-risk.

Exit criteria:
- Multi-store behavior remains predictable.
- Migration suggestions are mostly relevant to users.

Readiness rule:
- Story completion + evidence submitted + gate decisions recorded (`G-MIG-01`, `G-THR-01`).

### M3 Pro Plus (`exploratory`)

Objective:
- Extend planning depth and interoperability without compromising core product.

Blocked by:
- M1.
- M0.

Entry criteria:
- Core product remains stable and maintainable.

Exit criteria:
- Forecasting or exports show practical utility.
- Optional integrations remain isolated from committed critical path.

Readiness rule:
- Story completion + evidence submitted + gate decisions recorded (`G-FORE-01`, `G-EXP-01`, `G-INT-01`, `G-BUY-01`).

## 5. Gate Registry

| gate_id | verification_refs | evidence_bundle | decision_if_fail | owners |
| --- | --- | --- | --- | --- |
| `G-QW-01` | `VR-CND-101-BULK-ADD-TIME` | `EV-QW-BULK-ADD` | Cut quick-input features from release scope | `["Product Owner","Engineering Lead"]` |
| `G-REM-01` | `VR-CND-102-REMINDER-DELIVERY` | `EV-REM-DELIVERY` | Disable reminders and keep manual recurrence only | `["Product Owner"]` |
| `G-SUG-01` | `VR-CND-201-SUGGESTION-ACCEPTANCE` | `EV-SUG-ACCEPTANCE` | Disable suggestion chips UI; keep local typeahead | `["Product Owner","Data Owner"]` |
| `G-SUG-02` | `VR-CND-202-SUGGESTION-LATENCY` | `EV-SUG-LATENCY` | Disable remote suggestions in production path | `["Engineering Lead"]` |
| `G-AISLE-01` | `VR-CND-203-AISLE-ORDER-PERSISTENCE` | `EV-AISLE-PERSISTENCE` | Revert to default aisle order with manual override per item | `["Engineering Lead"]` |
| `G-OCR-01` | `VR-EXP-301-OCR-QUALITY` | `EV-OCR-EVAL` | Keep OCR disabled | `["Product Owner","ML Owner"]` |
| `G-VOICE-01` | `VR-EXP-302-VOICE-COMMAND-SUCCESS` | `EV-VOICE-EVAL` | Keep voice disabled | `["Product Owner","Mobile Owner"]` |
| `G-MIG-01` | `VR-EXP-303-MIGRATION-RELEVANCE` | `EV-MIG-RELEVANCE` | Disable automatic migration suggestions | `["Product Owner"]` |
| `G-THR-01` | `VR-EXP-304-THRESHOLD-USABILITY` | `EV-THRESHOLD-USABILITY` | Remove threshold controls from UI | `["Product Owner"]` |
| `G-FORE-01` | `VR-EXP-305-FORECAST-PRECISION` | `EV-FORECAST-EVAL` | Keep forecasting disabled and rely on manual recurrence | `["Product Owner","Data Owner"]` |
| `G-EXP-01` | `VR-EXP-306-EXPORT-FIXTURE-PASS` | `EV-EXPORT-FIXTURES` | Disable export/import in release path | `["Engineering Lead"]` |
| `G-INT-01` | `VR-EXP-307-INTEGRATION-RELIABILITY` | `EV-INTEGRATION-PILOT` | Keep integrations behind internal feature flag | `["Engineering Lead"]` |
| `G-BUY-01` | `VR-EXP-308-BUYER-ROLE-MIGRATION` | `EV-BUYER-ROLE` | Keep buyer role disabled and retain committed `validate`-based buyer behavior | `["Security Owner"]` |

## 6. Committed Security Release Rule

Committed security invariants:
- Canonical role set remains `suggest` and `validate` for committed scope.
- Validator transitions remain restricted to `validate` role.
- Household isolation remains enforced for reads and writes.
- Deny-by-default policy remains in force for non-explicitly allowed actions.

Non-optional release rule:
- M1 cannot be marked release-ready unless `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` evidence is passing.

Gate interaction rule:
- Conditional and exploratory gate decisions cannot weaken or override committed security invariants.

## 7. Cut Policy for Optional Features

If any conditional or exploratory gate is recorded as `cut`:
- The feature is cut from release scope for that cycle.
- The fallback path in `decision_if_fail` is activated immediately.
- No committed milestone dates are moved to rescue the failed optional feature.
- Gate evidence and decision are stored with backlog validation artifacts.

## 8. Finished Product Path

The finished baseline release path is:
- Complete M0 and M1 (`committed`) stories.
- Pass committed verification rules defined in [00-product-spec.md](./00-product-spec.md).

All milestones above M1 remain additive and non-blocking.
