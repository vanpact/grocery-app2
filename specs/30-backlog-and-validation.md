# Grocery App Backlog and Validation

## Source of Truth Map

This file owns:
- Dependency-first execution backlog.
- Story schema used by LLM-driven planning and implementation.
- Acceptance tests and done evidence requirements.
- Consolidated field-test scenarios.
- Release quality gate execution criteria.
- Security traceability from verification rules to stories, scenarios, and evidence.

This file does not own:
- Product definitions and verification rule semantics (owned by [00-product-spec.md](./00-product-spec.md)).
- Milestone ordering and gate registry definitions (owned by [10-roadmap-and-gates.md](./10-roadmap-and-gates.md)).
- Technical component and data contracts (owned by [20-architecture-contracts.md](./20-architecture-contracts.md)).

## 1. Normalized Story Schema

Every story must follow this schema:
- `story_id`
- `depends_on`
- `tier`
- `milestone`
- `objective`
- `acceptance_tests`
- `verification_refs`
- `gate_refs` (required for `conditional` and `exploratory`, omitted for `committed`)
- `done_evidence`

Schema constraints:
- Every committed story must include at least one `verification_ref`.
- Every `verification_ref` must exist in [00-product-spec.md](./00-product-spec.md).
- Every non-committed story must include at least one `gate_ref`.
- Every `gate_ref` must exist in [10-roadmap-and-gates.md](./10-roadmap-and-gates.md).
- For each `gate_ref`, `done_evidence` must include a canonical artifact path that follows `evidence/<release>/<gate_id>/<bundle_id>/` and contains `manifest.json`, `verification-results.md`, `raw-data/`, `decision.json`, and `approvals.json`.
- `manifest.json`, `decision.json`, and `approvals.json` must pass canonical JSON schemas defined in [10-roadmap-and-gates.md](./10-roadmap-and-gates.md).

## 2. Dependency-First Story Backlog

### 2.1 Committed Stories (Finished Product Path)

```yaml
story_id: GS-001
depends_on: []
tier: committed
milestone: M0
objective: Establish application shell with stable navigation and screen boundaries for Active Shopping, Overview, and Settings.
acceptance_tests:
  - App launches on Android and Web with all three core screens reachable.
  - Navigation state persists correctly across app foreground/background cycles.
verification_refs:
  - VR-COM-007-NAV-STABILITY
done_evidence:
  - Demo recording of navigation flow on Android and Web.
  - CI artifact proving build and typecheck pass.
```

```yaml
story_id: GS-002
depends_on: [GS-001]
tier: committed
milestone: M0
objective: Implement baseline Firestore data access layer and canonical entity mapping for household, list, item, and store records.
acceptance_tests:
  - Repository layer can read and write all required core entities.
  - Entity payloads conform to architecture contract field requirements.
verification_refs:
  - VR-COM-002-DEDUP-KEY-COLLISION
done_evidence:
  - Contract test output for repository read/write operations.
  - Snapshot examples of valid serialized entities.
```

```yaml
story_id: GS-003
depends_on: [GS-001]
tier: committed
milestone: M1
objective: Deliver sign-in flow and automatic household membership bootstrap for first-time users.
acceptance_tests:
  - Authenticated users are routed to core app views.
  - New users are assigned to a valid household context.
verification_refs:
  - VR-COM-003-ROLE-TRANSITION-ENFORCEMENT
done_evidence:
  - Auth flow test results for success and failure paths.
  - Trace logs proving household context is resolved before list operations.
```

```yaml
story_id: GS-004
depends_on: [GS-002, GS-003]
tier: committed
milestone: M1
objective: Implement item write path with normalized naming and merge-on-add dedup behavior.
acceptance_tests:
  - Adding duplicate items merges quantities and prevents duplicate rows.
  - State transitions respect lifecycle constraints from product spec.
verification_refs:
  - VR-COM-002-DEDUP-KEY-COLLISION
done_evidence:
  - Automated dedup tests with duplicate and near-duplicate cases.
  - Event traces showing add and merge actions.
```

```yaml
story_id: GS-005
depends_on: [GS-004]
tier: committed
milestone: M1
objective: Guarantee offline persistence and replay-safe synchronization without data loss.
acceptance_tests:
  - Add and validate operations succeed while offline and replay on reconnect.
  - Reconnect does not introduce net duplicates.
verification_refs:
  - VR-COM-001-OFFLINE-REPLAY
done_evidence:
  - Airplane-mode test logs with before and after state snapshots.
  - Reliability report for offline replay success rate.
```

```yaml
story_id: GS-006
depends_on: [GS-003, GS-004]
tier: committed
milestone: M1
objective: Enforce role-based security policy and verify rule behavior with allow and deny tests.
acceptance_tests:
  - Suggest users cannot perform validator-only transitions.
  - Household boundary violations are denied.
verification_refs:
  - VR-COM-003-ROLE-TRANSITION-ENFORCEMENT
done_evidence:
  - Emulator security test suite output with all committed cases green.
  - Policy matrix mapping each role to permitted actions.
```

```yaml
story_id: GS-007
depends_on: [GS-004]
tier: committed
milestone: M1
objective: Build Active Shopping aggregation over validated items with deterministic aisle ordering.
acceptance_tests:
  - Aggregated view includes validated items only.
  - Aisle ordering remains stable after data refresh and reconnect.
verification_refs:
  - VR-COM-004-ACTIVE-SHOPPING-FILTER
done_evidence:
  - Aggregation tests covering multi-list merges and order stability.
  - UI evidence for aisle-grouped render on sample households.
```

```yaml
story_id: GS-008
depends_on: [GS-004]
tier: committed
milestone: M1
objective: Capture item history and event logs for all committed user actions.
acceptance_tests:
  - Add, merge, validate, toggle, undo, and retry events are persisted.
  - Item rows expose actor and recency metadata.
verification_refs:
  - VR-COM-006-EVENT-COVERAGE
done_evidence:
  - Event schema validation report.
  - UI capture of item history metadata in committed flows.
```

```yaml
story_id: GS-009
depends_on: [GS-001, GS-005]
tier: committed
milestone: M1
objective: Implement required UX states and concise copy for empty, loading, error, and offline conditions.
acceptance_tests:
  - All core screens render explicit state components when appropriate.
  - Offline indicator appears immediately when network drops.
verification_refs:
  - VR-COM-005-STATE-VISIBILITY
  - VR-COM-008-M3E-COMPONENT-MAPPING
  - VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE
done_evidence:
  - State matrix test report across screens.
  - Copy review checklist approval.
  - Responsive viewport validation report.
```

```yaml
story_id: GS-010
depends_on: [GS-005, GS-006, GS-007, GS-008, GS-009]
tier: committed
milestone: M1
objective: Validate the complete finished-product baseline through end-to-end household shopping scenarios.
acceptance_tests:
  - User can complete create household, add items, validate items, shop offline, and resync successfully.
  - All committed verification rules pass in one release candidate cycle.
verification_refs:
  - VR-COM-001-OFFLINE-REPLAY
  - VR-COM-002-DEDUP-KEY-COLLISION
  - VR-COM-003-ROLE-TRANSITION-ENFORCEMENT
  - VR-COM-004-ACTIVE-SHOPPING-FILTER
  - VR-COM-005-STATE-VISIBILITY
  - VR-COM-006-EVENT-COVERAGE
  - VR-COM-007-NAV-STABILITY
  - VR-COM-008-M3E-COMPONENT-MAPPING
  - VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE
  - VR-COM-010-INPUT-PARITY-WEB
done_evidence:
  - Field-test session logs for baseline scenarios.
  - Signed release checklist with committed verification outcomes.
```

### 2.2 Conditional Stories (Gate-Controlled)

```yaml
story_id: GS-101
depends_on: [GS-004]
tier: conditional
milestone: M1.1
objective: Add packs and recipes with quantity multiplier for one-action multi-item insertion.
acceptance_tests:
  - Pack insertion creates projected items with correct multiplied quantities.
  - Projection reuses dedup merge behavior instead of creating duplicate rows.
verification_refs:
  - VR-CND-101-BULK-ADD-TIME
gate_refs:
  - G-QW-01
done_evidence:
  - Pack projection test set with expected merged outcomes.
  - Gate evidence artifact `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/` with mandatory files.
```

```yaml
story_id: GS-102
depends_on: [GS-004]
tier: conditional
milestone: M1.1
objective: Support paste-text parsing with user correction before commit.
acceptance_tests:
  - Parser maps common line formats into structured item candidates.
  - Correction step prevents malformed records from entering committed lists.
verification_refs:
  - VR-CND-101-BULK-ADD-TIME
gate_refs:
  - G-QW-01
done_evidence:
  - Parser accuracy report on internal sample set.
  - Gate evidence artifact `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/` with mandatory files.
```

```yaml
story_id: GS-103
depends_on: [GS-004, GS-008]
tier: conditional
milestone: M1.2
objective: Integrate suggestion chips with measured acceptance and bounded latency.
acceptance_tests:
  - Suggestions can be accepted into list with one interaction.
  - Acceptance and rejection actions emit measurable events.
verification_refs:
  - VR-CND-201-SUGGESTION-ACCEPTANCE
  - VR-CND-202-SUGGESTION-LATENCY
gate_refs:
  - G-SUG-01
  - G-SUG-02
done_evidence:
  - Latency benchmark output and acceptance-rate report.
  - Gate evidence artifact `evidence/<release>/G-SUG-01/EV-SUG-ACCEPTANCE/` with mandatory files.
  - Gate evidence artifact `evidence/<release>/G-SUG-02/EV-SUG-LATENCY/` with mandatory files.
```

```yaml
story_id: GS-104
depends_on: [GS-007]
tier: conditional
milestone: M1.2
objective: Personalize aisle order per store and reflect ordering in Active Shopping.
acceptance_tests:
  - Reordered aisles persist and render deterministically.
  - Store-specific order changes do not corrupt item state.
verification_refs:
  - VR-CND-203-AISLE-ORDER-PERSISTENCE
gate_refs:
  - G-AISLE-01
done_evidence:
  - Persistence tests for store aisle configurations.
  - Gate evidence artifact `evidence/<release>/G-AISLE-01/EV-AISLE-PERSISTENCE/` with mandatory files.
```

```yaml
story_id: GS-105
depends_on: [GS-003, GS-004]
tier: conditional
milestone: M1.1
objective: Add recurrence reminders as optional engagement feature.
acceptance_tests:
  - Due lists trigger reminders without blocking shopping workflow.
  - Reminder behavior can be disabled without side effects.
verification_refs:
  - VR-CND-102-REMINDER-DELIVERY
gate_refs:
  - G-REM-01
done_evidence:
  - Reminder schedule and delivery report.
  - Gate evidence artifact `evidence/<release>/G-REM-01/EV-REM-DELIVERY/` with mandatory files.
```

### 2.3 Exploratory Stories (Non-Blocking)

```yaml
story_id: GS-201
depends_on: [GS-004]
tier: exploratory
milestone: M2
objective: Evaluate OCR extraction for receipt and recipe image ingestion.
acceptance_tests:
  - OCR candidate extraction reaches target quality threshold.
  - User correction path remains faster than manual re-entry baseline.
verification_refs:
  - VR-EXP-301-OCR-QUALITY
gate_refs:
  - G-OCR-01
done_evidence:
  - Evaluation dataset report and confusion analysis.
  - Gate evidence artifact `evidence/<release>/G-OCR-01/EV-OCR-EVAL/` with mandatory files.
```

```yaml
story_id: GS-202
depends_on: [GS-004]
tier: exploratory
milestone: M2
objective: Evaluate voice-to-item command flow on Web and Android.
acceptance_tests:
  - Supported voice commands map to valid item inserts.
  - Fallback to typed entry always remains available.
verification_refs:
  - VR-EXP-302-VOICE-COMMAND-SUCCESS
gate_refs:
  - G-VOICE-01
done_evidence:
  - Voice command success report.
  - Gate evidence artifact `evidence/<release>/G-VOICE-01/EV-VOICE-EVAL/` with mandatory files.
```

```yaml
story_id: GS-203
depends_on: [GS-103]
tier: exploratory
milestone: M2.5
objective: Evaluate occasional-to-recurrent migration suggestions.
acceptance_tests:
  - Migration suggestions are understandable and user-confirmed.
  - Disabled migration mode does not alter list behavior.
verification_refs:
  - VR-EXP-303-MIGRATION-RELEVANCE
  - VR-EXP-304-THRESHOLD-USABILITY
gate_refs:
  - G-MIG-01
  - G-THR-01
done_evidence:
  - Relevance scoring report.
  - Gate evidence artifact `evidence/<release>/G-MIG-01/EV-MIG-RELEVANCE/` with mandatory files.
  - Gate evidence artifact `evidence/<release>/G-THR-01/EV-THRESHOLD-USABILITY/` with mandatory files.
```

```yaml
story_id: GS-204
depends_on: [GS-008]
tier: exploratory
milestone: M3
objective: Evaluate next-buy forecasting from historical events.
acceptance_tests:
  - Forecast output reaches target precision on internal validation set.
  - Forecast errors do not mutate committed shopping state.
verification_refs:
  - VR-EXP-305-FORECAST-PRECISION
gate_refs:
  - G-FORE-01
done_evidence:
  - Forecast precision report.
  - Gate evidence artifact `evidence/<release>/G-FORE-01/EV-FORECAST-EVAL/` with mandatory files.
```

```yaml
story_id: GS-205
depends_on: [GS-008]
tier: exploratory
milestone: M3
objective: Evaluate exports, imports, and integration hooks for advanced workflows.
acceptance_tests:
  - CSV export and import pass reference fixtures.
  - Integration failures do not block committed product actions.
verification_refs:
  - VR-EXP-306-EXPORT-FIXTURE-PASS
  - VR-EXP-307-INTEGRATION-RELIABILITY
gate_refs:
  - G-EXP-01
  - G-INT-01
done_evidence:
  - Export and import fixture test output.
  - Gate evidence artifact `evidence/<release>/G-EXP-01/EV-EXPORT-FIXTURES/` with mandatory files.
  - Gate evidence artifact `evidence/<release>/G-INT-01/EV-INTEGRATION-PILOT/` with mandatory files.
```

```yaml
story_id: GS-206
depends_on: [GS-006]
tier: exploratory
milestone: M3
objective: Evaluate future buyer-role introduction with backward-compatible membership migration and security policy diff validation.
acceptance_tests:
  - Buyer-role migration dry-run upgrades `memberships.v1` records to `memberships.v2` with `100%` completion and a rollback snapshot.
  - Security allow/deny tests for buyer-role flows pass while committed `suggest`/`validate` flows remain unchanged for legacy clients.
verification_refs:
  - VR-EXP-308-BUYER-ROLE-MIGRATION
gate_refs:
  - G-BUY-01
done_evidence:
  - Buyer-role migration dry-run report with rollback snapshot metadata.
  - Gate evidence artifact `evidence/<release>/G-BUY-01/EV-BUYER-ROLE/` with mandatory files.
```

## 3. Field-Test Scenarios (Consolidated)

### Scenario FT-1 Core Shopping Reliability (`committed`)

Steps:
1. Create household context and assign one suggest user and one validate user.
2. Add multiple items, including deliberate duplicates.
3. Switch offline, continue add and validate actions.
4. Reconnect and verify merged and synced results.

Pass criteria:
- No data loss.
- No duplicate rows for identical dedup keys.
- Active Shopping view correctly reflects validated items.

### Scenario FT-2 Collaboration and Security (`committed`)

Steps:
1. Suggest user attempts validator-only transition.
2. Validate user completes approved transition.
3. Inspect event trail and item history.

Pass criteria:
- Unauthorized action is denied.
- Authorized action succeeds.
- Event and history records are complete.

### Scenario FT-UX-ANDROID-M3E (`committed`)

Steps:
1. Execute add, validate, offline, and reconnect flows on Android phone viewport.
2. Validate use of MD3 semantic components for app shell, rows, chips, dialogs, and feedback.
3. Verify motion and interaction behavior remain consistent with Material 3 Expressive conventions.

Pass criteria:
- Critical screens use canonical MD3 component mapping.
- Required UX states remain visible and actionable during network transitions.

### Scenario FT-UX-WEB-600-839 (`committed`)

Steps:
1. Execute core flows on web viewport `600-839`.
2. Validate bottom-tabs navigation with single-pane workspace composition.
3. Verify keyboard-only completion of add/validate/offline recovery actions.

Pass criteria:
- `600-839` layout matches breakpoint contract.
- Keyboard path reaches same outcomes as pointer path.

### Scenario FT-UX-WEB-MID-RANGE-840-1199 (`committed`)

Steps:
1. Execute core flows on web viewport `840-1199`.
2. Validate navigation rail with single-pane workspace composition.
3. Verify keyboard-only completion of add/validate/offline recovery actions.

Pass criteria:
- Mid-range web layout matches breakpoint contract.
- Keyboard path reaches same outcomes as pointer path.

### Scenario FT-UX-WEB-DESKTOP-2PANE (`committed`)

Steps:
1. Execute core flows on web viewport `>=1200`.
2. Validate navigation rail and two-pane workspace composition.
3. Verify secondary pane content is limited to item detail, sync/offline state, and event/history context.
4. Verify keyboard-only completion of add/validate/offline recovery actions.

Pass criteria:
- Two-pane desktop layout matches contract.
- Secondary pane excludes analytics/insight widgets in committed baseline.
- Secondary pane allows only safe quick actions `validate` and `undo` (no full item editing).
- Keyboard path reaches same outcomes as pointer path.

### Scenario FT-UX-CROSS-PLATFORM-PARITY (`committed`)

Steps:
1. Run equivalent household scenario on Android and desktop web.
2. Compare resulting item states and event traces.

Pass criteria:
- Same user intent yields same persisted state and verification evidence on both platforms.

### Scenario FT-3 Optional Feature Value Check (`conditional`)

Steps:
1. Run suggestion and quick-input flows with representative household data.
2. Produce gate evidence artifacts at `evidence/<release>/<gate_id>/<bundle_id>/` with mandatory files.
3. Apply retain/cut decisions from gate registry.

Pass criteria:
- Gate decisions are recorded with required evidence artifacts.
- Cut features are disabled with documented fallback.

### Scenario FT-4 Exploratory Readiness (`exploratory`)

Steps:
1. Execute OCR, voice, migration, and forecasting pilots.
2. Compare evidence artifacts against gate requirements and mandatory file set.
3. Confirm committed flows remain unaffected when modules are disabled.

Pass criteria:
- No exploratory failure blocks baseline release.
- Fallback paths operate correctly.

## 4. Release Quality Gates

### 4.1 Committed Gates (Must Pass)

- `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` is mandatory and must pass.
- `FT-2 Collaboration and Security` must pass with deny/allow outcomes matching policy.
- Security verification evidence covers all committed allow/deny paths.
- End-to-end baseline flow is green for FT-1, FT-2, FT-UX-ANDROID-M3E, FT-UX-WEB-600-839, FT-UX-WEB-MID-RANGE-840-1199, FT-UX-WEB-DESKTOP-2PANE, and FT-UX-CROSS-PLATFORM-PARITY.
- Offline replay and dedup verifications pass with deterministic evidence.
- Event coverage and state visibility verifications pass.
- UX verifications `VR-COM-008-M3E-COMPONENT-MAPPING`, `VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE`, and `VR-COM-010-INPUT-PARITY-WEB` pass.

### 4.2 Conditional and Exploratory Gates (Fail-Closed)

- All non-committed stories reference existing verification rules and gate IDs.
- Every non-committed `gate_ref` has a matching artifact at `evidence/<release>/<gate_id>/<bundle_id>/` with all mandatory files.
- Failed gates trigger immediate cut or disable behavior.
- No failed optional gate can block committed release status.

## 5. Security Coverage Map (Committed)

Security traceability for release decision:
- `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` -> `GS-006` -> `FT-2 Collaboration and Security` -> security evidence artifacts.

Required security evidence artifacts for committed release:
- Emulator security test output for allow/deny role cases.
- Policy matrix mapping committed roles to permitted operations.
- Logs showing denied attempts for validator-only transitions by `suggest`.
- Logs showing denied cross-household access attempts.

## 6. Roadmap Executability Check

| Milestone | Required story set | Executable when |
| --- | --- | --- |
| M0 | `GS-001`, `GS-002` | both stories complete and evidence submitted |
| M1 | `GS-003` to `GS-010` | all stories complete and committed verifications pass |
| M1.1 | `GS-101`, `GS-102`, `GS-105` | stories complete, evidence submitted, and gate decisions for `G-QW-01` and `G-REM-01` recorded |
| M1.2 | `GS-103`, `GS-104` | stories complete, evidence submitted, and gate decisions for `G-SUG-01`, `G-SUG-02`, and `G-AISLE-01` recorded |
| M2 | `GS-201`, `GS-202` | stories complete, evidence submitted, and gate decisions for `G-OCR-01` and `G-VOICE-01` recorded |
| M2.5 | `GS-203` | story complete, evidence submitted, and gate decisions for `G-MIG-01` and `G-THR-01` recorded |
| M3 | `GS-204`, `GS-205`, `GS-206` | stories complete, evidence submitted, and gate decisions for `G-FORE-01`, `G-EXP-01`, `G-INT-01`, and `G-BUY-01` recorded |

## 7. LLM Reviewer Execution Template

Use this template when an LLM reviews release readiness:

```md
# Release Verification Report

## Input
- Canonical docs: 00, 10, 20, 30
- Story scope: <milestone or story IDs>
- Evidence bundle IDs: <list>
- Evidence root path: `evidence/<release>/<gate_id>/<bundle_id>/`

## Verification Results
| verification_id | status (pass/fail) | evidence checked | notes |
| --- | --- | --- | --- |

## Determinism Check
- All referenced verification rules are deterministic (explicit comparator/target or boolean): <pass/fail>

## Evidence Artifact Validation
- All referenced evidence artifact paths exist under `evidence/<release>/<gate_id>/<bundle_id>/`: <pass/fail>
- Mandatory files present for each bundle (`manifest.json`, `verification-results.md`, `raw-data/`, `decision.json`, `approvals.json`): <pass/fail>
- `manifest.json`, `decision.json`, and `approvals.json` conform to canonical schemas: <pass/fail>

## Gate Decisions
| gate_id | decision (retain/cut) | evidence_bundle | rationale |
| --- | --- | --- | --- |

## Approval Validation
- All required gate `owners[]` approvals present in `approvals.json`: <pass/fail>

## Dependency Validation
- Any missing dependencies: <none/list>
- Any gate reference mismatches: <none/list>

## Final Outcome
- Committed release readiness: <ready/not ready>
- Optional feature retention: <summary>
- Required follow-up actions: <list>
```

## 8. Product-Finish Proof

If all conditional and exploratory stories are removed, the committed story set `GS-001` to `GS-010` still supports the complete baseline product journey:
- create household,
- add and validate items,
- shop with Active Shopping view,
- work offline,
- resync safely,
- preserve collaboration history.
