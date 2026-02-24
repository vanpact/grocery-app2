import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { type VerificationRuleResult } from '../../src/runtime/contracts';

export type EvidenceDecision = 'retain' | 'cut';

export type EvidenceBundleInput = {
  releaseId: string;
  gateId: string;
  bundleId: string;
  scope?: 'committed' | 'conditional' | 'exploratory';
  storyIds?: string[];
  targetAlias: string;
  results: VerificationRuleResult[];
  requiredOwners: string[];
  approvals: string[];
  decision: EvidenceDecision;
  rationale: string;
  extraRawArtifacts?: Array<{
    filename: string;
    content: unknown;
  }>;
  verificationResultsAppendix?: string;
  evidenceRootDir?: string;
  now?: () => Date;
};

export type EvidenceBundleWriteResult = {
  bundlePath: string;
  files: {
    manifest: string;
    verificationResults: string;
    rawDataDir: string;
    decision: string;
    approvals: string;
  };
};

function toUtcIso(now: () => Date): string {
  return now().toISOString();
}

export function buildEvidenceBundlePath(input: {
  releaseId: string;
  gateId: string;
  bundleId: string;
  evidenceRootDir?: string;
}): string {
  const root = input.evidenceRootDir ?? 'evidence';
  return resolve(root, input.releaseId, input.gateId, input.bundleId);
}

function buildVerificationResultsMarkdown(results: VerificationRuleResult[], appendix?: string): string {
  const sorted = [...results].sort((left, right) => left.verificationId.localeCompare(right.verificationId));
  const lines = [
    '# Verification Results',
    '',
    '| verification_id | status | evidence_refs | notes |',
    '| --- | --- | --- | --- |',
  ];

  for (const result of sorted) {
    lines.push(
      `| ${result.verificationId} | ${result.status} | ${result.evidenceRefs.join(', ')} | ${result.notes ?? ''} |`,
    );
  }

  const base = `${lines.join('\n')}\n`;
  if (!appendix) {
    return base;
  }

  return `${base}\n${appendix.trim()}\n`;
}

function serializeRawArtifact(content: unknown): string {
  if (typeof content === 'string') {
    return `${content}\n`;
  }

  return `${JSON.stringify(content, null, 2)}\n`;
}

function writeRawDataArtifacts(
  rawDataDir: string,
  results: VerificationRuleResult[],
  extraRawArtifacts?: EvidenceBundleInput['extraRawArtifacts'],
): void {
  mkdirSync(rawDataDir, { recursive: true });
  const sorted = [...results].sort((left, right) => left.verificationId.localeCompare(right.verificationId));

  for (const result of sorted) {
    const filePath = join(rawDataDir, `${result.verificationId}.json`);
    writeFileSync(
      filePath,
      `${JSON.stringify(
        {
          verificationId: result.verificationId,
          status: result.status,
          evidenceRefs: result.evidenceRefs,
          notes: result.notes ?? null,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }

  for (const artifact of extraRawArtifacts ?? []) {
    const filePath = join(rawDataDir, artifact.filename);
    writeFileSync(filePath, serializeRawArtifact(artifact.content), 'utf8');
  }
}

export function writeEvidenceBundle(input: EvidenceBundleInput): EvidenceBundleWriteResult {
  const now = input.now ?? (() => new Date());
  const bundlePath = buildEvidenceBundlePath({
    releaseId: input.releaseId,
    gateId: input.gateId,
    bundleId: input.bundleId,
    evidenceRootDir: input.evidenceRootDir,
  });
  const rawDataDir = join(bundlePath, 'raw-data');

  mkdirSync(bundlePath, { recursive: true });
  writeRawDataArtifacts(rawDataDir, input.results, input.extraRawArtifacts);

  const manifestPath = join(bundlePath, 'manifest.json');
  const verificationResultsPath = join(bundlePath, 'verification-results.md');
  const decisionPath = join(bundlePath, 'decision.json');
  const approvalsPath = join(bundlePath, 'approvals.json');

  const verificationIds = [...new Set(input.results.map((result) => result.verificationId))].sort();
  const generatedAtUtc = toUtcIso(now);

  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        release_id: input.releaseId,
        gate_id: input.gateId,
        bundle_id: input.bundleId,
        scope: input.scope ?? 'committed',
        generated_at_utc: generatedAtUtc,
        artifact_version: 'v1',
        story_ids: [...(input.storyIds ?? [])].sort(),
        verification_ids: verificationIds,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  writeFileSync(
    verificationResultsPath,
    buildVerificationResultsMarkdown(input.results, input.verificationResultsAppendix),
    'utf8',
  );

  writeFileSync(
    decisionPath,
    `${JSON.stringify(
      {
        gate_id: input.gateId,
        bundle_id: input.bundleId,
        decision: input.decision,
        rationale: input.rationale,
        decided_at_utc: generatedAtUtc,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  writeFileSync(
    approvalsPath,
    `${JSON.stringify(
      {
        gate_id: input.gateId,
        bundle_id: input.bundleId,
        required_owners: [...input.requiredOwners].sort(),
        approvals: [...new Set(input.approvals)].sort(),
        approved_at_utc: generatedAtUtc,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  return {
    bundlePath,
    files: {
      manifest: manifestPath,
      verificationResults: verificationResultsPath,
      rawDataDir,
      decision: decisionPath,
      approvals: approvalsPath,
    },
  };
}
