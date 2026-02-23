# Evidence Artifacts

## Bundle Path Contract

Evidence bundles for release gates are stored under:

`evidence/<release>/<gate_id>/<bundle_id>/`

Runnable command path:

```bash
npm run verify:full -- --target <alias> --release <release_id> --gate <gate_id> --bundle <bundle_id>
```

Startup wrappers and `verify:quick` do not generate full evidence bundles.

## Required Files Per Bundle

- `manifest.json`
- `verification-results.md`
- `raw-data/`
- `decision.json`
- `approvals.json`

## Release Evidence Checklist

- [ ] All committed verification refs (`VR-COM-001` through `VR-COM-010`) are listed in `manifest.json`
- [ ] Mandatory blocker `VR-COM-003-ROLE-TRANSITION-ENFORCEMENT` is marked pass
- [ ] Raw artifacts for each verification are attached under `raw-data/`
- [ ] `decision.json` captures pass/fail/cut with rationale
- [ ] `approvals.json` includes required owners and timestamps

## Artifact Index

- Schemas:
  - `evidence/schemas/manifest.schema.json`
  - `evidence/schemas/decision.schema.json`
  - `evidence/schemas/approvals.schema.json`
- Feature docs:
  - `specs/001-baseline-spec-bootstrap/quickstart.md`
  - `specs/001-baseline-spec-bootstrap/contracts/security-transition-contract.md`
  - `specs/001-baseline-spec-bootstrap/contracts/verification-and-gate-contract.md`
  - `specs/002-run-app-e2e/quickstart.md`
  - `specs/002-run-app-e2e/troubleshooting.md`
