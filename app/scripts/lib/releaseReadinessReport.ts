import { type ReleaseReadinessOutput, type ReleaseReadinessScope, type ReleaseReadinessSource } from '../../src/runtime/contracts';

type ReleaseReadinessReportInput = {
  releaseId: string;
  source: ReleaseReadinessSource;
  scope: ReleaseReadinessScope;
  failingVerificationIds: string[];
  missingArtifacts: string[];
  approvalIssues: string[];
  fieldTestCoverageIssues: string[];
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function buildFollowUpActions(input: {
  failingVerificationIds: string[];
  missingArtifacts: string[];
  approvalIssues: string[];
  fieldTestCoverageIssues: string[];
}): string[] {
  const actions: string[] = [];

  if (input.failingVerificationIds.length > 0) {
    actions.push('Regenerate committed verification outputs and resolve failing verification IDs.');
  }
  if (input.missingArtifacts.length > 0) {
    actions.push('Restore required evidence artifacts and fix malformed evidence bundle files.');
  }
  if (input.approvalIssues.length > 0) {
    actions.push('Collect complete fresh owner approvals and resolve canonical owner-source mismatches.');
  }
  if (input.fieldTestCoverageIssues.length > 0) {
    actions.push('Provide pass evidence for all committed field-test scenarios.');
  }

  return uniqSorted(actions);
}

export function buildReleaseReadinessReport(input: ReleaseReadinessReportInput): ReleaseReadinessOutput {
  const failingVerificationIds = uniqSorted(input.failingVerificationIds);
  const missingArtifacts = uniqSorted(input.missingArtifacts);
  const approvalIssues = uniqSorted(input.approvalIssues);
  const fieldTestCoverageIssues = uniqSorted(input.fieldTestCoverageIssues);
  const followUpActions = buildFollowUpActions({
    failingVerificationIds,
    missingArtifacts,
    approvalIssues,
    fieldTestCoverageIssues,
  });

  const status =
    failingVerificationIds.length === 0 &&
    missingArtifacts.length === 0 &&
    approvalIssues.length === 0 &&
    fieldTestCoverageIssues.length === 0
      ? 'ready'
      : 'not_ready';

  return {
    status,
    releaseId: input.releaseId,
    source: input.source,
    scope: input.scope,
    failingVerificationIds,
    missingArtifacts,
    approvalIssues,
    fieldTestCoverageIssues,
    followUpActions,
  };
}
