import { existsSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { runQuickVerification } from '../../scripts/verify-quick';
import { runFullVerification } from '../../scripts/verify-full';
import { runStartAndroidEmulator } from '../../scripts/start-android-emulator';
import { runStartAndroidDevice } from '../../scripts/start-android-device';

describe('US3 startup policy contract', () => {
  it('keeps quick startup checks separate from full verification evidence run', async () => {
    const quick = await runQuickVerification({
      accountDirectory: {
        owner_primary: {
          email: 'owner.primary@example.com',
          role: 'validate',
          householdId: 'household_alpha',
        },
        member_primary: {
          email: 'member.primary@example.com',
          role: 'suggest',
          householdId: 'household_alpha',
        },
        outsider_primary: {
          email: 'outsider.primary@example.com',
          role: 'suggest',
          householdId: 'household_beta',
        },
      },
    });

    expect(quick.quickCheck.status).toBe('pass');
    expect('evidenceBundlePath' in quick).toBe(false);

    const evidenceRootDir = mkdtempSync(join(tmpdir(), 'grocery-policy-'));
    const full = runFullVerification({
      targetAlias: 'default',
      releaseId: 'RC-20260223',
      gateId: 'G-QW-01',
      bundleId: 'EV-RUNNABLE-CONTRACT',
      evidenceRootDir,
      now: () => new Date('2026-02-23T00:00:00.000Z'),
    });

    expect(full.runResult.status).toBe('passed');
    expect(existsSync(full.runResult.evidenceBundlePath)).toBe(true);
  });

  it('emulator and device startup wrappers invoke quick checks only', async () => {
    let quickCallCount = 0;
    const runQuick = async () => {
      quickCallCount += 1;
      return {
        targetAlias: 'default',
        quickCheck: {
          status: 'pass' as const,
          durationMs: 900,
          targetAlias: 'default',
          checks: {
            firebaseConfigValid: true,
            firestoreReachable: true,
            requiredAccountsReady: true,
            membershipFixtureReady: true,
          },
          failures: [],
        },
      };
    };

    const emulator = await runStartAndroidEmulator({
      runQuick,
      launch: () => 0,
    });
    const device = await runStartAndroidDevice({
      runQuick,
      launch: () => 0,
    });

    expect(quickCallCount).toBe(2);
    expect(emulator.status).toBe('started');
    expect(device.status).toBe('started');
  });
});
