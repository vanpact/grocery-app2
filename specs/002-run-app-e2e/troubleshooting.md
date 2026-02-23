# Troubleshooting: Runnable E2E Baseline

## Target Selection Errors

### Symptom
`db:setup` fails with non-default target confirmation error.

### Cause
The selected target is not the default profile and no explicit confirmation token was provided.

### Fix
Run setup with the exact token:

```bash
npm run db:setup -- -- --target <alias> --confirm-non-default-target TARGET:<alias>:CONFIRM
```

## Reset Safeguard Errors

### Symptom
`db:setup -- --mode reset` fails with reset confirmation error.

### Cause
Reset mode always requires a target-specific confirmation token.

### Fix
For default target:

```bash
npm run db:setup -- -- --mode reset --confirm-reset RESET:default:CONFIRM
```

For non-default target:

```bash
npm run db:setup -- -- --target <alias> --mode reset --confirm-non-default-target TARGET:<alias>:CONFIRM --confirm-reset RESET:<alias>:CONFIRM
```

## Account Readiness Failures

### Symptom
Quick verification reports `required_accounts_missing`.

### Cause
Required verification accounts are missing or mismatched for role/household mapping.

### Fix
1. Run validation-only setup and inspect warnings:
   ```bash
   npm run db:setup
   ```
2. Provision missing accounts explicitly:
   ```bash
   npm run db:setup:provision
   ```
3. Re-run quick verification:
   ```bash
   npm run verify:quick -- -- --target default
   ```

## Startup Blocked by Quick-Check Budget

### Symptom
Startup gate reports `quick_check_budget_exceeded`.

### Cause
Preflight checks exceeded 2-minute budget.

### Fix
1. Verify Firebase credentials and project reachability.
2. Retry after connectivity stabilization.
3. Re-run `npm run verify:quick -- -- --target default` to confirm budget recovery.
