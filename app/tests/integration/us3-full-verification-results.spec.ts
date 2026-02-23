import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runFullVerification } from '../../scripts/verify-full';

describe('US3 full verification deterministic results', () => {
  it('returns deterministic pass/fail output for the same inputs and explicit overrides', () => {
    const now = () => new Date('2026-02-23T12:00:00.000Z');

    const passRun = runFullVerification({
      targetAlias: 'default',
      releaseId: 'RC-20260223',
      gateId: 'G-QW-01',
      bundleId: 'EV-RUNNABLE-PASS',
      evidenceRootDir: mkdtempSync(join(tmpdir(), 'grocery-verify-pass-')),
      now,
    });

    const failRun = runFullVerification({
      targetAlias: 'default',
      releaseId: 'RC-20260223',
      gateId: 'G-QW-01',
      bundleId: 'EV-RUNNABLE-FAIL',
      evidenceRootDir: mkdtempSync(join(tmpdir(), 'grocery-verify-fail-')),
      statusOverrides: {
        'VR-COM-003-ROLE-TRANSITION-ENFORCEMENT': 'fail',
      },
      now,
    });

    expect(passRun.runResult.status).toBe('passed');
    expect(failRun.runResult.status).toBe('failed');
    expect(passRun.results.map((result) => result.verificationId)).toEqual(
      failRun.results.map((result) => result.verificationId),
    );
  });
});
