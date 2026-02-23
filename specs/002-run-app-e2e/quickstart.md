# Quickstart: Run the App End-to-End on Emulator and Phone

## 1. Prerequisites

1. Android Studio with at least one Android emulator image.
2. Physical Android phone with Developer Options + USB debugging enabled.
3. Node.js 22.x and npm installed.
4. Firebase non-production project available for runnable verification.
5. Service account credentials with Firestore/Auth admin access for setup scripts.

## 2. Configure Firebase Target Profiles

1. Create/update target profile manifest in `app/config/firebase-targets.json`.
2. Mark exactly one target as default and ensure it is non-production.
3. Export credentials:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\service-account.json'
   ```

## 3. Install Dependencies

```bash
cd app
npm install
```

## 4. Prepare Online Database (Non-Destructive Default)

1. Run default setup for the default target:
   ```bash
   npm run db:setup
   ```
2. If required accounts are missing and you want creation:
   ```bash
   npm run db:setup:provision
   ```

Required verification accounts expected by default:
- `owner_primary` (`validate`, `household_alpha`)
- `member_primary` (`suggest`, `household_alpha`)
- `outsider_primary` (`suggest`, `household_beta`)

## 5. Start on Local Android Emulator

```bash
npm run start:android:emulator
```

Expected behavior:
- Startup performs quick health checks first.
- App launch proceeds only when quick checks pass.
- App connects to online Firebase target (not local DB emulator).

## 6. Start on Physical Android Phone

1. Connect device via USB (or configured adb over network).
2. Run:
   ```bash
   npm run start:android:device
   ```

Expected behavior:
- Same quick-check and startup behavior as emulator path.
- Core sign-in/add/validate/active-shopping flow is runnable end-to-end.

## 7. Run Full Verification and Generate Evidence

```bash
npm run verify:full -- -- --target default --release RC-<date> --gate <gate_id> --bundle EV-RUNNABLE-E2E
```

Expected outputs:
- Deterministic pass/fail summary per committed verification rule.
- Evidence bundle under:
  - `evidence/<release>/<gate_id>/<bundle_id>/`

## 8. Optional Explicit Reset Mode (Destructive)

Use only when you intentionally want baseline-owned fixture reset:

Non-default target upsert (non-destructive) with explicit target confirmation:

```bash
npm run db:setup -- -- --target <alias> --confirm-non-default-target TARGET:<alias>:CONFIRM
```

Default target reset:

```bash
npm run db:setup -- -- --mode reset --confirm-reset RESET:default:CONFIRM
```

Non-default target reset:

```bash
npm run db:setup -- -- --mode reset --confirm-reset RESET:<alias>:CONFIRM --confirm-non-default-target TARGET:<alias>:CONFIRM
```

Safety behavior:
- Reset must fail without explicit reset confirmation.
- Non-default target must fail without explicit non-default confirmation.

## 9. Command Matrix

| Purpose | Command |
| --- | --- |
| Default non-destructive setup | `npm run db:setup` |
| Default setup with explicit account provisioning | `npm run db:setup:provision` |
| Emulator startup (quick checks only) | `npm run start:android:emulator` |
| Physical phone startup (quick checks only) | `npm run start:android:device` |
| Quick verification only | `npm run verify:quick -- -- --target default` |
| Full verification + evidence bundle | `npm run verify:full -- -- --target default --release RC-<date> --gate <gate_id> --bundle <bundle_id>` |
