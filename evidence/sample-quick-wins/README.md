# Sample Quick-Wins Gate Artifacts

This folder contains sample local advisory artifacts for `G-QW-01` quick-wins timing verification.

## Files

- `local-timing-report.json`: sample output payload from `npm run verify:quick-wins ...`
- `local-gate-decision.json`: sample publication decision derived from the local report (advisory)

## Command

```bash
cd app
npm run verify:quick-wins -- -- --release RC-2026-03-01 --gate G-QW-01 --bundle EV-QW-BULK-ADD
```

## Notes

- Local outputs are advisory previews.
- CI artifacts are authoritative for publication blocking decisions.

## Validation Notes

- 2026-02-24: `npm run test -- quick-wins- us1-replay-order-idempotency.spec.ts` passed (12 files, 16 tests).
- 2026-02-24: `npm run lint` passed.
