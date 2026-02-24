import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release verification id completeness', () => {
  it('marks not_ready when committed verification IDs are missing or duplicated', () => {
    const workspace = createReleaseReadinessWorkspace({
      missingVerificationIds: ['VR-COM-002-DEDUP-KEY-COLLISION'],
      duplicateVerificationIds: ['VR-COM-003-ROLE-TRANSITION-ENFORCEMENT'],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.failingVerificationIds).toEqual(
      expect.arrayContaining(['VR-COM-002-DEDUP-KEY-COLLISION', 'VR-COM-003-ROLE-TRANSITION-ENFORCEMENT']),
    );
  });
});
