import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCanonicalSources } from '../../scripts/lib/releaseCanonicalSources';

type BuildWorkspaceInput = {
  releaseId?: string;
  gateId?: string;
  bundleId?: string;
  missingArtifacts?: Array<
    | 'manifest.json'
    | 'verification-results.md'
    | 'raw-data'
    | 'raw-data/ui-refresh-task-runs.json'
    | 'raw-data/ui-refresh-playwright-artifacts.json'
    | 'raw-data/ui-refresh-mobile-mcp-artifacts.json'
    | 'raw-data/ui-refresh-before-after-index.json'
    | 'raw-data/ui-refresh-accessibility-summary.json'
    | 'raw-data/ui-refresh-timing-summary.json'
    | 'raw-data/ui-refresh-clarity-summary.json'
    | 'raw-data/ui-refresh-mistap-summary.json'
    | 'raw-data/ui-refresh-usability-summary.json'
    | 'decision.json'
    | 'approvals.json'
  >;
  malformedArtifacts?: Array<'manifest.json' | 'decision.json' | 'approvals.json'>;
  releaseMismatch?: boolean;
  requiredOwners?: string[];
  approvedOwners?: string[];
  approvedAtUtc?: string;
  verificationStatusOverrides?: Partial<Record<string, 'pass' | 'fail'>>;
  nonDeterministicIds?: string[];
  missingVerificationIds?: string[];
  duplicateVerificationIds?: string[];
  optionalVerificationOutcomes?: Array<{ verificationId: string; status: 'pass' | 'fail'; deterministic?: boolean }>;
  fieldScenarioStatusOverrides?: Partial<Record<string, 'pass' | 'fail' | 'missing'>>;
  missingFieldScenarioIds?: string[];
  optionalFieldScenarios?: Array<{ scenarioId: string; status: 'pass' | 'fail' }>;
  includeBundle?: boolean;
  includeVerificationFile?: boolean;
  includeFieldCoverageFile?: boolean;
  includeUsabilityArtifacts?: boolean;
  usabilitySummaryOverrides?: {
    sc001?: 'pass' | 'fail';
    sc002?: 'pass' | 'fail';
    sc003?: 'pass' | 'fail';
    sc004?: 'pass' | 'fail';
    sc005?: 'pass' | 'fail';
    sc006?: 'pass' | 'fail';
    sc007?: 'pass' | 'fail';
  };
};

export type ReleaseReadinessWorkspace = {
  releaseId: string;
  evidenceRootPath: string;
  releaseEvidenceRootPath: string;
  verificationOutcomesPath: string;
  fieldTestCoveragePath: string;
  committedVerificationIds: string[];
  committedFieldScenarioIds: string[];
};

function writeJsonFile(path: string, value: unknown, malformed: boolean): void {
  if (malformed) {
    writeFileSync(path, '{', 'utf8');
    return;
  }

  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function createReleaseReadinessWorkspace(input: BuildWorkspaceInput = {}): ReleaseReadinessWorkspace {
  const releaseId = input.releaseId ?? 'RC-2026-02-23';
  const gateId = input.gateId ?? 'G-QW-01';
  const bundleId = input.bundleId ?? 'EV-RELEASE-READINESS';
  const includeBundle = input.includeBundle ?? true;
  const includeVerificationFile = input.includeVerificationFile ?? true;
  const includeFieldCoverageFile = input.includeFieldCoverageFile ?? true;
  const includeUsabilityArtifacts = input.includeUsabilityArtifacts ?? true;

  const canonicalSources = loadCanonicalSources();
  const committedVerificationIds = canonicalSources.committedVerificationIds;
  const committedFieldScenarioIds = canonicalSources.committedFieldTestScenarioIds;

  const root = mkdtempSync(join(tmpdir(), 'grocery-release-readiness-'));
  const releaseEvidenceRootPath = join(root, releaseId);
  mkdirSync(releaseEvidenceRootPath, { recursive: true });

  const verificationOutcomesPath = join(releaseEvidenceRootPath, 'verification-outcomes.json');
  const fieldTestCoveragePath = join(releaseEvidenceRootPath, 'field-test-coverage.json');

  if (includeVerificationFile) {
    const missingVerificationIds = new Set(input.missingVerificationIds ?? []);
    const nonDeterministicIds = new Set(input.nonDeterministicIds ?? []);
    const duplicateIds = new Set(input.duplicateVerificationIds ?? []);

    const outcomes = committedVerificationIds
      .filter((verificationId) => !missingVerificationIds.has(verificationId))
      .flatMap((verificationId) => {
        const baseOutcome = {
          verificationId,
          status: input.verificationStatusOverrides?.[verificationId] ?? 'pass',
          deterministic: !nonDeterministicIds.has(verificationId),
        };

        return duplicateIds.has(verificationId) ? [baseOutcome, { ...baseOutcome }] : [baseOutcome];
      });

    writeJsonFile(
      verificationOutcomesPath,
      {
        releaseId,
        outcomes,
        optionalOutcomes: input.optionalVerificationOutcomes ?? [],
      },
      false,
    );
  }

  if (includeFieldCoverageFile) {
    const missingFieldScenarioIds = new Set(input.missingFieldScenarioIds ?? []);
    const scenarios = committedFieldScenarioIds
      .filter((scenarioId) => !missingFieldScenarioIds.has(scenarioId))
      .map((scenarioId) => ({
        scenarioId,
        status: input.fieldScenarioStatusOverrides?.[scenarioId] ?? 'pass',
      }));

    writeJsonFile(
      fieldTestCoveragePath,
      {
        releaseId,
        scenarios,
        optionalScenarios: input.optionalFieldScenarios ?? [],
      },
      false,
    );
  }

  if (includeBundle) {
    const bundlePath = join(releaseEvidenceRootPath, gateId, bundleId);
    const rawDataPath = join(bundlePath, 'raw-data');
    mkdirSync(bundlePath, { recursive: true });

    const missingArtifacts = new Set(input.missingArtifacts ?? []);
    const malformedArtifacts = new Set(input.malformedArtifacts ?? []);

    if (!missingArtifacts.has('raw-data')) {
      mkdirSync(rawDataPath, { recursive: true });
      writeFileSync(join(rawDataPath, 'sample.json'), `${JSON.stringify({ status: 'ok' }, null, 2)}\n`, 'utf8');
      if (includeUsabilityArtifacts) {
        if (!missingArtifacts.has('raw-data/ui-refresh-task-runs.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-task-runs.json'),
            `${JSON.stringify(
              {
                releaseId,
                baselineRuns: [
                  {
                    runId: 'baseline-android-touch-01',
                    platform: 'android',
                    inputMode: 'touch',
                    flow: 'core-add-validate',
                    durationSeconds: 102,
                    completed: true,
                    deterministic: true,
                  },
                  {
                    runId: 'baseline-web-keyboard-01',
                    platform: 'web',
                    inputMode: 'keyboard',
                    flow: 'core-add-validate',
                    durationSeconds: 97,
                    completed: true,
                    deterministic: true,
                  },
                  {
                    runId: 'baseline-web-pointer-01',
                    platform: 'web',
                    inputMode: 'pointer',
                    flow: 'core-add-validate',
                    durationSeconds: 95,
                    completed: true,
                    deterministic: true,
                  },
                ],
                refreshedRuns: [
                  {
                    runId: 'refresh-android-touch-01',
                    platform: 'android',
                    inputMode: 'touch',
                    flow: 'core-add-validate',
                    durationSeconds: 68,
                    completed: true,
                    deterministic: true,
                  },
                  {
                    runId: 'refresh-web-keyboard-01',
                    platform: 'web',
                    inputMode: 'keyboard',
                    flow: 'core-add-validate',
                    durationSeconds: 70,
                    completed: true,
                    deterministic: true,
                  },
                  {
                    runId: 'refresh-web-pointer-01',
                    platform: 'web',
                    inputMode: 'pointer',
                    flow: 'core-add-validate',
                    durationSeconds: 72,
                    completed: true,
                    deterministic: true,
                  },
                ],
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-playwright-artifacts.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-playwright-artifacts.json'),
            `${JSON.stringify(
              {
                releaseId,
                tool: 'playwright',
                platform: 'web',
                scenarios: [
                  {
                    screenId: 'sign-in',
                    scenarioId: 'sign-in-web',
                    artifactPath: 'artifacts/playwright/sign-in.png',
                    status: 'captured',
                  },
                  {
                    screenId: 'active-shopping',
                    scenarioId: 'active-shopping-web',
                    artifactPath: 'artifacts/playwright/active-shopping.png',
                    status: 'captured',
                  },
                  {
                    screenId: 'overview',
                    scenarioId: 'overview-web',
                    artifactPath: 'artifacts/playwright/overview.png',
                    status: 'captured',
                  },
                  {
                    screenId: 'settings',
                    scenarioId: 'settings-web',
                    artifactPath: 'artifacts/playwright/settings.png',
                    status: 'captured',
                  },
                ],
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-mobile-mcp-artifacts.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-mobile-mcp-artifacts.json'),
            `${JSON.stringify(
              {
                releaseId,
                tool: 'mobile-mcp',
                platform: 'android',
                scenarios: [
                  {
                    screenId: 'sign-in',
                    scenarioId: 'sign-in-android',
                    artifactPath: 'artifacts/mobile/sign-in.png',
                    status: 'captured',
                  },
                  {
                    screenId: 'active-shopping',
                    scenarioId: 'active-shopping-android',
                    artifactPath: 'artifacts/mobile/active-shopping.png',
                    status: 'captured',
                  },
                  {
                    screenId: 'overview',
                    scenarioId: 'overview-android',
                    artifactPath: 'artifacts/mobile/overview.png',
                    status: 'captured',
                  },
                  {
                    screenId: 'settings',
                    scenarioId: 'settings-android',
                    artifactPath: 'artifacts/mobile/settings.png',
                    status: 'captured',
                  },
                ],
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-before-after-index.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-before-after-index.json'),
            `${JSON.stringify(
              {
                releaseId,
                pairs: [
                  {
                    screenId: 'sign-in',
                    platform: 'web',
                    beforeArtifactPath: 'artifacts/playwright/before/sign-in.png',
                    afterArtifactPath: 'artifacts/playwright/after/sign-in.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'sign-in',
                    platform: 'android',
                    beforeArtifactPath: 'artifacts/mobile/before/sign-in.png',
                    afterArtifactPath: 'artifacts/mobile/after/sign-in.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'active-shopping',
                    platform: 'web',
                    beforeArtifactPath: 'artifacts/playwright/before/active-shopping.png',
                    afterArtifactPath: 'artifacts/playwright/after/active-shopping.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'active-shopping',
                    platform: 'android',
                    beforeArtifactPath: 'artifacts/mobile/before/active-shopping.png',
                    afterArtifactPath: 'artifacts/mobile/after/active-shopping.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'overview',
                    platform: 'web',
                    beforeArtifactPath: 'artifacts/playwright/before/overview.png',
                    afterArtifactPath: 'artifacts/playwright/after/overview.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'overview',
                    platform: 'android',
                    beforeArtifactPath: 'artifacts/mobile/before/overview.png',
                    afterArtifactPath: 'artifacts/mobile/after/overview.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'settings',
                    platform: 'web',
                    beforeArtifactPath: 'artifacts/playwright/before/settings.png',
                    afterArtifactPath: 'artifacts/playwright/after/settings.png',
                    status: 'paired',
                  },
                  {
                    screenId: 'settings',
                    platform: 'android',
                    beforeArtifactPath: 'artifacts/mobile/before/settings.png',
                    afterArtifactPath: 'artifacts/mobile/after/settings.png',
                    status: 'paired',
                  },
                ],
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-accessibility-summary.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-accessibility-summary.json'),
            `${JSON.stringify(
              {
                releaseId,
                checks: [
                  {
                    screenId: 'sign-in',
                    platform: 'web',
                    focusVisibilityPass: true,
                    keyboardTraversalPass: true,
                    textScalingPass: true,
                    touchTargetPass: true,
                    finalStatus: 'pass',
                  },
                ],
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-timing-summary.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-timing-summary.json'),
            `${JSON.stringify(
              {
                releaseId,
                baselineMedianSeconds: 98,
                refreshedMedianSeconds: 70,
                improvementPct: 28.5714,
                sc002Status: input.usabilitySummaryOverrides?.sc002 ?? 'pass',
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-clarity-summary.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-clarity-summary.json'),
            `${JSON.stringify(
              {
                releaseId,
                averageScore: 4.2,
                sc006Status: input.usabilitySummaryOverrides?.sc006 ?? 'pass',
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-mistap-summary.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-mistap-summary.json'),
            `${JSON.stringify(
              {
                releaseId,
                mistapRatePct: 3.4,
                sc003Status: input.usabilitySummaryOverrides?.sc003 ?? 'pass',
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
        if (!missingArtifacts.has('raw-data/ui-refresh-usability-summary.json')) {
          writeFileSync(
            join(rawDataPath, 'ui-refresh-usability-summary.json'),
            `${JSON.stringify(
              {
                releaseId,
                successCriteria: {
                  sc001: input.usabilitySummaryOverrides?.sc001 ?? 'pass',
                  sc002: input.usabilitySummaryOverrides?.sc002 ?? 'pass',
                  sc003: input.usabilitySummaryOverrides?.sc003 ?? 'pass',
                  sc004: input.usabilitySummaryOverrides?.sc004 ?? 'pass',
                  sc005: input.usabilitySummaryOverrides?.sc005 ?? 'pass',
                  sc006: input.usabilitySummaryOverrides?.sc006 ?? 'pass',
                  sc007: input.usabilitySummaryOverrides?.sc007 ?? 'pass',
                },
                metrics: {
                  totalRecognitionRuns: 10,
                  recognizedWithin5sPct: 90,
                  baselineMedianSeconds: 98,
                  refreshedMedianSeconds: 70,
                  improvementPct: 28.5714,
                  mistapRatePct: 3.4,
                  clarityAverage: 4.2,
                  responsivePassRatePct: 100,
                  parityPassRatePct: 100,
                  accessibilityPassRatePct: 100,
                },
                missingArtifacts: [],
                finalStatus: Object.values({
                  sc001: input.usabilitySummaryOverrides?.sc001 ?? 'pass',
                  sc002: input.usabilitySummaryOverrides?.sc002 ?? 'pass',
                  sc003: input.usabilitySummaryOverrides?.sc003 ?? 'pass',
                  sc004: input.usabilitySummaryOverrides?.sc004 ?? 'pass',
                  sc005: input.usabilitySummaryOverrides?.sc005 ?? 'pass',
                  sc006: input.usabilitySummaryOverrides?.sc006 ?? 'pass',
                  sc007: input.usabilitySummaryOverrides?.sc007 ?? 'pass',
                }).every((status) => status === 'pass')
                  ? 'ready'
                  : 'not_ready',
                reasonCodes: [],
              },
              null,
              2,
            )}\n`,
            'utf8',
          );
        }
      }
    }

    if (!missingArtifacts.has('verification-results.md')) {
      writeFileSync(join(bundlePath, 'verification-results.md'), '# Verification Results\n', 'utf8');
    }

    if (!missingArtifacts.has('manifest.json')) {
      writeJsonFile(
        join(bundlePath, 'manifest.json'),
        {
          release_id: input.releaseMismatch ? `${releaseId}-MISMATCH` : releaseId,
          gate_id: gateId,
          bundle_id: bundleId,
          scope: 'committed',
          generated_at_utc: '2026-02-23T10:00:00.000Z',
          artifact_version: 'v1',
          verification_ids: committedVerificationIds,
        },
        malformedArtifacts.has('manifest.json'),
      );
    }

    if (!missingArtifacts.has('decision.json')) {
      writeJsonFile(
        join(bundlePath, 'decision.json'),
        {
          gate_id: gateId,
          bundle_id: bundleId,
          decision: 'retain',
          rationale: 'all_requirements_satisfied',
          decided_at_utc: '2026-02-23T10:00:00.000Z',
        },
        malformedArtifacts.has('decision.json'),
      );
    }

    if (!missingArtifacts.has('approvals.json')) {
      const canonicalOwners = canonicalSources.gateOwnersByGateId[gateId] ?? ['Engineering Lead', 'Security Owner'];
      writeJsonFile(
        join(bundlePath, 'approvals.json'),
        {
          gate_id: gateId,
          bundle_id: bundleId,
          required_owners: input.requiredOwners ?? canonicalOwners,
          approvals: input.approvedOwners ?? canonicalOwners,
          approved_at_utc: input.approvedAtUtc ?? '2026-02-23T10:00:00.000Z',
        },
        malformedArtifacts.has('approvals.json'),
      );
    }
  }

  return {
    releaseId,
    evidenceRootPath: root,
    releaseEvidenceRootPath,
    verificationOutcomesPath,
    fieldTestCoveragePath,
    committedVerificationIds,
    committedFieldScenarioIds,
  };
}
