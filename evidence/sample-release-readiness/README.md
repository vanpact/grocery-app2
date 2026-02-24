# Sample Release-Readiness Artifacts

This folder tracks representative release-readiness report outputs and CI publication decisions.

## Suggested Capture Workflow

1. Ensure committed evidence bundle inputs exist under:
   - `evidence/<release>/<gate_id>/<bundle_id>/`
2. Generate local advisory report:
   ```bash
   cd app
   npm run verify:release-readiness -- -- --release RC-2026-02-23 --scope committed
   ```
3. Run authoritative CI workflow (`release-readiness`) for the same release ID.
4. Save resulting CI artifacts:
   - `.ci/release-readiness-report.json`
   - `.ci/release-decision.json`
5. Run release-readiness regression suite:
   ```bash
   cd app
   npm run test -- release-
   ```

## Example References

- Advisory preview report sample: `evidence/sample-release-readiness/local-preview-report.json`
- Advisory preview decision sample: `evidence/sample-release-readiness/local-decision.json`
- Authoritative CI readiness report sample: `.ci/release-readiness-report.json`
- Authoritative CI decision sample: `.ci/release-decision.json`

## Decision Semantics

- `allow_publication`: release is ready for publication.
- `block_publication`: release is blocked due to `not_ready` status and associated reason codes.
