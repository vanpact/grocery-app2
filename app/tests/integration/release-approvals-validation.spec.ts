import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release approvals validation', () => {
  it('returns not_ready when required owners are missing', () => {
    const workspace = createReleaseReadinessWorkspace({
      approvedOwners: ['Product Owner'],
      approvedAtUtc: '2026-02-23T11:00:00.000Z',
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.approvalIssues.join(' ')).toContain('missing_owners:G-QW-01');
  });

  it('treats freshness_hours <= 24 as valid and freshness_hours > 24 as stale', () => {
    const boundaryWorkspace = createReleaseReadinessWorkspace({
      approvedAtUtc: '2026-02-22T12:00:00.000Z',
    });

    const boundaryOutput = runReleaseReadiness({
      releaseId: boundaryWorkspace.releaseId,
      evidenceRootPath: boundaryWorkspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(boundaryOutput.report.approvalIssues.join(' ')).not.toContain('stale_approval');

    const staleWorkspace = createReleaseReadinessWorkspace({
      approvedAtUtc: '2026-02-22T11:59:59.000Z',
    });

    const staleOutput = runReleaseReadiness({
      releaseId: staleWorkspace.releaseId,
      evidenceRootPath: staleWorkspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(staleOutput.report.status).toBe('not_ready');
    expect(staleOutput.report.approvalIssues.join(' ')).toContain('stale_approval:G-QW-01');
  });
});
