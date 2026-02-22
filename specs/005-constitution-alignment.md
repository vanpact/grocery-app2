# 005 Constitution Alignment

Parsed from the Spec Kit `spec-template.md` Constitution Alignment section.

## Source Mapping

- `.specify/memory/constitution.md`
- `specs/00-product-spec.md`
- `specs/10-roadmap-and-gates.md`
- `specs/20-architecture-contracts.md`
- `specs/30-backlog-and-validation.md`

## CA-001 Assumptions and Ambiguities

- Assumption: existing `specs/00`, `10`, `20`, and `30` remain canonical and this parse layer is
  derivative documentation.
- Assumption: committed baseline remains Expo React Native (Android + Web) with Firebase Auth and
  Firestore.
- Ambiguity noted: feature-specific branch metadata from the Spec Kit single-feature template is
  not represented because current docs are product-baseline canonical docs.

## CA-002 Minimal In-Scope and Explicit Out-of-Scope

- In scope:
  - committed MVP baseline (`M0`, `M1`) with security, offline replay, dedup, and required UX
    state behavior.
- Out of scope for committed baseline:
  - OCR, voice, forecasting, advanced integrations, and other gate-controlled optional modules.

## CA-003 Canonical Ownership Mapping

- `specs/00-product-spec.md` owns product definitions, lifecycle, verification semantics, and UX
  invariants.
- `specs/10-roadmap-and-gates.md` owns milestone order, gate registry, and cut policy.
- `specs/20-architecture-contracts.md` owns architecture, data contracts, sync/security contracts,
  and module boundaries.
- `specs/30-backlog-and-validation.md` owns story decomposition, field tests, and release execution
  validation.

This parsed set does not redefine ownership; it organizes the same content into Spec Kit section
shapes.

## CA-004 Deterministic Verification Expectations

- All committed success outcomes are tied to explicit pass/fail rules (`VR-COM-*`) with measurable
  comparator or boolean conditions.
- Release readiness requires committed verification rules to pass, with
  `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` mandatory.
- Optional outcomes are gate-controlled; failed gate decisions require immediate cut/disable
  fallback without blocking committed release status.
