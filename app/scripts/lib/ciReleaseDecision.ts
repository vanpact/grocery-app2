import { readFileSync } from 'node:fs';
import { type CiGateDecision, type ReleaseReadinessOutput } from '../../src/runtime/contracts';

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function evaluateCiReleaseDecision(report: ReleaseReadinessOutput): CiGateDecision {
  if (report.source !== 'ci_authoritative') {
    return {
      status: 'block_publication',
      reasonCodes: ['SOURCE_NOT_CI_AUTHORITATIVE'],
    };
  }

  if (report.status === 'ready') {
    return {
      status: 'allow_publication',
      reasonCodes: ['READINESS_READY'],
    };
  }

  const reasonCodes: string[] = ['READINESS_NOT_READY'];
  if (report.failingVerificationIds.length > 0) {
    reasonCodes.push('VERIFICATION_FAILURES');
  }
  if (report.missingArtifacts.length > 0) {
    reasonCodes.push('MISSING_OR_INVALID_ARTIFACTS');
  }
  if (report.approvalIssues.length > 0) {
    reasonCodes.push('APPROVAL_ISSUES');
  }
  if (report.fieldTestCoverageIssues.length > 0) {
    reasonCodes.push('FIELD_TEST_COVERAGE_ISSUES');
  }

  return {
    status: 'block_publication',
    reasonCodes: uniqSorted(reasonCodes),
  };
}

export function evaluateCiReleaseDecisionFromFile(readinessReportPath: string): CiGateDecision {
  const parsed = JSON.parse(readFileSync(readinessReportPath, 'utf8')) as ReleaseReadinessOutput;
  return evaluateCiReleaseDecision(parsed);
}
