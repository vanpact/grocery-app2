import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release readiness ready decision', () => {
  it('returns ready when committed verification, evidence, approvals, and field coverage are complete', () => {
    const workspace = createReleaseReadinessWorkspace();
    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('ready');
    expect(output.report.failingVerificationIds).toEqual([]);
    expect(output.report.missingArtifacts).toEqual([]);
    expect(output.report.approvalIssues).toEqual([]);
    expect(output.report.fieldTestCoverageIssues).toEqual([]);
  });
});
