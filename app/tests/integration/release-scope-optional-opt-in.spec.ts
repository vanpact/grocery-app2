import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release scope explicit optional opt-in', () => {
  it('treats optional failures as blocking when optional scope is explicitly included', () => {
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
      scope: 'committed_plus_optional',
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.failingVerificationIds).toEqual(expect.arrayContaining(['VR-CND-101-BULK-ADD-TIME']));
    expect(output.report.fieldTestCoverageIssues).toEqual(expect.arrayContaining(['optional_failed:FT-OPTIONAL-1']));
  });
});
