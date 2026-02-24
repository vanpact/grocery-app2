# UI Runtime Usability Contract

## 1. Runtime Interface

```ts
export type CommittedDestination =
  | 'sign-in'
  | 'active-shopping'
  | 'overview'
  | 'settings';

export type FeedbackState =
  | 'empty'
  | 'loading'
  | 'error'
  | 'offline'
  | 'membership-required';

export type RecoveryAction =
  | 'retry'
  | 'continue'
  | 'retry_connection'
  | 'retry_membership'
  | 'sign_out';

export type RecoveryActionContract = {
  error: ['retry'];
  offline: ['continue', 'retry_connection'];
  'membership-required': ['retry_membership', 'sign_out'];
};

export type ScreenUsabilitySnapshot = {
  destination: CommittedDestination;
  state: FeedbackState;
  primaryActions: string[];
  recoveryActions: RecoveryAction[];
  hasSilentFailure: boolean;
  viewportWidth: number;
  layoutMode: 'mobile' | 'tablet' | 'desktop-two-pane';
};
```

## 2. Navigation and Destination Rules

- Runtime shell must expose all committed destinations.
- No destination may be reachable only through hidden or non-obvious controls.
- Navigation behavior must remain stable across route transitions and resume events.

## 3. State Feedback and Recovery Rules

- `empty`, `loading`, `error`, `offline`, and `membership-required` states must render explicit feedback.
- `error`, `offline`, and `membership-required` states must expose recovery actions matching the fixed contract.
- Any state rendering that lacks required message or action is invalid.

## 4. Responsive and Desktop Rules

- Viewport handling must satisfy `<600`, `600-839`, `840-1199`, and `>=1200` contracts.
- At `>=1200`, desktop two-pane composition must preserve primary-task usability.
- Secondary pane behavior must not block committed primary task completion.

## 5. Web Input Parity Rules

- Keyboard-only and pointer flows must be available for committed add/validate/offline-recovery actions.
- Equivalent keyboard/pointer scenarios must produce equivalent persisted outcomes.

## 6. Invariant Rules

- Role model remains `suggest|validate`.
- Household isolation remains enforced.
- Offline replay determinism and duplicate protections remain unchanged.
