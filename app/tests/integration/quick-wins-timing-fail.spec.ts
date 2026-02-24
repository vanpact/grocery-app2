import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runQuickWinsVerification } from '../../scripts/verify-quick-wins';

describe('quick-wins timing fail-closed flow', () => {
  it('fails when timing file is missing', () => {
    const root = mkdtempSync(join(tmpdir(), 'grocery-quick-wins-fail-missing-'));

    const output = runQuickWinsVerification({
      releaseId: 'RC-2026-03-01',
      gateId: 'G-QW-01',
      bundleId: 'EV-QW-BULK-ADD',
      timingRunsPath: join(root, 'missing.json'),
      evidenceRootDir: root,
      now: () => new Date('2026-03-01T10:00:00.000Z'),
    });

    expect(output.status).toBe('fail');
    expect(output.report.reasonCodes).toEqual(expect.arrayContaining(['MISSING_TIMING_RUNS_FILE']));
    expect(output.gateDecision.decision).toBe('cut');
  });

  it('fails when run set is malformed or below threshold', () => {
    const root = mkdtempSync(join(tmpdir(), 'grocery-quick-wins-fail-invalid-'));
    const runsFilePath = join(root, 'timing-runs.json');

    writeFileSync(
      runsFilePath,
      `${JSON.stringify(
        {
          baselineRuns: [
            { runId: 'b1', durationMs: 1000, scenarioId: 's1' },
            { runId: 'b2', durationMs: 980, scenarioId: 's2' },
          ],
          quickRuns: [
            { runId: 'q1', durationMs: 950, scenarioId: 's1' },
            { runId: 'q2', durationMs: -1, scenarioId: 's2' },
          ],
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const output = runQuickWinsVerification({
      releaseId: 'RC-2026-03-01',
      gateId: 'G-QW-01',
      bundleId: 'EV-QW-BULK-ADD',
      timingRunsPath: runsFilePath,
      evidenceRootDir: root,
      now: () => new Date('2026-03-01T10:00:00.000Z'),
    });

    expect(output.status).toBe('fail');
    expect(output.report.reasonCodes).toEqual(
      expect.arrayContaining([
        'INSUFFICIENT_BASELINE_RUNS',
        'INSUFFICIENT_QUICK_RUNS',
        'INVALID_QUICK_DURATION',
      ]),
    );
    expect(output.gateDecision.decision).toBe('cut');
  });
});
