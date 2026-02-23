# Verification Execution Contract (Runnable Baseline)

## 1. Command Surface

```ts
export type VerificationCommands = {
  quickStartupCheck: 'npm run verify:quick -- -- --target <alias>';
  fullVerification: 'npm run verify:full -- -- --target <alias> --release <id> --gate <gate_id> --bundle <bundle_id>';
};
```

Contract rules:
- `verify:quick` is part of startup path and must complete quickly.
- `verify:full` runs only on explicit operator invocation.
- Startup path must not implicitly invoke full verification.

## 2. Full Verification Interface

```ts
export type VerificationRunInput = {
  targetAlias?: string; // default target when omitted
  releaseId: string;
  gateId: string;
  bundleId: string;
};

export type VerificationRuleResult = {
  verificationId: string;
  status: 'pass' | 'fail';
  evidenceRefs: string[];
  notes?: string;
};

export type VerificationRunResult = {
  status: 'passed' | 'failed' | 'interrupted';
  startedAtUtc: string;
  completedAtUtc: string;
  targetAlias: string;
  results: VerificationRuleResult[];
  evidenceBundlePath: string;
};
```

Mandatory behavior:
- Output must be deterministic and stable for the same input/environment.
- Any interrupted run must return `interrupted` and cannot be treated as passing.
- Unauthorized action checks must include explicit deny outcomes in output.

## 3. Required Verification Coverage

Runnable full verification must include:
- Core flow checks: sign-in, add, validate, Active Shopping persistence across restart.
- Offline/reconnect replay checks: ordered replay, no data loss, no duplicate net effect.
- Security checks: deny unauthorized transitions and deny cross-household access.
- Platform checks: same committed baseline flow path on Android emulator and physical phone.

## 4. Evidence Bundle Contract

Canonical output path:
- `evidence/<release>/<gate_id>/<bundle_id>/`

Mandatory bundle files:
- `manifest.json`
- `verification-results.md`
- `raw-data/`
- `decision.json`
- `approvals.json`

Mandatory behavior:
- `manifest.json`, `decision.json`, and `approvals.json` must follow canonical schemas in
  `specs/10-roadmap-and-gates.md`.
- Verification output must reference artifact file paths that exist in the bundle.
- Bundle generation failure must set run status to `failed`.

## 5. Startup vs Full Verification Separation

```ts
export type StartupPolicy = {
  quickCheckRequired: true;
  fullVerificationAutoRun: false;
  fullVerificationTrigger: 'explicit_command_only';
};
```

Enforcement rules:
- Emulator launch and phone launch wrappers must invoke quick check and stop on failure.
- Full verification cannot run unless operator explicitly executes `verify:full`.
