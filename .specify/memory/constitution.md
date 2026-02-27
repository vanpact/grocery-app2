<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- V. Contract and Reliability Invariants -> V. Contract and Reliability Invariants
  (expanded with mandatory `playwright` + `mobile-mcp` UI verification evidence)
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ reviewed .specify/templates/spec-template.md (no changes required)
- ✅ reviewed .specify/templates/tasks-template.md (no changes required)
- ⚠ pending .specify/templates/commands/*.md (directory not present in repository)
Follow-up TODOs:
- None
-->
# Grocery App Constitution

## Core Principles

### I. Think Before Coding
Implementation work MUST begin by stating assumptions, uncertainties, and tradeoffs that
materially affect delivery or correctness. If multiple valid interpretations exist, the
options MUST be surfaced explicitly before coding. Rationale: early ambiguity handling
prevents avoidable rework and hidden product drift.

### II. Simplicity First
Solutions MUST use the minimum code and scope needed to satisfy the current requirement.
Speculative extensibility, single-use abstractions, and unrequested features are not
allowed. If a more complex approach is chosen, the simpler rejected alternative MUST be
documented. Rationale: reduced complexity improves delivery speed and maintainability.

### III. Surgical Changes
Changes MUST be confined to files and lines directly required by the request. Unrelated
refactors, style churn, and adjacent cleanups are not allowed. Engineers MUST remove
only unused artifacts introduced by their own change and MUST report unrelated issues
without modifying them. Rationale: minimal diffs reduce regression risk and review cost.

### IV. Goal-Driven Verification
Each task MUST define verifiable success criteria before implementation. Behavior changes,
bug fixes, and contract updates MUST include failing tests or deterministic checks before
code is considered complete. Verification evidence MUST be tied to explicit acceptance
scenarios, not subjective judgment. Rationale: measurable outcomes are required for safe,
independent delivery.

### V. Contract and Reliability Invariants
All work MUST remain consistent with canonical product documents in `specs/00`, `10`,
`20`, and `30`, respecting their ownership boundaries. Security and reliability baselines
are non-negotiable: role model (`suggest`, `validate`), deny-by-default authorization,
household isolation, and offline replay without data loss or duplicate net effects. Any
UI behavior change affecting web or Android MUST include verification evidence from
`playwright` (web flow capture) and `mobile-mcp` (mobile flow capture).
Rationale: these invariants define release safety for the Grocery App baseline.

## Product and Technical Constraints

- Committed baseline platform is Expo React Native targeting Android and Web, with
  Firebase Auth and Firestore as canonical identity and data systems.
- Canonical lifecycle states are `draft`, `suggested`, `validated`, and `bought`; active
  shopping behavior MUST align with the product spec state rules.
- Delivery scope MUST preserve tier semantics: `committed` features are release-blocking;
  `conditional` and `exploratory` features are gate-controlled and fail-closed.
- UX commitments for Material 3 Expressive and responsive breakpoint behavior are binding
  for all committed flows.
- UI verification tooling is mandatory for UI-affecting changes: `playwright` for web
  checks and `mobile-mcp` for Android/mobile checks.

## Delivery Workflow and Quality Gates

1. Define requirement, assumptions, and deterministic success criteria.
2. Map the change to the affected canonical source-of-truth docs and verify no ownership
   boundary conflicts are introduced.
3. Implement the smallest viable change set that satisfies the criteria.
4. Execute required tests and verification checks; for UI-affecting work, include
   `playwright` and `mobile-mcp` evidence; for non-committed work, record gate evidence
   and retain/cut decision artifacts.
5. Confirm compliance in review by checking constitution principles, security invariants,
   and release-facing verification references.

## Governance

- This constitution is the highest-priority engineering policy for this repository and
  supersedes conflicting local practices.
- Every plan, spec, task list, and implementation review MUST include an explicit
  constitution compliance check.
- Amendments require: (1) documented rationale, (2) impacted-template review, (3) version
  bump per semantic rules, and (4) approval from product and engineering owners.
- Versioning policy:
  - MAJOR: removal or incompatible redefinition of a principle or governance rule.
  - MINOR: new principle/section or materially expanded mandatory guidance.
  - PATCH: clarifications, wording refinements, and non-semantic edits.
- Any temporary exception MUST be documented with scope, justification, owner, and expiry
  in the relevant plan or PR notes.

**Version**: 1.1.0 | **Ratified**: 2026-02-22 | **Last Amended**: 2026-02-24
