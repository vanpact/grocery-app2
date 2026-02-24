import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('usability readiness blocking', () => {
  it('returns not_ready when SC-006/SC-007 usability criteria fail', () => {
    const workspace = createReleaseReadinessWorkspace({
      usabilitySummaryOverrides: {
        sc006: 'fail',
        sc007: 'fail',
        sc008: 'not_ready',
      },
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-24T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.failingVerificationIds).toEqual(expect.arrayContaining(['SC-006', 'SC-007', 'SC-008']));
  });
});
