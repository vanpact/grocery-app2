# Sample UI Refresh Evidence

This folder contains template artifacts for the `006-ux-ui-refresh` verification workflow.

## Included Templates

- `ui-refresh-playwright-artifacts.json`
- `ui-refresh-mobile-mcp-artifacts.json`
- `ui-refresh-before-after-index.json`
- `ui-refresh-before-after-summary.md`
- `ui-refresh-accessibility-summary.json`
- `ui-refresh-timing-summary.json`
- `ui-refresh-clarity-summary.json`
- `ui-refresh-mistap-summary.json`
- `ui-refresh-usability-summary.json`

## Run Notes (2026-02-24)

Commands executed from `app/`:

```bash
npm test
npm run lint
npm run verify:full -- default RC-2026-02-24 gate-ui-refresh EV-UI-REFRESH
npm run verify:release-readiness -- RC-2026-02-24 committed
```

Observed results:

- `npm test`: pass (`89` files, `141` tests).
- `npm run lint`: pass.
- `verify:full`: pass, evidence bundle written to `evidence/RC-2026-02-24/gate-ui-refresh/EV-UI-REFRESH`.
- `verify:release-readiness`: `not_ready` for `RC-2026-02-24` because required release-level inputs (`verification-outcomes.json`, `field-test-coverage.json`) and canonical gate-owner sources are not yet complete in the sample repository state.
