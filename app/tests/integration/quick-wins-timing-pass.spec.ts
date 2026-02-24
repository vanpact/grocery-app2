import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runQuickWinsVerification } from '../../scripts/verify-quick-wins';
import { loadQuickWinsTimingRunsFixture } from '../helpers/quickWins';

describe('quick-wins timing pass flow', () => {
  it('passes threshold and writes gate evidence artifacts', () => {
    const fixture = loadQuickWinsTimingRunsFixture();
    const root = mkdtempSync(join(tmpdir(), 'grocery-quick-wins-pass-'));
    const runsFilePath = join(root, 'timing-runs.json');

    writeFileSync(
      runsFilePath,
      `${JSON.stringify(
        {
          baselineRuns: fixture.passCase.baselineRuns,
          quickRuns: fixture.passCase.quickRuns,
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

    expect(output.status).toBe('pass');
    expect(output.report.status).toBe('pass');
    expect(output.gateDecision.decision).toBe('retain');
    expect(existsSync(join(output.evidenceBundlePath, 'verification-results.md'))).toBe(true);
    expect(existsSync(join(output.evidenceBundlePath, 'raw-data', 'quick-wins-timing-report.json'))).toBe(true);
    expect(existsSync(join(output.evidenceBundlePath, 'raw-data', 'quick-wins-timing-runs.json'))).toBe(true);
  });
});
