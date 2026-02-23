import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release readiness not_ready decision', () => {
  it('returns not_ready and failing IDs when committed outcomes fail or are missing', () => {
    const workspace = createReleaseReadinessWorkspace({
      verificationStatusOverrides: {
        'VR-COM-003-ROLE-TRANSITION-ENFORCEMENT': 'fail',
      },
      missingVerificationIds: ['VR-COM-005-STATE-VISIBILITY'],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.failingVerificationIds).toEqual(
      expect.arrayContaining(['VR-COM-003-ROLE-TRANSITION-ENFORCEMENT', 'VR-COM-005-STATE-VISIBILITY']),
    );
  });
});
