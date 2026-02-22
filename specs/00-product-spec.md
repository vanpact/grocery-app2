# Grocery App Product Spec

## Source of Truth Map

This file owns:
- Product problem statement and target users.
- Value proposition and MVP boundary.
- Product lifecycle state model (canonical).
- Security baseline and release-blocking security rule.
- LLM verification model and release-facing verification rules.
- UX contract for Material 3 Expressive and responsive web layout.
- Product terminology and naming rules.

This file does not own:
- Delivery sequencing and gate operations (owned by [10-roadmap-and-gates.md](./10-roadmap-and-gates.md)).
- Technical architecture contracts (owned by [20-architecture-contracts.md](./20-architecture-contracts.md)).
- Story-level execution and test protocol (owned by [30-backlog-and-validation.md](./30-backlog-and-validation.md)).

## 1. Problem Statement

Households lose time and money because grocery planning and shopping are fragmented across chat threads, memory, and ad hoc notes. The common failures are duplicate items, missed essentials, stale lists, and poor coordination during in-store shopping with unstable network conditions.

## 2. Target Users and Contexts

Primary users:
- Household buyer: shops in-store under time pressure, often one-handed, with variable connectivity.
- Household validator: reviews and confirms suggested items before shopping.
- Household contributor: adds ideas and requests without always being the shopper.

Persona to role mapping in committed MVP:
- Buyer is a persona, not a separate committed role.
- Buyer actions in committed MVP execute under `validate` role policy.

Context constraints:
- Real environments are noisy and interrupted.
- Input must be fast, low-friction, and error-tolerant.
- Offline behavior is a product requirement, not a fallback.

## 3. Value Proposition

The product provides one shared grocery workflow that is:
- Fast: add and confirm items in at most two actions.
- Reliable: survives offline sessions and syncs without accidental duplication.
- Collaborative: role-aware contributions with clear item history.
- Practical: Active Shopping view ordered by aisle.

## 4. Scope Boundary

### 4.1 Committed MVP Scope

Committed scope (required for finished product baseline):
- Account sign-in and household membership.
- Role-aware collaboration (`suggest`, `validate`).
- Multiple lists with a unified Active Shopping view.
- Item CRUD with deduplication and merge-on-add behavior.
- Offline-first sync and conflict-safe recovery.
- Item-level history and event logging.
- Reliable empty/loading/error/offline UI states.

### 4.2 Non-Goals for Committed MVP

Out of committed MVP:
- OCR extraction.
- Voice capture.
- Purchase forecasting.
- Direct third-party commerce integrations.
- Advanced ML models.

These may exist later as conditional or exploratory roadmap work.

## 5. Product Lifecycle State Model (Canonical)

The only canonical lifecycle states are:
- `draft`
- `suggested`
- `validated`
- `bought`

State semantics:
- `draft`: temporary or partially parsed item not yet committed by user confirmation.
- `suggested`: proposed by a contributor and pending validator confirmation.
- `validated`: approved for active shopping.
- `bought`: confirmed as purchased.

View rules:
- Active Shopping view shows only `validated` items by default.
- List management views may show all states.
- `draft` items are never shown in Active Shopping.

Transition rules:
- `draft -> suggested` by explicit user confirmation.
- `suggested -> validated` requires `validate` permission.
- `validated -> bought` requires explicit shopping completion by a `validate` role user in committed MVP.
- `bought -> validated` is allowed as correction/undo by `validate` role in committed MVP.

## 6. UX Invariants

Hard invariants for all committed flows:
- Core add/validate actions require no more than two interactions.
- Offline state must always be visible when network is unavailable.
- Actions queued offline must replay without creating net duplicates.
- Primary touch targets are at least 44 px.
- Text remains readable at 16 px equivalent or larger.
- UI copy uses explicit action language (for example: Add, Validate, Undo).

## 7. Security Baseline (Canonical)

Security baseline for committed MVP:
- Authentication source is Firebase Auth identity.
- Committed authorization roles are only `suggest` and `validate`.
- Authorized lifecycle transitions are role-gated:
  - `draft -> suggested` requires explicit confirmation and is allowed for `suggest` and `validate`.
  - `suggested -> validated` requires `validate`.
  - `validated -> bought` requires `validate`.
  - `bought -> validated` requires `validate`.
- Household boundary is strict: no cross-household reads or writes are allowed.
- Security decision policy is deny by default for all non-explicitly allowed actions.
- Security verification is release-blocking through `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.

## 8. LLM Verification Model (Canonical)

Release decisions are based on deterministic verification contracts, not on a KPI table.

### 8.1 Canonical Interface

```ts
export type VerificationRule = {
  verification_id: string;
  scope: 'committed' | 'conditional' | 'exploratory';
  required_evidence: string[];
  pass_condition: string; // deterministic expression with explicit comparator/target
  fail_action: string;
  owners: string[];
};
```

Contract rule:
- Every `pass_condition` must include an explicit comparator/target or an explicit boolean outcome.
- Deferred wording is not allowed.

### 8.2 Committed Verification Rules

| verification_id | scope | required_evidence | pass_condition | fail_action | owners |
| --- | --- | --- | --- | --- | --- |
| `VR-COM-001-OFFLINE-REPLAY` | committed | Offline test log with before/after snapshots | Boolean: `data_loss_count = 0` and `duplicate_replay_count = 0` after reconnect | Block release candidate and fix sync path | `["Engineering Lead"]` |
| `VR-COM-002-DEDUP-KEY-COLLISION` | committed | Dedup automated test report and event trace | Boolean: two adds with same dedup key create one row with merged quantity/tags | Block release candidate and fix add merge path | `["Engineering Lead"]` |
| `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` | committed | Security emulator allow/deny suite | Boolean: `suggest` cannot execute validator transitions and `validate` can | Block release candidate and fix rules/policy | `["Security Owner"]` |
| `VR-COM-004-ACTIVE-SHOPPING-FILTER` | committed | UI integration tests for list aggregation | Boolean: Active Shopping includes only `validated` items across selected lists | Block release candidate and fix aggregation filter | `["Product Owner","Engineering Lead"]` |
| `VR-COM-005-STATE-VISIBILITY` | committed | Screen matrix evidence for empty/loading/error/offline | Boolean: all core screens render required state feedback with no silent failure | Block release candidate and fix state components | `["UX Owner"]` |
| `VR-COM-006-EVENT-COVERAGE` | committed | Event schema validation and sampled traces | Boolean: `add`,`merge`,`validate`,`toggle`,`undo`,`error_retry` are logged in committed flows | Block release candidate and fix instrumentation | `["Product Analytics Owner"]` |
| `VR-COM-007-NAV-STABILITY` | committed | Android and Web navigation replay recordings | Boolean: navigation shell remains stable across foreground/background and route transitions | Block release candidate and fix app shell | `["Mobile Lead","Web Lead"]` |
| `VR-COM-008-M3E-COMPONENT-MAPPING` | committed | Screen audit against MD3 component mapping contract | Boolean: Sign-in, Active Shopping, Overview, and Settings screens use canonical MD3 component families for shell, rows, chips, dialogs, banners/snackbars | Block release candidate and fix component mapping | `["UX Owner"]` |
| `VR-COM-009-RESPONSIVE-LAYOUT-COVERAGE` | committed | Responsive viewport validation report | Boolean: layout contract passes at `<600`, `600-839`, `840-1199`, and `>=1200` breakpoints | Block release candidate and fix responsive layout behavior | `["Web Lead"]` |
| `VR-COM-010-INPUT-PARITY-WEB` | committed | Keyboard-only and pointer flow comparison report | Boolean: web keyboard-only path matches pointer outcomes for add/validate/offline-recovery flows | Block release candidate and fix interaction parity | `["Web Lead"]` |

### 8.3 Conditional and Exploratory Verification Rules

| verification_id | scope | required_evidence | pass_condition | fail_action | owners |
| --- | --- | --- | --- | --- | --- |
| `VR-CND-101-BULK-ADD-TIME` | conditional | Timed scenario run comparing baseline add flow vs quick-input flow | Numeric: median bulk-add completion time improvement `>= 25%` vs baseline across `>= 10` scripted runs (`5 baseline + 5 quick`) | Disable quick-input features for release cycle | `["Product Owner","Engineering Lead"]` |
| `VR-CND-102-REMINDER-DELIVERY` | conditional | Reminder delivery log and user-visible behavior capture | Numeric/Boolean: reminder delivery success rate `= 100%` across `>= 20` scheduled due events, and all delivered reminders are dismissible without blocking shopping flow | Disable reminders and keep manual recurrence only | `["Product Owner"]` |
| `VR-CND-201-SUGGESTION-ACCEPTANCE` | conditional | Suggestion event report (`shown`, `accepted`, `rejected`) | Numeric: suggestion acceptance rate `>= 20%` with `shown >= 100` | Disable suggestion chips UI | `["Product Owner","Data Owner"]` |
| `VR-CND-202-SUGGESTION-LATENCY` | conditional | p95 latency benchmark report from simulated 4G | Numeric: suggestion p95 latency `< 400 ms` across `>= 100` suggestion responses | Disable remote suggestions and keep local typeahead | `["Engineering Lead"]` |
| `VR-CND-203-AISLE-ORDER-PERSISTENCE` | conditional | Store config persistence test report | Numeric: reordered aisles reflected correctly in `>= 95%` of validation runs across `>= 40` runs | Revert to default aisle order with per-item override | `["Engineering Lead"]` |
| `VR-EXP-301-OCR-QUALITY` | exploratory | OCR evaluation set report with confusion matrix | Numeric: OCR F1 score `>= 0.80` on `>= 40` documents | Keep OCR disabled | `["Product Owner","ML Owner"]` |
| `VR-EXP-302-VOICE-COMMAND-SUCCESS` | exploratory | Voice command test session report | Numeric: voice command success rate `>= 80%` on `>= 50` commands | Keep voice disabled | `["Product Owner","Mobile Owner"]` |
| `VR-EXP-303-MIGRATION-RELEVANCE` | exploratory | Rated migration suggestion study report | Numeric: user-rated migration relevance `>= 70%` from `>= 30` ratings | Keep migration suggestions disabled | `["Product Owner"]` |
| `VR-EXP-304-THRESHOLD-USABILITY` | exploratory | Task-based usability test report for threshold controls | Numeric: threshold usability score `>= 4/5` across `>= 10` participants completing `>= 20` threshold tasks | Remove threshold controls from UI | `["Product Owner"]` |
| `VR-EXP-305-FORECAST-PRECISION` | exploratory | Forecast validation report on internal history dataset | Numeric: forecast precision within `+/-1 day` is `>= 0.65` on `>= 200` prediction points | Keep forecasting disabled | `["Product Owner","Data Owner"]` |
| `VR-EXP-306-EXPORT-FIXTURE-PASS` | exploratory | Export/import fixture test output | Numeric: reference CSV fixture roundtrip pass rate `= 100%` | Disable export/import in release path | `["Engineering Lead"]` |
| `VR-EXP-307-INTEGRATION-RELIABILITY` | exploratory | Pilot integration reliability report | Numeric: integration successful sync events `>= 99%` across `>= 500` sync events | Keep integrations behind internal flag | `["Engineering Lead"]` |
| `VR-EXP-308-BUYER-ROLE-MIGRATION` | exploratory | Buyer role migration dry-run report and security diff test report | Boolean: schema migration `memberships.v1 -> memberships.v2` achieves `100%` migration with rollback snapshot, and buyer-role allow/deny tests pass with legacy-client compatibility checks | Keep buyer role disabled and retain committed `validate`-based buyer behavior | `["Security Owner"]` |

### 8.4 Verification Measurement Protocols

Deterministic protocol definitions:
- `data_loss_count`: number of intended offline mutations absent in final persisted state after replay.
- `duplicate_replay_count`: number of duplicated mutation effects after reconnect replay.
- `bulk_add_baseline`: median completion time from the committed manual-add flow using the same scripted item set as quick-input runs.
- `forecast_prediction_point`: one `(item, expected_date, predicted_date)` tuple used in precision scoring.
- `reminder_delivery_success_rate`: delivered due reminders divided by scheduled due reminders in the evaluated run set.
- `threshold_task`: one usability task where a participant configures, saves, and confirms a threshold control outcome.

### 8.5 Verification Owner Vocabulary (Canonical)

All `VerificationRule.owners[]` entries must use this exact controlled vocabulary:

```ts
export type VerificationOwner =
  | 'Product Owner'
  | 'Engineering Lead'
  | 'Security Owner'
  | 'UX Owner'
  | 'Product Analytics Owner'
  | 'Mobile Lead'
  | 'Web Lead'
  | 'Data Owner'
  | 'ML Owner'
  | 'Mobile Owner';
```

Naming rule:
- No aliases, abbreviations, or alternate spellings are allowed in `owners[]`.

## 9. UX Contract: Material 3 Expressive + Responsive Web

### 9.1 Design System Stack

Canonical stack:
- `react-native-paper` with MD3 theming as the single design-system source.
- Shared semantic tokens across Android and Web.
- No secondary UI framework for desktop web.

### 9.2 Platform Rule

- Android must use Material 3 Expressive components and motion behavior through MD3 primitives.
- Web must reuse the same semantic tokens and components, with layout adaptation by breakpoint.

### 9.3 Layout Interface

```ts
export type LayoutMode = {
  breakpoint: '<600' | '600-839' | '840-1199' | '>=1200';
  nav_pattern: 'bottom_tabs' | 'navigation_rail';
  workspace_pattern: 'single_pane' | 'two_pane';
  interaction_model: 'touch_first' | 'hybrid_touch_keyboard_mouse';
};
```

### 9.4 Breakpoint Contract

| Breakpoint | nav_pattern | workspace_pattern | interaction_model |
| --- | --- | --- | --- |
| `<600` | `bottom_tabs` | `single_pane` | `touch_first` |
| `600-839` | `bottom_tabs` | `single_pane` | `hybrid_touch_keyboard_mouse` |
| `840-1199` | `navigation_rail` | `single_pane` | `hybrid_touch_keyboard_mouse` |
| `>=1200` | `navigation_rail` | `two_pane` | `hybrid_touch_keyboard_mouse` |

Desktop default (`>=1200`):
- Left pane: persistent navigation rail and context controls.
- Right pane: Active Shopping workspace with two-pane composition.
- Desktop secondary pane allowed content in committed baseline:
  - selected item detail,
  - sync/offline status,
  - event/history context.
- Desktop secondary pane allowed actions in committed baseline:
  - safe quick actions `validate` and `undo`.
- Desktop secondary pane disallowed actions in committed baseline:
  - full item editing.
- Desktop secondary pane excluded content in committed baseline:
  - analytics widgets,
  - recommendation/insight dashboards.

### 9.5 Interaction Contract

- Mobile-first interactions must remain one-handed friendly.
- Web must support full keyboard path for add, validate, and state recovery actions.
- Pointer and keyboard interactions must produce the same state outcomes as touch interactions.

## 10. Finished Product Baseline

The product is finishable without optional modules when all committed scope is complete and all committed verification rules pass. Conditional and exploratory features may be cut without blocking release.

## 11. Product Terminology

Canonical terms:
- Household: collaboration boundary for users and data access.
- List types: `menus`, `recurrents`, `occasionals`, `custom`.
- Active Shopping view: merged and aisle-sorted view of `validated` items.
- Dedup key: normalized item name plus aisle key.
- Event log: immutable action history used for diagnostics and release verification evidence.

Naming rules:
- Use "Active Shopping" consistently for the shopper-facing merged view.
- Use "validate" for role-gated confirmation from `suggested` to `validated`.
- Avoid engineering terms in user-facing language (for example: say "auto-merge", not "dedup transaction").

## 12. Externalized Product Copy Policy

Default canonical language is English. French copy can exist as product string resources but does not change the canonical specification language.

## Appendix A: Operational Metrics (Non-Blocking)

These metrics are observability indicators only. They are not release gates.

- `ops.autocomplete_adoption`: track weekly trend in typeahead usage.
- `ops.suggestion_acceptance`: track weekly trend for suggestion usefulness.
- `ops.net_duplication_rate`: monitor duplicate row regressions over time.
- `ops.add_latency_p95`: monitor user-perceived responsiveness under load.
- `ops.offline_replay_success`: monitor field stability for reconnect cycles.
