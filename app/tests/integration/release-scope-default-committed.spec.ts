import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release scope default committed', () => {
  it('ignores optional-only failures under committed default scope', () => {
    const workspace = createReleaseReadinessWorkspace({
      optionalVerificationOutcomes: [
        {
          verificationId: 'VR-CND-101-BULK-ADD-TIME',
          status: 'fail',
          deterministic: true,
        },
      ],
      optionalFieldScenarios: [
        {
          scenarioId: 'FT-OPTIONAL-1',
          status: 'fail',
        },
      ],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      scope: 'committed',
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('ready');
    expect(output.report.failingVerificationIds).toEqual([]);
    expect(output.report.fieldTestCoverageIssues).toEqual([]);
  });
});
