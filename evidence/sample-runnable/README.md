# Sample Runnable Regression Output

This folder stores example references for runnable regression execution.

## Suggested Capture Workflow

1. Run quick verification:
   ```bash
   npm run verify:quick -- --target default
   ```
2. Run full verification with explicit release/gate/bundle IDs:
   ```bash
   npm run verify:full -- --target default --release RC-20260223 --gate G-QW-01 --bundle EV-RUNNABLE-E2E
   ```
3. Copy the generated bundle path from command output and record it below.

## Example References

- Quick check sample: `evidence/sample-runnable/quick-check-output.json` (optional)
- Full verification bundle sample: `evidence/RC-20260223/G-QW-01/EV-RUNNABLE-E2E/`
- Required files present:
  - `manifest.json`
  - `verification-results.md`
  - `raw-data/`
  - `decision.json`
  - `approvals.json`
