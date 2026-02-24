# Implementation Plan: Baseline Release Hardening

**Branch**: `003-release-hardening` | **Date**: 2026-02-23 | **Spec**: `specs/003-release-hardening/spec.md`
**Input**: Feature specification from `/specs/003-release-hardening/spec.md`

## Summary

Deliver a release-hardening workflow that determines baseline release readiness from
pre-generated committed verification outputs and canonical evidence artifacts, with CI as the
only authoritative decision source. The plan adds:
1. a deterministic release-readiness evaluation contract and report,
2. strict evidence and approval freshness validation,
3. committed field-test coverage enforcement, and
4. fail-closed CI publication blocking for `not_ready` outcomes.

## Technical Context

**Language/Version**: TypeScript 5.7 (Node.js 22.x script runtime)  
**Primary Dependencies**: Existing runner stack (`tsx`, Vitest, ESLint), evidence artifacts from runnable verification, CI runner integration  
**Storage**: File-based evidence bundles under `evidence/<release>/<gate_id>/<bundle_id>/`  
**Testing**: Vitest contract/integration suites plus deterministic release-readiness fixture checks  
**Target Platform**: Local operator shell (advisory preview) and CI pipeline (authoritative decision)  
**Project Type**: Mobile app repository with operational verification scripts and release automation  
**Performance Goals**: Full release-readiness report generated in <=10 minutes; same-input reruns produce identical status and blocking reasons  
**Constraints**: Committed-only default scope; approvals must be <=24h old; CI decision authoritative; `not_ready` blocks publication; fail-closed on missing/malformed evidence  
**Scale/Scope**: Baseline release hardening for committed verification set (`VR-COM-001..010`) and committed field-test scenarios only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Scope is minimal and release-focused; no net-new product behavior is introduced.
- PASS: Planned changes are surgical: script interfaces, CI gate behavior, and release docs.
- PASS: Verification-first remains explicit with deterministic `ready/not_ready` criteria.
- PASS: Canonical ownership boundaries remain in `specs/00`, `specs/10`, `specs/20`, and `specs/30`.
- PASS: Security and reliability invariants remain unchanged (`suggest|validate`, deny-by-default, household isolation, replay safety).

## Project Structure

### Documentation (this feature)

```text
specs/003-release-hardening/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── release-readiness-contract.md
│   └── ci-enforcement-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── scripts/
│   ├── verify-full.ts
│   ├── verify-quick.ts
│   └── lib/
├── tests/
│   ├── contract/
│   ├── integration/
│   └── security/
└── package.json

evidence/
└── <release>/<gate_id>/<bundle_id>/

specs/
├── 00-product-spec.md
├── 10-roadmap-and-gates.md
├── 20-architecture-contracts.md
└── 30-backlog-and-validation.md

.github/
└── workflows/                 # authoritative CI release gate workflow (to be added)
```

**Structure Decision**: Keep the existing single-repo operational model and extend only release
validation scripts, CI gate wiring, and release documentation. No new service boundary or storage
system is introduced.

## Phase 0: Research Plan

Research output in `research.md` resolves high-impact decisions for:
- authoritative input source and decision channel,
- approval freshness policy,
- default scope behavior,
- publication blocking semantics,
- deterministic readiness reporting expectations.

## Phase 1: Design Plan

Design artifacts to produce:
- `data-model.md` for release candidate, evidence, approvals, field-test coverage, and readiness report entities,
- `contracts/release-readiness-contract.md` for command/report and fail-closed decision rules,
- `contracts/ci-enforcement-contract.md` for CI authority, publication block, and artifact handoff,
- `quickstart.md` for operator preview and CI execution flow.

## Post-Design Constitution Re-check

- PASS: Design remains release-hardening only and avoids speculative abstractions.
- PASS: Contracts keep committed checks authoritative and optional scope explicitly non-blocking by default.
- PASS: Fail-closed behavior and publication blocking are deterministic and auditable.
- PASS: No ownership conflicts introduced across canonical specification files.

## Complexity Tracking

No constitution violations require complexity justification for this plan.
