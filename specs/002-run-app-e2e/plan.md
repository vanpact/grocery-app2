# Implementation Plan: Grocery App Runnable End-to-End Online Firebase Baseline

**Branch**: `002-run-app-e2e` | **Date**: 2026-02-23 | **Spec**: `specs/002-run-app-e2e/spec.md`
**Input**: Feature specification from `/specs/002-run-app-e2e/spec.md`

## Summary

Deliver a runnable Expo Android app path (emulator + physical phone) that uses an online
Firebase project by default (non-production), with explicit setup/verification commands and
deterministic evidence output. The implementation will add:
1. startup wrappers that run quick health checks before launching the app,
2. online Firestore/Auth setup scripts with non-destructive default behavior,
3. explicit destructive and account-provision modes with operator confirmations, and
4. a full verification command that is separate from startup and emits evidence artifacts.

## Technical Context

**Language/Version**: TypeScript 5.7 (app/test code) and Node.js 22.x for setup/verification scripts  
**Primary Dependencies**: Expo 52, React Native 0.76, React 18, Firebase JS SDK 11, react-native-paper 5, Vitest 2, plus `firebase-admin` for online setup/provision scripts  
**Storage**: Online Firebase Firestore + Firebase Auth (multi-project targets, default non-production target)  
**Testing**: Vitest contract/integration/security/ux suites plus explicit runtime quick-check and full verification command outputs  
**Target Platform**: Android emulator and physical Android phone for runnable baseline flows; browser-target support remains out of scope for this feature  
**Project Type**: Cross-platform mobile app with local operator scripts for environment setup and verification  
**Performance Goals**: Startup quick-check completes in under 2 minutes (`SC-009`), interactive workspace reachable in under 15 minutes from clean checkout (`SC-001`), and existing committed latency budgets remain (`action p95 <= 300ms`, route transition `<= 500ms`)  
**Constraints**: No mock/local DB emulator for runnable mode; explicit confirmation required for non-default project targeting and destructive reset; auth account creation only in explicit provision mode; preserve committed security invariants and offline replay safety  
**Scale/Scope**: Feature scope is runnable baseline closure for `FR-001` through `FR-026`, including setup, startup, verification, and evidence capture paths without adding net-new product features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Scope and simplicity are preserved. This plan closes runnable and operational gaps only.
- PASS: Change surface is surgical: app runtime bootstrap, online setup scripts, verification scripts, and feature docs.
- PASS: Verification-first is explicit through quick-check vs full verification command contracts and evidence requirements.
- PASS: Ownership boundaries remain aligned with `specs/00`, `specs/10`, `specs/20`, and `specs/30`.
- PASS: Security/reliability invariants (`suggest|validate`, deny-by-default, household isolation, replay safety) are unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/002-run-app-e2e/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── runtime-and-setup-contract.md
│   └── verification-execution-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── src/
│   ├── auth/
│   ├── events/
│   ├── features/
│   ├── households/
│   ├── items/
│   ├── lists/
│   ├── shopping/
│   ├── sync/
│   ├── ui/
│   └── runtime/                # new: startup health/bootstrap orchestration
├── tests/
│   ├── contract/
│   ├── integration/
│   ├── security/
│   └── ux/
├── scripts/                    # new: online Firebase setup + verification runners
├── config/                     # new: Firebase target profiles + fixture manifests
└── package.json

evidence/
└── <release>/<gate_id>/<bundle_id>/
```

**Structure Decision**: Keep a single Expo app codebase and add only two operational script
areas (`app/scripts`, `app/config`) plus a thin runtime bootstrap layer in `app/src/runtime`.
This is the minimum structure that satisfies multi-project online setup, startup health checks,
and explicit full verification.

## Post-Design Constitution Re-check

- PASS: Design artifacts stay within committed runnable baseline and avoid speculative modules.
- PASS: Script contracts use explicit mode flags instead of implicit/destructive behaviors.
- PASS: Deterministic pass/fail and evidence bundle outputs are explicit and reviewable.
- PASS: Canonical contract ownership and release-gate rules remain unchanged.

## Complexity Tracking

No constitution violations require complexity justification for this plan.
