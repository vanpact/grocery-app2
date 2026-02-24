# Quickstart: Quick Wins Bulk Add Packs and Recipes

## 1. Prerequisites

1. Branch `004-quick-wins-bulk-add` is checked out.
2. Committed baseline setup from features `001` to `003` is already runnable.
3. Optional module gate config exists for quick wins and remains fail-closed by default.
4. Candidate release identifier is selected (example: `RC-2026-03-01`).

## 2. Validate Runtime Inputs

1. Confirm household context is resolved and user is a household member.
2. Confirm pack/recipe template is household-shared.
3. Confirm multiplier is a positive integer.
4. Confirm target list is writable in current session role context.

## 3. Run Local Behavior Verification

Run feature tests covering projection, merge, and fail-closed validation:

```bash
cd app
npm run test -- quick-wins
```

Expected behavior:
- projection previews show deterministic multiplied quantities,
- cancel path does not mutate list data,
- apply path reuses committed dedup merge behavior,
- invalid multipliers are rejected with no mutation.

## 4. Generate Advisory Timing Evidence

Run scripted timing comparisons for baseline vs quick-input:

```bash
cd app
npm run verify:quick-wins -- -- --release RC-2026-03-01 --gate G-QW-01 --bundle EV-QW-BULK-ADD
```

Input expectations:
- Provide `baselineRuns` and `quickRuns` JSON at `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/raw-data/quick-wins-timing-runs.json`, or
- pass an explicit file path with `--timing-runs <path>`.

Expected local output:
- timing run records with deterministic baseline/quick durations,
- computed median improvement percentage,
- advisory pass/fail indication for `VR-CND-101-BULK-ADD-TIME`.

## 5. Produce Authoritative CI Gate Evidence

Trigger CI for the same release candidate and gate artifact path:
- `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/`

Expected CI behavior:
- validates mandatory evidence artifacts,
- evaluates `VR-CND-101-BULK-ADD-TIME`,
- records gate decision input for `G-QW-01`.

## 6. Interpret Outcomes

### Pass

- Median quick-input completion improvement is `>= 25%` vs baseline.
- Run count requirement is satisfied (`>= 10` scripted runs, `5 baseline + 5 quick`).
- Gate evidence is complete and decision can retain quick-input feature scope.

### Fail

- Improvement is below threshold or evidence is incomplete/invalid.
- Gate fail action applies: cut quick-input features for the release cycle.
- Committed baseline behavior remains available and unaffected.

## 7. Minimal Command Matrix

| Purpose | Command |
| --- | --- |
| Feature behavior tests | `npm run test -- quick-wins` |
| Advisory timing evidence generation | `npm run verify:quick-wins -- -- --release <id> --gate G-QW-01 --bundle EV-QW-BULK-ADD` |
| Authoritative gate decision | CI run producing `evidence/<release>/G-QW-01/EV-QW-BULK-ADD/` artifacts |
