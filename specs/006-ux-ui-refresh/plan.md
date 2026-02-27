# Implementation Plan: Cross-Platform UX/UI Refresh

**Branch**: `006-ux-ui-refresh` | **Date**: 2026-02-24 | **Spec**: `specs/006-ux-ui-refresh/spec.md`  
**Input**: Feature specification from `/specs/006-ux-ui-refresh/spec.md`

## Summary

Refresh the committed UI experience for Web and Android only, with explicit behavior
decisions captured during clarification:
1. keep top navigation with wrapped rows on `<600`,
2. enforce two-pane desktop workspace at `>=1200`,
3. keep secondary desktop pane context-only (no direct state-changing controls), and
4. require explicit accessibility verification and tool evidence from `playwright` (web)
   and `mobile-mcp` (mobile).

This plan reuses existing UI/runtime contracts and verification infrastructure, limiting
changes to current committed screens (Sign In, Active Shopping, Overview, Settings) and
their supporting tests/evidence pipelines.

## Technical Context

**Language/Version**: TypeScript 5.7 (Expo runtime + Node.js verification scripts)  
**Primary Dependencies**: Expo, React Native, react-native-paper (MD3), Vitest, existing runtime contracts  
**Storage**: Existing Firestore-backed data model unchanged; evidence artifacts under `evidence/<release>/<gate>/<bundle>/`  
**Testing**: Vitest UX/contract/integration suites + explicit `playwright` and `mobile-mcp` UI evidence captures  
**Target Platform**: Web + Android (`<600`, `600-839`, `840-1199`, `>=1200`)  
**Project Type**: Mobile app repository with script-driven verification and release-readiness checks  
**Performance Goals**: Meet `SC-001..SC-007`, including `SC-002` (>=25% median flow-time improvement) and full responsive/accessibility evidence pass  
**Constraints**: No iOS scope, no domain/security model changes, preserve `suggest|validate`, deny-by-default, household isolation, and replay safety  
**Scale/Scope**: Four committed screens and their shared shell/components only

## Assumptions

- Existing committed UI tests and release verification scripts remain the baseline and are
  extended rather than replaced.
- Current data contracts and lifecycle transitions are unchanged by this feature.
- Web + Android evidence collection can be integrated in the same release-evidence workflow
  without introducing a new gate class.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Scope and simplicity are maintained by limiting work to existing committed screens
  and behavior contracts.
- PASS: Planned changes are surgical and focused on UI shell/layout/components plus tests
  and evidence outputs directly tied to this feature.
- PASS: Verification-first planning is explicit via measurable SC targets and deterministic
  evidence criteria.
- PASS: Canonical ownership boundaries are preserved across `specs/00`, `specs/10`,
  `specs/20`, and `specs/30`.
- PASS: Reliability/security invariants remain unchanged.
- PASS: UI verification alignment is explicit: web evidence via `playwright` and mobile
  evidence via `mobile-mcp`.

## Project Structure

### Documentation (this feature)

```text
specs/006-ux-ui-refresh/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-runtime-refresh-contract.md
│   └── ui-verification-evidence-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── App.tsx
├── src/
│   ├── runtime/
│   │   └── contracts.ts
│   └── ui/
│       ├── components/
│       │   └── StateFeedback.tsx
│       ├── layout/
│       │   ├── DesktopWorkspace.tsx
│       │   └── layoutModeResolver.ts
│       ├── screens/
│       │   ├── ActiveShoppingScreen.tsx
│       │   ├── CommittedScreens.tsx
│       │   ├── OverviewScreen.tsx
│       │   ├── SettingsScreen.tsx
│       │   └── SignInScreen.tsx
│       └── web/
│           └── interactionParity.ts
├── scripts/
│   ├── verify-full.ts
│   ├── verify-release-readiness.ts
│   └── lib/
│       ├── evidenceWriter.ts
│       ├── releaseReadinessRunner.ts
│       ├── runCommittedVerification.ts
│       ├── uiUsabilityEvaluation.ts
│       └── uiUsabilityReport.ts
├── tests/
│   ├── ux/
│   ├── integration/
│   ├── contract/
│   ├── security/
│   └── fixtures/usability/
└── package.json

evidence/
└── <release>/<gate>/<bundle>/
```

**Structure Decision**: Reuse the existing Expo UI/runtime/test structure and add only the
minimum contracts/evidence rules needed to enforce clarified UX behavior and verification.

## Phase 0: Research Plan

Produce `research.md` to lock implementation decisions that materially impact design:
- Web + Android-only scope and iOS exclusion handling,
- desktop two-pane behavior and context-only secondary pane policy,
- narrow-screen top-navigation wrapping policy,
- explicit accessibility evidence definition for SC-007,
- deterministic evidence expectations for `playwright` + `mobile-mcp` in committed checks.

## Phase 1: Design Plan

Produce:
- `data-model.md` describing UI behavior/evidence entities and validation rules,
- `contracts/ui-runtime-refresh-contract.md` for runtime navigation/layout/action rules,
- `contracts/ui-verification-evidence-contract.md` for tool-driven evidence requirements,
- `quickstart.md` for local validation + evidence workflow.

Run `.specify/scripts/bash/update-agent-context.sh codex` after artifact generation.

## Post-Design Constitution Re-check

- PASS: No scope creep beyond clarified UX/UI behavior for committed screens.
- PASS: Clarified layout/navigation behavior is explicit and testable.
- PASS: Accessibility and input-parity checks are measurable and deterministic.
- PASS: Required `playwright` and `mobile-mcp` evidence paths are codified.
- PASS: Canonical ownership boundaries and reliability/security invariants remain intact.

## Complexity Tracking

No constitution violations require complexity justification for this plan.
