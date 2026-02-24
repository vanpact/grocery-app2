# Research: Quick Wins Bulk Add Packs and Recipes

## Decision 1: Keep Template Scope Household-Shared

- **Decision**: Pack/recipe templates for `GS-101` are household-shared.
- **Rationale**: Aligns collaborator expectations and avoids split template inventories per member for the same list context.
- **Alternatives considered**:
  - Member-private templates.
  - Dual mode (household + private), rejected as out-of-scope complexity for `GS-101`.

## Decision 2: Accept Positive Integer Multiplier Only

- **Decision**: Multiplier must be a positive integer (`1, 2, 3, ...`).
- **Rationale**: Guarantees deterministic quantity outcomes across units and avoids fractional normalization ambiguity.
- **Alternatives considered**:
  - Decimal multiplier support.
  - Unit-aware fractional policy per item type.

## Decision 3: Projection-Then-Confirm Flow With Fail-Closed Validation

- **Decision**: Bulk add uses preview projection before commit; confirm writes, cancel mutates nothing.
- **Rationale**: Maintains operator control and reduces accidental multi-item writes.
- **Alternatives considered**:
  - Immediate apply without preview.
  - Preview-only mode without one-action commit.

## Decision 4: Reuse Committed Dedup Merge Path

- **Decision**: Projected item commit reuses existing committed dedup merge behavior rather than creating parallel merge logic.
- **Rationale**: Prevents logic drift and preserves existing duplicate-protection semantics.
- **Alternatives considered**:
  - Dedicated quick-input merge implementation.
  - Post-insert dedup cleanup pass.

## Decision 5: Deterministic Timing Evidence via Scripted Run Sets

- **Decision**: `VR-CND-101-BULK-ADD-TIME` evidence is produced from scripted runs with fixed inputs and deterministic median calculation.
- **Rationale**: Gate decisions require repeatable measurement and auditability.
- **Alternatives considered**:
  - Manual stopwatch timing.
  - Ad hoc production telemetry-only comparisons.

## Decision 6: CI Authority for Gate Decision Recording

- **Decision**: Local timing runs are advisory; CI artifacts are authoritative for gate decision recording.
- **Rationale**: Matches release-hardening authority model and avoids publication ambiguity.
- **Alternatives considered**:
  - Local + CI equal authority.
  - Local-only operator authority.
