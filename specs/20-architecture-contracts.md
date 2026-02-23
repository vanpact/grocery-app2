# Grocery App Architecture Contracts

## Source of Truth Map

This file owns:
- System architecture boundary and component responsibilities.
- Core vs optional module contracts.
- Data contracts for Firestore entities.
- Sync, conflict, and security invariants.
- UI architecture contract for Material 3 Expressive and responsive web composition.
- Operational event and observability contracts.

This file does not own:
- Product goals, lifecycle definitions, verification rules, and UX invariants (owned by [00-product-spec.md](./00-product-spec.md)).
- Roadmap sequencing and gate decisions (owned by [10-roadmap-and-gates.md](./10-roadmap-and-gates.md)).
- Story decomposition and field test execution (owned by [30-backlog-and-validation.md](./30-backlog-and-validation.md)).

## 1. Architecture Boundary

### 1.1 Core Required Path (`committed`)

Core path required for finished product baseline:
- Client: Expo React Native app targeting Android and Web.
- Identity and realtime data: Firebase Auth + Firestore.
- Collaboration and reliability: role checks, offline persistence, event logging.

### 1.2 Optional Modules (Gate-Controlled)

Optional modules are outside the core required path:
- Suggestion service APIs.
- OCR extraction.
- Voice input.
- Forecasting and third-party integrations.

Fail-closed rule:
- Optional modules can be disabled at runtime or release-time without breaking committed product flows.

## 2. Context Diagram

```text
Users (Buyer / Validator / Contributor)
  -> Expo Client (Android + Web)
      -> Firebase Auth (identity)
      -> Firestore (lists, items, events, memberships, stores)

Optional extension path after gate approval:
Expo Client <-> Suggestion/OCR/Voice/Forecast Services
```

## 3. Core Component Contracts

| Component | Responsibility | Required for finished baseline |
| --- | --- | --- |
| Expo client | UI flows, optimistic interaction, offline queueing behavior | Yes |
| Firebase Auth | Sign-in identity and user session | Yes |
| Firestore | Source of truth for household/list/item/event data | Yes |
| Firestore Rules | Access control and role enforcement | Yes |
| Optional service APIs | Suggestions, OCR, voice, forecasting, integrations | No |

## 4. UI Architecture Contract

### 4.1 Theming and Design System

- `react-native-paper` MD3 theme is the canonical token source.
- Semantic design tokens (`color`, `typography`, `shape`, `spacing`, `motion`) are shared across Android and Web.
- Component-level hardcoded colors and ad hoc spacing scales are not allowed in committed flows.

### 4.2 Component Mapping Contract

| Semantic UI block | Canonical MD3 primitive family |
| --- | --- |
| App shell and top bars | `Appbar`, `Surface`, `NavigationBar`/`NavigationRail` |
| Item rows and state indicators | `List.Item`, `Checkbox`, `Icon`, `Badge` |
| Suggestions and quick actions | `Chip` (`Assist`/`Suggestion` style mapping) |
| Confirmations and destructive actions | `Dialog`, `Button` |
| Offline/error feedback | `Banner`, `Snackbar` |

### 4.3 Platform Adaptation Contract

- Same semantic components on Android and Web; only layout composition changes by breakpoint.
- Android follows Material 3 Expressive motion and component affordances.
- Web keeps semantic parity while supporting keyboard and pointer-first navigation.

### 4.4 Large-Screen Web Composition Contract (`>=1200`)

- Navigation rail is persistent on the left edge.
- Workspace is two-pane by default:
  - Primary pane: Active Shopping sections and item operations.
  - Secondary pane: selected item detail, sync/offline state, and event/history context only.
- Secondary pane interaction policy in committed baseline:
  - Allowed actions: `validate`, `undo`.
  - Disallowed actions: full item editing.
- Secondary pane excluded content in committed baseline:
  - analytics widgets,
  - recommendation/insight dashboards.
- Workspace density rules:
  - Minimum interactive row height equivalent to touch-safe targets.
  - Increased horizontal spacing scale at desktop breakpoints.
- Width constraints:
  - Avoid unconstrained full-width lists.
  - Apply max content width per pane to preserve scanability.

## 5. Core Product Flows (Required)

All required flows must work without optional modules.

1. Account and household bootstrapping:
- User signs in.
- Household and membership context are resolved.

2. Item add and merge:
- User adds an item.
- Write path normalizes name and dedup key.
- If duplicate key exists, quantity and metadata are merged.

3. Validation and shopping:
- Validator promotes items to `validated`.
- Active Shopping view renders aisle-ordered validated items only.
- Shopping completion transitions (`validated -> bought`) are authorized by `validate` role in committed MVP.

4. Offline and recovery:
- Mutations queue when offline.
- Sync replay restores intended state without net duplicates.

5. Collaboration history:
- Item actions capture actor and timestamp evidence.
- Event log supports diagnostics and verification evidence.

## 6. Data Contracts (Firestore)

Lifecycle states are canonical in [00-product-spec.md](./00-product-spec.md). This file references but does not redefine them.

### 6.1 Collections

`households/{householdId}`
- `name: string`
- `createdBy: string`
- `createdAt: timestamp`
- `updatedAt: timestamp`

`memberships/{householdId_userId}`
- `householdId: string`
- `userId: string`
- `role: 'suggest' | 'validate'`
- `createdAt: timestamp`
- `updatedAt: timestamp`

`stores/{storeId}`
- `householdId: string`
- `name: string`
- `aisleOrder: string[]`
- `createdAt: timestamp`
- `updatedAt: timestamp`

`lists/{listId}`
- `householdId: string`
- `type: 'menus' | 'recurrents' | 'occasionals' | 'custom'`
- `name: string`
- `recurrence: 'weekly' | 'monthly' | 'manual' | null`
- `storeId: string | null`
- `createdAt: timestamp`
- `updatedAt: timestamp`

`lists/{listId}/items/{itemId}`
- `householdId: string`
- `name: string`
- `nameSlug: string`
- `qty: number | null`
- `unit: string | null`
- `tags: string[]`
- `aisleKey: string | null`
- `status: string` (must be one of canonical lifecycle states)
- `suggestedBy: string | null`
- `validatedBy: string | null`
- `version: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`

`events/{eventId}`
- `householdId: string`
- `type: 'add' | 'merge' | 'validate' | 'toggle' | 'suggest_accept' | 'suggest_reject' | 'reminder' | 'undo' | 'error_retry'`
- `ref: map | null`
- `payload: map`
- `at: timestamp`

## 7. Sync and Conflict Invariants

- Source of truth is Firestore server state.
- Conflict resolution baseline is last-write-wins by server timestamp.
- Write paths must be idempotent where practical.
- Item add must execute dedup merge logic by `dedup_key = nameSlug + '#' + aisleKey`.
- Toggle operations should write explicit target state, not inverse toggles.
- Offline replay must preserve user intent and avoid duplicate rows.

## 8. Security Contract Summary

### 8.1 Security Policy (Canonical Interface)

```ts
export type SecurityPolicy = {
  auth_provider: 'firebase_auth';
  roles: ['suggest', 'validate'];
  household_isolation: 'required';
  default_decision: 'deny';
};

export type SecurityTransitionRule = {
  from: 'draft' | 'suggested' | 'validated' | 'bought';
  to: 'draft' | 'suggested' | 'validated' | 'bought';
  allowed_roles: ('suggest' | 'validate')[];
};
```

Committed policy baseline:
- Auth identity source is Firebase Auth.
- Committed roles remain `suggest` and `validate`.
- Buyer persona actions in committed MVP operate through `validate` role policy.
- Non-explicitly allowed operations are denied.

### 8.2 Authorization Matrix

| Operation | `suggest` | `validate` | Notes |
| --- | --- | --- | --- |
| Read household-scoped lists/items/events | Allow | Allow | Membership in same household required |
| Add or edit item within same household | Allow | Allow | Standard collaboration write path |
| Transition `draft -> suggested` | Allow | Allow | Requires explicit user confirmation |
| Transition `suggested -> validated` | Deny | Allow | Validator-controlled transition |
| Transition `validated -> bought` | Deny | Allow | Shopping completion |
| Transition `bought -> validated` | Deny | Allow | Correction/undo |
| Cross-household read | Deny | Deny | Strict household isolation |
| Cross-household write | Deny | Deny | Strict household isolation |

### 8.3 Lifecycle Transition Authorization

Canonical transition authorization rules for committed MVP:
- `{ from: 'draft', to: 'suggested', allowed_roles: ['suggest', 'validate'] }`
- `{ from: 'suggested', to: 'validated', allowed_roles: ['validate'] }`
- `{ from: 'validated', to: 'bought', allowed_roles: ['validate'] }`
- `{ from: 'bought', to: 'validated', allowed_roles: ['validate'] }`

### 8.4 Household Isolation and Deny-by-Default

- All document access must be constrained to the authenticated user household membership.
- Any missing allow rule must evaluate to deny.
- Sensitive operations (role-escalation and cross-household access) are denied by default.
- Event records are append-only from the client perspective.

### 8.5 Security Validation Minimums

Minimum required security evidence for committed release:
- Emulator rule tests for allow paths in same-household collaboration.
- Emulator rule tests for deny paths:
  - `suggest` attempting validator-only transitions,
  - cross-household read attempts,
  - cross-household write attempts.
- Security evidence bundle must include:
  - emulator test output,
  - role-operation policy matrix,
  - failed-attempt deny logs for required deny cases.

Release rule:
- Release is blocked if `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` fails.

### 8.6 Compatibility Rule for Exploratory Buyer Role

- If a `buyer` role is introduced in exploratory milestones, it must be additive and explicitly versioned in security rules and migration notes.
- Migration contract for exploratory buyer role is `memberships.v1 -> memberships.v2`, with rollback snapshot support and legacy-client compatibility preserved for committed flows.

## 9. Optional Module Contracts (Post-Gate)

| Module | Gate dependency | Contract if enabled | Fallback if disabled |
| --- | --- | --- | --- |
| Suggestions API | `G-SUG-01`, `G-SUG-02` | Return ranked suggestions with bounded latency | Use local typeahead only |
| OCR API | `G-OCR-01` | Return parsed item candidates with confidence | Manual entry and paste-text correction |
| Voice parser | `G-VOICE-01` | Convert speech to structured add commands | Typed input only |
| Migration heuristics | `G-MIG-01` | Suggest occasional-to-recurrent moves | Manual list curation only |
| Forecasting | `G-FORE-01` | Produce next-buy estimates per item | Manual recurrence reminders only |
| Integrations | `G-INT-01` | Sync to external systems with retry contract | No external sync |

## 10. Observability Contract

Required event coverage for committed flows:
- `add`
- `merge`
- `validate`
- `toggle`
- `undo`
- `error_retry`

Optional event coverage when modules are enabled:
- `suggest_accept`
- `suggest_reject`
- `reminder`

Operational requirements:
- Events must include `householdId` and timestamp.
- Diagnostics must support tracing a failed offline replay sequence.
- Verification reporting must source evidence from event data and state snapshots.

## 11. Compatibility and Evolution Rules

- Additive schema changes first, migration second.
- New optional fields must not break old clients.
- Optional modules cannot introduce required dependencies into committed flows.
