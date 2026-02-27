import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('usability readiness blocking', () => {
  it('returns not_ready when SC-004/SC-005/SC-006/SC-007 usability criteria fail', () => {
    const workspace = createReleaseReadinessWorkspace({
      usabilitySummaryOverrides: {
        sc004: 'fail',
        sc005: 'fail',
        sc006: 'fail',
        sc007: 'fail',
      },
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-24T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.failingVerificationIds).toEqual(
      expect.arrayContaining(['SC-004', 'SC-005', 'SC-006', 'SC-007']),
    );
  });

  it('returns not_ready when required playwright/mobile evidence indexes are missing', () => {
    const workspace = createReleaseReadinessWorkspace({
      missingArtifacts: ['raw-data/ui-refresh-playwright-artifacts.json', 'raw-data/ui-refresh-mobile-mcp-artifacts.json'],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-24T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toEqual(
      expect.arrayContaining([
        'missing:G-QW-01/EV-RELEASE-READINESS/raw-data/ui-refresh-playwright-artifacts.json',
        'missing:G-QW-01/EV-RELEASE-READINESS/raw-data/ui-refresh-mobile-mcp-artifacts.json',
      ]),
    );
  });
});
