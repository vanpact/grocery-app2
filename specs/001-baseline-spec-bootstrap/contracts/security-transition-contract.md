# Security Transition Contract (Committed Baseline)

## Policy Interface

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

## Committed Transition Rules

- `{ from: 'draft', to: 'suggested', allowed_roles: ['suggest', 'validate'] }`
- `{ from: 'suggested', to: 'validated', allowed_roles: ['validate'] }`
- `{ from: 'validated', to: 'bought', allowed_roles: ['validate'] }`
- `{ from: 'bought', to: 'validated', allowed_roles: ['validate'] }`

## Required Deny Cases

- `suggest` attempting validator-only transitions.
- Any cross-household read attempt.
- Any cross-household write attempt.
- Any operation without explicit allow rule.

## Verification Reference

- Release-blocking rule: `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT`.
