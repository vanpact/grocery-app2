import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release field-test coverage pass path', () => {
  it('keeps readiness unblocked when all committed field-test scenarios are pass', () => {
    const workspace = createReleaseReadinessWorkspace();

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('ready');
    expect(output.report.fieldTestCoverageIssues).toEqual([]);
  });
});
