import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release readiness runtime budget', () => {
  it('generates report within the 10-minute budget for standard fixtures', () => {
    const workspace = createReleaseReadinessWorkspace();

    const startedAt = Date.now();
    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });
    const completedAt = Date.now();

    expect(output.report.status).toBe('ready');
    expect(completedAt - startedAt).toBeLessThan(600_000);
  });
});
