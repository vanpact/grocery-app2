import { existsSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runFullVerification } from '../../scripts/verify-full';

describe('US3 evidence bundle mandatory files', () => {
  it('writes the canonical evidence artifact set', () => {
    const evidenceRootDir = mkdtempSync(join(tmpdir(), 'grocery-evidence-'));
    const run = runFullVerification({
      targetAlias: 'default',
      releaseId: 'RC-20260223',
      gateId: 'G-QW-01',
      bundleId: 'EV-RUNNABLE-FILES',
      evidenceRootDir,
      now: () => new Date('2026-02-23T00:00:00.000Z'),
    });

    const bundlePath = run.runResult.evidenceBundlePath;

    expect(existsSync(join(bundlePath, 'manifest.json'))).toBe(true);
    expect(existsSync(join(bundlePath, 'verification-results.md'))).toBe(true);
    expect(existsSync(join(bundlePath, 'raw-data'))).toBe(true);
    expect(existsSync(join(bundlePath, 'decision.json'))).toBe(true);
    expect(existsSync(join(bundlePath, 'approvals.json'))).toBe(true);
  });
});
