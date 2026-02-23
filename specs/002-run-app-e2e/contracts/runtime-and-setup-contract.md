# Runtime and Setup Contract (Online Firebase)

## 1. Target Profile Interface

```ts
export type FirebaseTargetProfile = {
  targetAlias: string;
  firebaseProjectId: string;
  environment: 'nonprod' | 'prod';
  isDefault: boolean;
  allowDestructiveReset: boolean;
};
```

Contract rules:
- Exactly one profile is default.
- Default profile must be non-production.
- Selecting a non-default profile requires explicit operator confirmation.

## 2. Setup Command Interface

```ts
export type SetupMode = 'upsert' | 'reset';

export type SetupCommandInput = {
  targetAlias?: string; // omitted means default target
  mode?: SetupMode; // omitted means "upsert"
  provisionAccounts?: boolean; // default false
  confirmNonDefaultTarget?: string; // must equal targetAlias for non-default targets
  confirmReset?: 'RESET';
};

export type SetupCommandResult = {
  status: 'success' | 'failure';
  targetAlias: string;
  mode: SetupMode;
  fixtureUpserts: number;
  fixtureDeletes: number;
  accountsValidated: number;
  accountsCreated: number;
  warnings: string[];
  errors: string[];
};
```

Mandatory behavior:
- Default mode is `upsert` and must be non-destructive.
- `mode = 'reset'` must fail without `confirmReset = 'RESET'`.
- Non-default targets must fail without `confirmNonDefaultTarget`.
- Missing account creation is not attempted unless `provisionAccounts = true`.

## 3. Setup Data Guarantees

- Setup scripts prepare required Firestore structures and baseline fixtures for runnable
  verification.
- Re-running `upsert` mode must be idempotent and must not duplicate baseline fixtures.
- `reset` mode may delete only resources documented as baseline-owned for the selected target.
- Script output must include a deterministic summary suitable for run evidence.

## 4. Account Preparation Contract

```ts
export type VerificationAccountRequirement = {
  key: string;
  email: string;
  requiredRole: 'suggest' | 'validate';
  requiredHouseholdId: string;
};

export type AccountPreparationResult = {
  validated: string[];
  missing: string[];
  created: string[];
  mode: 'validate_only' | 'provision';
};
```

Mandatory behavior:
- Validation runs in all setup executions.
- Provisioning runs only in explicit `provision` mode.
- Startup and verification commands must fail fast when required accounts remain missing.

## 5. Startup Health Check Contract

```ts
export type QuickHealthCheckResult = {
  status: 'pass' | 'fail';
  durationMs: number;
  targetAlias: string;
  checks: {
    firebaseConfigValid: boolean;
    firestoreReachable: boolean;
    requiredAccountsReady: boolean;
    membershipFixtureReady: boolean;
  };
  failures: string[];
};
```

Mandatory behavior:
- Startup wrappers for emulator and phone must execute quick health checks before launch.
- Quick health checks do not run full verification suites.
- Health check failure must block startup with actionable error output.
