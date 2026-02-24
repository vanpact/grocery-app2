# CI Enforcement Contract

## 1. Authority Model

```ts
export type ReleaseAuthority = {
  ciAuthoritative: true;
  localRunsAdvisoryOnly: true;
};
```

Rules:
- Only CI-produced release-readiness output is valid for publication decisions.
- Local runs are diagnostic and must not authorize release publication.

## 2. CI Gate Interface

```ts
export type CiGateInput = {
  releaseId: string;
  readinessReportPath: string;
  publicationTarget: string;
};

export type CiGateDecision = {
  status: 'allow_publication' | 'block_publication';
  reasonCodes: string[];
};
```

Rules:
- CI reads release-readiness output produced during the same pipeline run.
- `status = block_publication` is mandatory when readiness status is `not_ready`.

## 3. Publication Blocking Policy

- `not_ready` always blocks release publication.
- No fallback path may publish release artifacts when blocked.
- Manual overrides are out of scope for baseline hardening and are disallowed by default.

## 4. Audit and Traceability Requirements

- CI must persist:
  - release-readiness report,
  - decision summary,
  - pointers to evaluated evidence artifacts.
- CI output must make blocking reasons explicit and machine-readable.

## 5. Determinism and Re-run Behavior

- Re-running CI with unchanged readiness inputs must produce the same decision and reason codes.
- If decision changes across runs, the pipeline must surface the changed input references.
