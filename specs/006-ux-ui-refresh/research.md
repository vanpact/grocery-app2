# Research: Cross-Platform UX/UI Refresh

## Decision 1: Scope Runtime UX Refresh to Web + Android

- **Decision**: Implement and verify this feature on Web and Android only; exclude iOS.
- **Rationale**: The clarified spec explicitly chose Web + Android scope, and the committed
  baseline and current evidence workflow are already aligned to those platforms.
- **Alternatives considered**:
  - Include iOS parity work in the same feature.
  - Keep iOS in scope but defer iOS verification evidence.

## Decision 2: Desktop (`>=1200`) Uses Two-Pane Workspace

- **Decision**: At `>=1200` viewport width, render a two-pane workspace.
- **Rationale**: This directly addresses scanability and dead-space issues reported in the
  baseline UI while remaining consistent with existing architecture guidance.
- **Alternatives considered**:
  - Keep single-pane with max-width tuning only.
  - Keep current full-width single-column behavior.

## Decision 3: Secondary Pane Is Context-Only

- **Decision**: Secondary desktop pane can show status/detail/history context but cannot host
  direct state-changing controls.
- **Rationale**: Context-only secondary pane improves orientation without introducing dual
  action surfaces that increase interaction ambiguity.
- **Alternatives considered**:
  - Allow limited actions (`validate`, `undo`) in secondary pane.
  - Allow full item actions in secondary pane.

## Decision 4: Narrow Screens Keep Wrapped Top Navigation

- **Decision**: For `<600`, keep top navigation as wrapped rows rather than switching to
  a bottom bar.
- **Rationale**: This matches clarified product direction while still allowing structured
  spacing/order rules to reduce accidental taps.
- **Alternatives considered**:
  - Replace with persistent bottom navigation.
  - Replace with horizontally scrollable top navigation.

## Decision 5: Accessibility Evidence Is Mandatory for Refreshed Screens

- **Decision**: Treat accessibility verification as required evidence for all refreshed
  screens: focus visibility, keyboard-only traversal (web), readable scaling, and touch
  target checks.
- **Rationale**: Accessibility quality is now an explicit success criterion (`SC-007`) and
  must be deterministic, not advisory.
- **Alternatives considered**:
  - Keep only baseline readability/tap-size checks.
  - Defer accessibility verification to a follow-up feature.

## Decision 6: Tool-Backed UI Evidence Uses `playwright` + `mobile-mcp`

- **Decision**: Use `playwright` for web flow captures and `mobile-mcp` for Android/mobile
  flow captures as mandatory evidence inputs for UI-affecting changes.
- **Rationale**: Constitution v1.1.0 now requires these tools for UI behavior changes,
  providing direct platform-surface evidence in addition to automated tests.
- **Alternatives considered**:
  - Use test-only evidence without runtime capture tools.
  - Use manual screenshots without tool-specific traceability.
