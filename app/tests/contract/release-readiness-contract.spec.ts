import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release-readiness contract', () => {
  it('returns the expected readiness report shape for committed scope', () => {
    const workspace = createReleaseReadinessWorkspace();
    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report).toMatchObject({
      status: 'ready',
      releaseId: workspace.releaseId,
      source: 'local_preview',
      scope: 'committed',
      failingVerificationIds: [],
      missingArtifacts: [],
      approvalIssues: [],
      fieldTestCoverageIssues: [],
    });
    expect(Array.isArray(output.report.followUpActions)).toBe(true);
  });
});
