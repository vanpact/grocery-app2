import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCanonicalSources } from '../../scripts/lib/releaseCanonicalSources';

type BuildWorkspaceInput = {
  releaseId?: string;
  gateId?: string;
  bundleId?: string;
  missingArtifacts?: Array<'manifest.json' | 'verification-results.md' | 'raw-data' | 'decision.json' | 'approvals.json'>;
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
