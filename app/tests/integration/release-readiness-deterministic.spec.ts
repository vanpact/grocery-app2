import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release readiness deterministic output', () => {
  it('returns identical results for unchanged candidate inputs', () => {
    const workspace = createReleaseReadinessWorkspace({
      verificationStatusOverrides: {
        'VR-COM-003-ROLE-TRANSITION-ENFORCEMENT': 'fail',
      },
      missingFieldScenarioIds: ['FT-2'],
    });

    const now = () => new Date('2026-02-23T12:00:00.000Z');
    const firstRun = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now,
    });
    const secondRun = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now,
    });

    expect(secondRun.report).toEqual(firstRun.report);
  });
});
