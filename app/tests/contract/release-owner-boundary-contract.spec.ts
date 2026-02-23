import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release owner boundary contract', () => {
  it('returns not_ready when evidence required owners do not match canonical gate owners', () => {
    const workspace = createReleaseReadinessWorkspace({
      requiredOwners: ['Engineering Lead', 'Security Owner'],
      approvedOwners: ['Engineering Lead', 'Security Owner'],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.approvalIssues).toEqual(expect.arrayContaining(['owner_boundary_mismatch:G-QW-01']));
  });

  it('returns not_ready when canonical sources cannot be resolved', () => {
    const workspace = createReleaseReadinessWorkspace();

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      specsRootPath: 'C:/non-existent/specs-root',
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.approvalIssues.join(' ')).toContain('unresolved_canonical_source');
  });
});
