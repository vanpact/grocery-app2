import { describe, expect, it } from 'vitest';
import { runStartAndroidEmulator } from '../../scripts/start-android-emulator';
import { runStartAndroidDevice } from '../../scripts/start-android-device';

describe('US1 emulator vs phone parity', () => {
  it('runs the same quick-check startup policy on emulator and phone wrappers', async () => {
    const quickCheck = {
      status: 'pass' as const,
      durationMs: 1_000,
      targetAlias: 'default',
      checks: {
        firebaseConfigValid: true,
        firestoreReachable: true,
        requiredAccountsReady: true,
        membershipFixtureReady: true,
      },
      failures: [],
    };

    const runQuick = async () => ({
      targetAlias: 'default',
      quickCheck,
    });

    const emulator = await runStartAndroidEmulator({
      runQuick,
      launch: () => 0,
    });
    const device = await runStartAndroidDevice({
      runQuick,
      launch: () => 0,
    });

    expect(emulator.status).toBe('started');
    expect(device.status).toBe('started');
    expect(emulator.startupGate.quickCheck).toEqual(device.startupGate.quickCheck);
  });
});
