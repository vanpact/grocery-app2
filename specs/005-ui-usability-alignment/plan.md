# Implementation Plan: UI Usability Alignment

**Branch**: `005-ui-usability-alignment` | **Date**: 2026-02-24 | **Spec**: `specs/005-ui-usability-alignment/spec.md`  
**Input**: Feature specification from `/specs/005-ui-usability-alignment/spec.md`

## Summary

Align committed UI behavior with the canonical UX contract so the product is usable on Android
and Web across Sign-in, Active Shopping, Overview, and Settings. The plan focuses on:
1. restoring deterministic navigation and screen usability across committed destinations,
2. standardizing state feedback and recovery actions,
3. enforcing responsive and keyboard/pointer parity expectations, and
4. producing deterministic usability evidence for SC-006/SC-007 and propagating SC-008
   release-blocking semantics through committed readiness evaluation.

## Technical Context

**Language/Version**: TypeScript 5.7 (Expo React Native runtime + Node.js verification scripts)  
**Primary Dependencies**: Expo, React Native, react-native-paper (MD3), existing UI/runtime modules, Vitest  
**Storage**: No new runtime datastore; release evidence artifacts under `evidence/<release>/<gate>/<bundle>/`  
**Testing**: Vitest UX/integration/contract suites + deterministic usability evidence checks  
**Target Platform**: Expo Android and responsive Web (`<600`, `600-839`, `840-1199`, `>=1200`)  
**Project Type**: Mobile app repository with script-based verification and release evidence contracts  
**Performance Goals**: `SC-006` (>=90% core add+validate completion <=90 seconds) + pass `VR-COM-005/008/009/010`  
**Constraints**: Preserve committed role/security/replay invariants; no scope expansion beyond committed UI usability alignment; fail closed on missing/invalid usability evidence  
**Scale/Scope**: All committed screens only (Sign-in, Active Shopping, Overview, Settings); no optional/exploratory tracks

## Assumptions

- Existing committed domain behavior remains authoritative; this feature changes usability surface, not domain invariants.
- Existing committed UX verifications remain release-blocking and are extended with SC-006/SC-007 evidence semantics from the feature spec.
- Deterministic usability timing can be captured from fixture-driven task runs across Android and Web in the same release candidate.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Scope is minimal and strictly limited to committed UI usability alignment outcomes.
- PASS: Planned code touches are surgical in existing UI modules, UX tests, and verification evidence wiring.
- PASS: Verification-first remains explicit through deterministic UX acceptance and measurable SC-006/SC-007 targets.
- PASS: Canonical ownership remains in `specs/00`, `specs/10`, `specs/20`, and `specs/30`.
- PASS: Security and reliability invariants remain unchanged (`suggest|validate`, deny-by-default, household isolation, replay safety).

## Project Structure

### Documentation (this feature)

```text
specs/005-ui-usability-alignment/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-runtime-usability-contract.md
│   └── ui-usability-evidence-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── App.tsx
├── src/
│   ├── ui/
│   │   ├── components/
│   │   │   └── StateFeedback.tsx
│   │   ├── layout/
│   │   │   ├── DesktopWorkspace.tsx
│   │   │   └── layoutModeResolver.ts
│   │   ├── screens/
│   │   │   ├── ActiveShoppingScreen.tsx
│   │   │   ├── CommittedScreens.tsx
│   │   │   ├── OverviewScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── SignInScreen.tsx
│   │   └── web/
│   │       └── interactionParity.ts
│   └── runtime/
│       └── contracts.ts
├── scripts/
│   ├── verify-full.ts
│   ├── verify-release-readiness.ts
│   └── lib/
│       ├── releaseReadinessRunner.ts
│       ├── runCommittedVerification.ts
│       ├── uiUsabilityEvaluation.ts
│       └── uiUsabilityReport.ts
├── tests/
│   ├── ux/
│   ├── integration/
│   └── contract/
└── package.json

evidence/
└── <release>/<gate>/<bundle>/
```

**Structure Decision**: Reuse existing UI/runtime/test structure and extend only the minimum
modules needed to restore usability contract compliance and deterministic evidence capture.

## Phase 0: Research Plan

Research output in `research.md` resolves:
- deterministic navigation and state-recovery contract boundaries,
- operational definition for SC-006/SC-007 timing evidence,
- responsive and input-parity enforcement approach without adding new feature scope,
- release-blocking decision semantics when usability targets fail.

## Phase 1: Design Plan

Design artifacts to produce:
- `data-model.md` for screen-surface, state-feedback, responsive/parity, and usability evidence entities,
- `contracts/ui-runtime-usability-contract.md` for runtime UX behavior and recovery-action contract,
- `contracts/ui-usability-evidence-contract.md` for deterministic task-run evidence and release-readiness decision semantics,
- `quickstart.md` for local UX validation and release evidence workflow.

## Post-Design Constitution Re-check

- PASS: Design remains committed UX alignment only and avoids speculative abstractions.
- PASS: Recovery-action and viewport behavior contracts are explicit and testable.
- PASS: Evidence strategy is deterministic and fail-closed for release readiness integration.
- PASS: No ownership conflicts introduced across canonical docs or invariant policies.

## Complexity Tracking

No constitution violations require complexity justification for this plan.
