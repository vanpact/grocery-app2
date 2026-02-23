# Security Transition Contract (Committed Baseline)

## Policy Interface

```ts
export type SecurityPolicy = {
  auth_provider: 'firebase_auth';
  roles: ['suggest', 'validate'];
  actor_authority: 'membership_only';
  household_isolation: 'required';
  default_decision: 'deny';
};

export type SecurityTransitionRule = {
  from: 'draft' | 'suggested' | 'validated' | 'bought';
  to: 'draft' | 'suggested' | 'validated' | 'bought';
  allowed_roles: ('suggest' | 'validate')[];
};

export type TransitionOutcome = {
  decision: 'allowed' | 'transition_not_allowed' | 'household_mismatch' | 'noop';
  mutates_state: boolean;
};
```

## Committed Transition Rules

- `{ from: 'draft', to: 'suggested', allowed_roles: ['suggest', 'validate'] }`
- `{ from: 'suggested', to: 'validated', allowed_roles: ['validate'] }`
- `{ from: 'validated', to: 'bought', allowed_roles: ['validate'] }`
- `{ from: 'bought', to: 'validated', allowed_roles: ['validate'] }`

## Transition Outcome Semantics

- `allowed`: transition rule exists and actor role/household checks pass; `mutates_state = true`.
- `transition_not_allowed`: requested transition has no allow rule for actor role; `mutates_state = false`.
- `household_mismatch`: actor household does not match target household; `mutates_state = false`.
- `noop`: requested transition equals current state; `mutates_state = false`.

## Actor Scope Rules

- Lifecycle mutations are authoritative only for authenticated household members with roles `suggest|validate`.
- Service/system actors MUST route through the same role and household authorizer and MUST NOT bypass deny-by-default policy.

## Household Isolation Surfaces

- Isolation applies to:
  - document-level reads/writes
  - aggregate queries
  - event-stream subscriptions
- Any cross-household access attempt on any surface is denied.

## Required Deny Cases

- `suggest` attempting validator-only transitions.
- Any cross-household read attempt.
- Any cross-household write attempt.
- Any cross-household aggregate query or event-stream subscription.
- Any service/system bypass attempt outside role-bound policy.
- Any operation without explicit allow rule.
- Any auth-success session without resolved membership.

## Verification Reference

- Release-blocking rule: `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.
- Additional committed rules: `VR-COM-012-TRANSITION-OUTCOME-SEMANTICS`, `VR-COM-016-HOUSEHOLD-ISOLATION-QUERY-SURFACES`, `VR-COM-023-ACTOR-SCOPE-ENFORCEMENT`.
