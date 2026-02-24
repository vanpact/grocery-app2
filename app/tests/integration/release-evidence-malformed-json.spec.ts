import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runReleaseReadiness } from '../../scripts/lib/releaseReadinessRunner';
import { createReleaseReadinessWorkspace } from '../helpers/releaseReadiness';

describe('release evidence malformed json', () => {
  it('returns not_ready when required JSON artifacts are malformed', () => {
    const workspace = createReleaseReadinessWorkspace({
      malformedArtifacts: ['decision.json'],
    });

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts.join(' ')).toContain('decision.json');
  });

  it('returns not_ready when committed outcomes is not an array', () => {
    const workspace = createReleaseReadinessWorkspace();
    writeFileSync(
      workspace.verificationOutcomesPath,
      `${JSON.stringify(
        {
          releaseId: workspace.releaseId,
          outcomes: { malformed: true },
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toContain(
      `invalid_json_array:${workspace.verificationOutcomesPath}:outcomes`,
    );
  });

  it('returns not_ready when committed field scenarios is not an array', () => {
    const workspace = createReleaseReadinessWorkspace();
    writeFileSync(
      workspace.fieldTestCoveragePath,
      `${JSON.stringify(
        {
          releaseId: workspace.releaseId,
          scenarios: { malformed: true },
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toContain(
      `invalid_json_array:${workspace.fieldTestCoveragePath}:scenarios`,
    );
  });

  it('returns not_ready when optional outcomes is not an array in optional scope', () => {
    const workspace = createReleaseReadinessWorkspace();
    writeFileSync(
      workspace.verificationOutcomesPath,
      `${JSON.stringify(
        {
          releaseId: workspace.releaseId,
          outcomes: workspace.committedVerificationIds.map((verificationId) => ({
            verificationId,
            status: 'pass',
            deterministic: true,
          })),
          optionalOutcomes: { malformed: true },
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      scope: 'committed_plus_optional',
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toContain(
      `invalid_json_array:${workspace.verificationOutcomesPath}:optionalOutcomes`,
    );
  });

  it('returns not_ready when optional field scenarios is not an array in optional scope', () => {
    const workspace = createReleaseReadinessWorkspace();
    writeFileSync(
      workspace.fieldTestCoveragePath,
      `${JSON.stringify(
        {
          releaseId: workspace.releaseId,
          scenarios: workspace.committedFieldScenarioIds.map((scenarioId) => ({
            scenarioId,
            status: 'pass',
          })),
          optionalScenarios: { malformed: true },
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      scope: 'committed_plus_optional',
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toContain(
      `invalid_json_array:${workspace.fieldTestCoveragePath}:optionalScenarios`,
    );
  });

  it('returns not_ready when deterministic is non-boolean in committed outcomes', () => {
    const workspace = createReleaseReadinessWorkspace();
    const targetVerificationId = workspace.committedVerificationIds[0];
    writeFileSync(
      workspace.verificationOutcomesPath,
      `${JSON.stringify(
        {
          releaseId: workspace.releaseId,
          outcomes: workspace.committedVerificationIds.map((verificationId) => ({
            verificationId,
            status: 'pass',
            deterministic: verificationId === targetVerificationId ? 'false' : true,
          })),
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.failingVerificationIds).toContain(targetVerificationId);
  });

  it('returns not_ready when decision payload is missing required fields', () => {
    const workspace = createReleaseReadinessWorkspace();
    const decisionPath = join(workspace.releaseEvidenceRootPath, 'G-QW-01', 'EV-RELEASE-READINESS', 'decision.json');
    writeFileSync(
      decisionPath,
      `${JSON.stringify(
        {
          gate_id: 'G-QW-01',
          bundle_id: 'EV-RELEASE-READINESS',
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runReleaseReadiness({
      releaseId: workspace.releaseId,
      evidenceRootPath: workspace.evidenceRootPath,
      now: () => new Date('2026-02-23T12:00:00.000Z'),
    });

    expect(output.report.status).toBe('not_ready');
    expect(output.report.missingArtifacts).toContain('invalid_payload:G-QW-01/EV-RELEASE-READINESS/decision.json:decision');
  });
});
