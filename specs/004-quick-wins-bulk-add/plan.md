# Implementation Plan: Quick Wins Bulk Add Packs and Recipes

**Branch**: `004-quick-wins-bulk-add` | **Date**: 2026-02-24 | **Spec**: `specs/004-quick-wins-bulk-add/spec.md`
**Input**: Feature specification from `/specs/004-quick-wins-bulk-add/spec.md`

## Summary

Deliver `GS-101` as a conditional quick-win path that applies household-shared pack/recipe
templates with deterministic positive-integer multipliers and committed dedup merge reuse.
The implementation will add:
1. projection and apply flow for pack/recipe bulk add,
2. deterministic validation and fail-closed guardrails,
3. timing evidence generation for `VR-CND-101-BULK-ADD-TIME`, and
4. gate-evidence compatibility for `G-QW-01` without affecting committed baseline behavior.

## Technical Context

**Language/Version**: TypeScript 5.7 (Expo/React Native + Node.js 22.x scripts)  
**Primary Dependencies**: Existing app runtime modules, optional-module gate controls, evidence writer path, Vitest test stack  
**Storage**: Existing household/list/item records in Firestore contract; gate evidence artifacts under `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/`  
**Testing**: Vitest unit/integration/contract tests + deterministic timing-evidence checks for quick-input verification  
**Target Platform**: Expo Android/Web runtime for feature behavior, local/CI script execution for evidence generation  
**Project Type**: Mobile app repository with operational verification scripts and gate evidence artifacts  
**Performance Goals**: Meet `VR-CND-101-BULK-ADD-TIME` threshold (`>= 25%` median improvement over baseline across `>= 10` scripted runs)  
**Constraints**: Positive integer multiplier only; household-shared templates; fail closed on invalid input; no committed security invariant changes; optional feature remains gate-controlled  
**Scale/Scope**: `GS-101` only (no `GS-102` or `GS-105` in this feature)

## Assumptions

- Existing committed add flow (`addItemWithDedup`) remains the baseline merge authority.
- Quick-input module activation remains controlled through optional gate decisions.
- Timing-evidence generation can run deterministically from scripted fixture-driven runs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Scope is minimal and constrained to `GS-101` behavior and gate evidence requirements.
- PASS: Planned changes are surgical across quick-input runtime path, timing evidence scripts, and docs/contracts.
- PASS: Verification-first remains explicit with deterministic multiplier and timing-evidence acceptance criteria.
- PASS: Canonical ownership remains in `specs/00`, `specs/10`, `specs/20`, and `specs/30`.
- PASS: Security/reliability invariants remain unchanged (`suggest|validate`, deny-by-default, household isolation, replay safety).

## Project Structure

### Documentation (this feature)

```text
specs/004-quick-wins-bulk-add/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── bulk-add-runtime-contract.md
│   └── quick-wins-gate-evidence-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── src/
│   ├── features/
│   │   └── optionalModuleGuards.ts
│   ├── items/
│   │   ├── dedupKey.ts
│   │   ├── itemWriteService.ts
│   │   ├── quickTemplateRepository.ts
│   │   ├── quickWinsApplyService.ts
│   │   ├── quickWinsProjection.ts
│   │   ├── quickWinsService.ts
│   │   └── quickWinsValidation.ts
│   └── types.ts
├── scripts/
│   ├── verify-quick-wins.ts
│   └── lib/
│       ├── evidenceWriter.ts
│       ├── quickWinsTimingEvaluation.ts
│       └── quickWinsTimingReport.ts
├── tests/
│   ├── contract/
│   ├── integration/
│   └── security/
└── package.json

evidence/
└── <release>/G-QW-01/EV-QW-BULK-ADD/
```

**Structure Decision**: Reuse current app/service/script boundaries and add only the minimum
new quick-input domain logic and verification wiring needed for `GS-101`.

## Phase 0: Research Plan

Research output in `research.md` resolves:
- template ownership scope behavior,
- multiplier determinism policy,
- projection merge semantics with committed dedup behavior,
- deterministic timing evidence protocol and CI authority model.

## Phase 1: Design Plan

Design artifacts to produce:
- `data-model.md` for template, projection, bulk-apply outcome, and timing-run entities,
- `contracts/bulk-add-runtime-contract.md` for runtime validation and merge behavior,
- `contracts/quick-wins-gate-evidence-contract.md` for verification evidence and gate decision inputs,
- `quickstart.md` for operator and CI flow from feature run to `G-QW-01` evidence bundle.

## Post-Design Constitution Re-check

- PASS: Design preserves conditional-module fail-closed behavior and keeps committed path untouched.
- PASS: No speculative extensibility beyond `GS-101` is introduced.
- PASS: Deterministic requirements for quantity computation and timing measurement are explicit.
- PASS: Canonical spec ownership boundaries remain intact.

## Complexity Tracking

No constitution violations require complexity justification for this plan.
