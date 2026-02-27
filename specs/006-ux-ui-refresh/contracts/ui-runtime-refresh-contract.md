# UI Runtime Refresh Contract

## 1. Runtime Interface

```ts
export type RefreshedPlatform = 'web' | 'android';

export type RefreshedDestination =
  | 'sign-in'
  | 'active-shopping'
  | 'overview'
  | 'settings';

export type ViewportBand =
  | '<600'
  | '600-839'
  | '840-1199'
  | '>=1200';

export type NavigationPattern = 'top-wrapped' | 'top-single-row';
export type LayoutMode = 'single-pane' | 'two-pane';
export type SecondaryPaneMode = 'context-only' | 'n/a';

export type ScreenLayoutSnapshot = {
  platform: RefreshedPlatform;
  destination: RefreshedDestination;
  viewportBand: ViewportBand;
  navigationPattern: NavigationPattern;
  layoutMode: LayoutMode;
  secondaryPaneMode: SecondaryPaneMode;
  primaryActionIds: string[];
  stateChangingControlsOutsidePrimaryPane: boolean;
};
```

## 2. Platform Scope Rules

- This feature contract applies only to `web` and `android`.
- `ios` behavior is out of scope for this feature and must not block this plan's acceptance.

## 3. Navigation Rules

- Committed destinations must remain reachable from top navigation.
- At `<600`, navigation pattern must be `top-wrapped`.
- Destination selection state must remain unmistakable after each route transition.

## 4. Layout Rules

- At `>=1200`, `layoutMode` must be `two-pane`.
- At `>=1200`, `secondaryPaneMode` must be `context-only`.
- Any state-changing control rendered outside the primary pane at `>=1200` is invalid.

## 5. Action Hierarchy Rules

- Each task block must expose exactly one dominant primary action.
- Secondary and destructive actions must remain visually and semantically distinct.
- Overlapping/ambiguous action copy in the same screen context is invalid.
- Primary controls must expose explicit feedback states: `idle`, `focused`, `pressed`, `disabled`.

## 6. State and Recovery Rules

- Status and recovery cues must remain explicit and non-duplicative.
- Recovery actions must match current committed runtime/state policies.
- Removal of required state visibility for empty/loading/error/offline conditions is invalid.

## 7. Invariant Rules

- Role policy remains `suggest|validate`.
- Household isolation remains enforced.
- Offline replay semantics and duplicate protections remain unchanged.
