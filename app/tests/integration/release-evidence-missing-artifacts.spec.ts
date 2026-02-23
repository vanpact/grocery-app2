import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release evidence missing artifacts', () => {
  it('returns not_ready when mandatory artifacts are missing', () => {
    const workspace = createReleaseReadinessWorkspace({
      missingArtifacts: ['approvals.json'],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toEqual(expect.arrayContaining(['missing:G-QW-01/EV-RELEASE-READINESS/approvals.json']));
  });
});
