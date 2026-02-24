import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release field-test coverage fail path', () => {
  it('returns not_ready when committed field-test scenarios are missing or failed', () => {
    const workspace = createReleaseReadinessWorkspace({
      missingFieldScenarioIds: ['FT-2'],
      fieldScenarioStatusOverrides: {
        'FT-UX-WEB-600-839': 'fail',
      },
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.fieldTestCoverageIssues).toEqual(
      expect.arrayContaining(['failed:FT-UX-WEB-600-839', 'missing:FT-2']),
    );
  });
});
