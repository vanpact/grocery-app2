import { readFileSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runFullVerification } from '../../scripts/verify-full';

describe('US3 deny-outcome security evidence', () => {
  it('includes explicit unauthorized deny evidence for role/household checks', () => {
    const evidenceRootDir = mkdtempSync(join(tmpdir(), 'grocery-security-'));
    const run = runFullVerification({
      targetAlias: 'default',
      releaseId: 'RC-20260223',
      gateId: 'G-QW-01',
      bundleId: 'EV-RUNNABLE-SECURITY',
      evidenceRootDir,
      now: () => new Date('2026-02-23T00:00:00.000Z'),
    });

    const securityResult = run.results.find(
      (result) => result.verificationId === 'VR-COM-003-ROLE-TRANSITION-ENFORCEMENT',
    );
    const markdown = readFileSync(
      join(run.runResult.evidenceBundlePath, 'verification-results.md'),
      'utf8',
    );

    expect(securityResult?.notes).toContain('deny outcomes');
    expect(markdown).toContain('VR-COM-003-ROLE-TRANSITION-ENFORCEMENT');
    expect(markdown).toContain('deny outcomes');
  });
});
