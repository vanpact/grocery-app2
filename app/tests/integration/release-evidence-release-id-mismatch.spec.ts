import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release evidence release identity mismatch', () => {
  it('returns not_ready when evidence release id mismatches candidate release', () => {
    const workspace = createReleaseReadinessWorkspace({
      releaseMismatch: true,
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts.join(' ')).toContain('release_mismatch');
  });
});
