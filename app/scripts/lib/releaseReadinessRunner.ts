import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type ReleaseReadinessOutput, type ReleaseReadinessScope, type ReleaseReadinessSource } from '../../src/runtime/contracts';
import { validateApprovals } from './releaseApprovalValidation';
import { loadCanonicalSources } from './releaseCanonicalSources';
import { readEvidenceBundles } from './releaseEvidenceReader';
import { validateEvidenceBundles } from './releaseEvidenceValidation';
import { validateCommittedFieldTestCoverage } from './releaseFieldTestCoverageValidation';
import { buildReleaseReadinessReport } from './releaseReadinessReport';
import { resolveReleaseReadinessScope, resolveReleaseReadinessSource } from './releaseReadinessScope';
import { evaluateCommittedVerificationOutcomes } from './releaseVerificationEvaluation';
import { type EvidenceBundleRecord } from './releaseEvidenceReader';

export type RunReleaseReadinessInput = {
  releaseId: string;
  scope?: string;
  source?: ReleaseReadinessSource;
  verificationOutcomesPath?: string;
  evidenceRootPath?: string;
  fieldTestCoveragePath?: string;
  specsRootPath?: string;
  now?: () => Date;
};

export type RunReleaseReadinessOutput = {
  report: ReleaseReadinessOutput;
  sourceDocuments: string[];
};

type VerificationOutcomeFile = {
  releaseId?: string;
  outcomes?: Array<{
    verificationId: string;
    status: string;
    deterministic?: boolean;
  }>;
  optionalOutcomes?: Array<{
    verificationId: string;
    status: string;
    deterministic?: boolean;
  }>;
};

type FieldTestCoverageFile = {
  releaseId?: string;
  scenarios?: Array<{
    scenarioId: string;
    status: string;
  }>;
  optionalScenarios?: Array<{
    scenarioId: string;
    status: string;
  }>;
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function parseJsonFile<T extends object>(filePath: string): { data?: T; issue?: string } {
  if (!existsSync(filePath)) {
    return {
      issue: `missing_input:${filePath}`,
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        issue: `invalid_json_object:${filePath}`,
      };
    }

    return {
      data: parsed as T,
    };
  } catch {
    return {
      issue: `invalid_json_parse:${filePath}`,
    };
  }
}

function resolveReleaseEvidenceRootPath(input: {
  releaseId: string;
  evidenceRootPath?: string;
}): string {
  const basePath = input.evidenceRootPath ?? resolve(process.cwd(), '..', 'evidence');
  const resolved = resolve(basePath);
  if (resolved.endsWith(input.releaseId)) {
    return resolved;
  }

  return resolve(resolved, input.releaseId);
}

function evaluateOptionalVerificationOutcomes(
  scope: ReleaseReadinessScope,
  optionalOutcomes: VerificationOutcomeFile['optionalOutcomes'],
): string[] {
  if (scope !== 'committed_plus_optional' || !Array.isArray(optionalOutcomes)) {
    return [];
  }

  return optionalOutcomes
    .filter((outcome) => outcome.status !== 'pass' || outcome.deterministic === false)
    .map((outcome) => outcome.verificationId)
    .sort();
}

function evaluateOptionalFieldScenarios(
  scope: ReleaseReadinessScope,
  optionalScenarios: FieldTestCoverageFile['optionalScenarios'],
): string[] {
  if (scope !== 'committed_plus_optional' || !Array.isArray(optionalScenarios)) {
    return [];
  }

  return optionalScenarios
    .filter((scenario) => scenario.status !== 'pass')
    .map((scenario) => `optional_failed:${scenario.scenarioId}`)
    .sort();
}

function evaluateUsabilityCriteriaFailures(bundles: EvidenceBundleRecord[]): string[] {
  const failingCriteria: string[] = [];

  for (const bundle of bundles) {
    const summary = bundle.uiUsabilitySummary;
    if (!summary || typeof summary !== 'object') {
      continue;
    }

    const successCriteria = summary.successCriteria;
    if (!successCriteria || typeof successCriteria !== 'object') {
      continue;
    }

    const sc001 = (successCriteria as { sc001?: unknown }).sc001;
    const sc002 = (successCriteria as { sc002?: unknown }).sc002;
    const sc003 = (successCriteria as { sc003?: unknown }).sc003;
    const sc004 = (successCriteria as { sc004?: unknown }).sc004;
    const sc005 = (successCriteria as { sc005?: unknown }).sc005;
    const sc006 = (successCriteria as { sc006?: unknown }).sc006;
    const sc007 = (successCriteria as { sc007?: unknown }).sc007;

    if (sc001 !== 'pass') {
      failingCriteria.push('SC-001');
    }
    if (sc002 !== 'pass') {
      failingCriteria.push('SC-002');
    }
    if (sc003 !== 'pass') {
      failingCriteria.push('SC-003');
    }
    if (sc004 !== 'pass') {
      failingCriteria.push('SC-004');
    }
    if (sc005 !== 'pass') {
      failingCriteria.push('SC-005');
    }
    if (sc006 !== 'pass') {
      failingCriteria.push('SC-006');
    }
    if (sc007 !== 'pass') {
      failingCriteria.push('SC-007');
    }
  }

  return uniqSorted(failingCriteria);
}

export function runReleaseReadiness(input: RunReleaseReadinessInput): RunReleaseReadinessOutput {
  const now = input.now ?? (() => new Date());
  const scope = resolveReleaseReadinessScope(input.scope);
  const source = resolveReleaseReadinessSource({
    source: input.source,
    ciEnv: process.env.CI,
  });
  const releaseEvidenceRootPath = resolveReleaseEvidenceRootPath({
    releaseId: input.releaseId,
    evidenceRootPath: input.evidenceRootPath,
  });
  const verificationOutcomesPath =
    input.verificationOutcomesPath ?? resolve(releaseEvidenceRootPath, 'verification-outcomes.json');
  const fieldTestCoveragePath =
    input.fieldTestCoveragePath ?? resolve(releaseEvidenceRootPath, 'field-test-coverage.json');

  const canonicalSources = loadCanonicalSources({
    specsRootPath: input.specsRootPath,
  });

  const verificationInput = parseJsonFile<VerificationOutcomeFile>(verificationOutcomesPath);
  const fieldCoverageInput = parseJsonFile<FieldTestCoverageFile>(fieldTestCoveragePath);

  const missingArtifacts: string[] = [];
  const approvalIssues: string[] = [];
  if (verificationInput.issue) {
    missingArtifacts.push(verificationInput.issue);
  }
  if (fieldCoverageInput.issue) {
    missingArtifacts.push(fieldCoverageInput.issue);
  }

  const verificationFile = verificationInput.data;
  if (verificationFile?.releaseId && verificationFile.releaseId !== input.releaseId) {
    missingArtifacts.push(`release_mismatch:${verificationOutcomesPath}`);
  }
  if (verificationFile && verificationFile.outcomes !== undefined && !Array.isArray(verificationFile.outcomes)) {
    missingArtifacts.push(`invalid_json_array:${verificationOutcomesPath}:outcomes`);
  }
  if (verificationFile && verificationFile.optionalOutcomes !== undefined && !Array.isArray(verificationFile.optionalOutcomes)) {
    missingArtifacts.push(`invalid_json_array:${verificationOutcomesPath}:optionalOutcomes`);
  }

  const verificationEvaluation = evaluateCommittedVerificationOutcomes({
    committedVerificationIds: canonicalSources.committedVerificationIds,
    verificationOutcomes: Array.isArray(verificationFile?.outcomes) ? verificationFile.outcomes : [],
  });
  const optionalVerificationFailures = evaluateOptionalVerificationOutcomes(scope, verificationFile?.optionalOutcomes);

  const evidenceBundles = readEvidenceBundles({
    releaseEvidenceRootPath,
  });
  const evidenceValidation = validateEvidenceBundles({
    releaseId: input.releaseId,
    bundles: evidenceBundles,
  });
  const usabilityCriteriaFailures = evaluateUsabilityCriteriaFailures(evidenceValidation.validBundles);

  const approvalsValidation = validateApprovals({
    bundles: evidenceValidation.validBundles,
    gateOwnersByGateId: canonicalSources.gateOwnersByGateId,
    now,
  });

  const fieldCoverageFile = fieldCoverageInput.data;
  if (fieldCoverageFile?.releaseId && fieldCoverageFile.releaseId !== input.releaseId) {
    missingArtifacts.push(`release_mismatch:${fieldTestCoveragePath}`);
  }
  if (fieldCoverageFile && fieldCoverageFile.scenarios !== undefined && !Array.isArray(fieldCoverageFile.scenarios)) {
    missingArtifacts.push(`invalid_json_array:${fieldTestCoveragePath}:scenarios`);
  }
  if (fieldCoverageFile && fieldCoverageFile.optionalScenarios !== undefined && !Array.isArray(fieldCoverageFile.optionalScenarios)) {
    missingArtifacts.push(`invalid_json_array:${fieldTestCoveragePath}:optionalScenarios`);
  }

  const fieldCoverageValidation = validateCommittedFieldTestCoverage({
    committedScenarioIds: canonicalSources.committedFieldTestScenarioIds,
    coverageRecords: Array.isArray(fieldCoverageFile?.scenarios) ? fieldCoverageFile.scenarios : [],
  });
  const optionalFieldCoverageFailures = evaluateOptionalFieldScenarios(scope, fieldCoverageFile?.optionalScenarios);

  if (canonicalSources.unresolvedSources.length > 0) {
    for (const unresolvedSource of canonicalSources.unresolvedSources) {
      approvalIssues.push(`unresolved_canonical_source:${unresolvedSource}`);
    }
  }

  const report = buildReleaseReadinessReport({
    releaseId: input.releaseId,
    source,
    scope,
    failingVerificationIds: uniqSorted([
      ...verificationEvaluation.failingVerificationIds,
      ...optionalVerificationFailures,
      ...usabilityCriteriaFailures,
    ]),
    missingArtifacts: uniqSorted([...missingArtifacts, ...evidenceValidation.missingArtifacts]),
    approvalIssues: uniqSorted([...approvalIssues, ...approvalsValidation.approvalIssues]),
    fieldTestCoverageIssues: uniqSorted([
      ...fieldCoverageValidation.fieldTestCoverageIssues,
      ...optionalFieldCoverageFailures,
    ]),
  });

  return {
    report,
    sourceDocuments: canonicalSources.sourceDocuments,
  };
}
