import { describe, expect, it } from 'vitest';
import { evaluateCiReleaseDecision } from '../../scripts/lib/ciReleaseDecision';

describe('release CI enforcement contract', () => {
  it('blocks publication when readiness source is not ci_authoritative', () => {
    const decision = evaluateCiReleaseDecision({
      status: 'ready',
      releaseId: 'RC-2026-02-23',
      source: 'local_preview',
      scope: 'committed',
      failingVerificationIds: [],
      missingArtifacts: [],
      approvalIssues: [],
      fieldTestCoverageIssues: [],
      followUpActions: [],
    });

    expect(decision).toEqual({
      status: 'block_publication',
      reasonCodes: ['SOURCE_NOT_CI_AUTHORITATIVE'],
    });
  });

  it('allows publication for ready reports', () => {
    const decision = evaluateCiReleaseDecision({
      status: 'ready',
      releaseId: 'RC-2026-02-23',
      source: 'ci_authoritative',
      scope: 'committed',
      failingVerificationIds: [],
      missingArtifacts: [],
      approvalIssues: [],
      fieldTestCoverageIssues: [],
      followUpActions: [],
    });

    expect(decision).toEqual({
      status: 'allow_publication',
      reasonCodes: ['READINESS_READY'],
    });
  });

  it('blocks publication for not_ready reports with machine-readable reason codes', () => {
    const decision = evaluateCiReleaseDecision({
      status: 'not_ready',
      releaseId: 'RC-2026-02-23',
      source: 'ci_authoritative',
      scope: 'committed',
      failingVerificationIds: ['VR-COM-001-OFFLINE-REPLAY'],
      missingArtifacts: ['missing:approvals.json'],
      approvalIssues: ['missing_owners:G-QW-01:Engineering Lead'],
      fieldTestCoverageIssues: ['missing:FT-2'],
      followUpActions: [],
    });

    expect(decision.status).toBe('block_publication');
    expect(decision.reasonCodes).toEqual(
      expect.arrayContaining([
        'READINESS_NOT_READY',
        'VERIFICATION_FAILURES',
        'MISSING_OR_INVALID_ARTIFACTS',
        'APPROVAL_ISSUES',
        'FIELD_TEST_COVERAGE_ISSUES',
      ]),
    );
  });
});
