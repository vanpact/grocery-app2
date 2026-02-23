import { describe, expect, it } from 'vitest';

import {
  createLifecycleSnapshot,
  resumeLifecycleSnapshot,
} from '../../src/ui/layout/DesktopWorkspace';

describe('VR-COM-021 navigation lifecycle resume', () => {
  it('restores route and queue snapshot within 30 minute offline window', () => {
    const now = new Date('2026-02-23T00:00:00.000Z');
    const snapshot = createLifecycleSnapshot('ActiveShopping', ['m1', 'm2'], now);

    const resumed = resumeLifecycleSnapshot(
      snapshot,
      new Date('2026-02-23T00:20:00.000Z'),
    );

    expect(resumed.restored).toBe(true);
    expect(resumed.routeName).toBe('ActiveShopping');
    expect(resumed.pendingMutationIds).toEqual(['m1', 'm2']);
  });

  it('refuses restore after 30 minute threshold', () => {
    const now = new Date('2026-02-23T00:00:00.000Z');
    const snapshot = createLifecycleSnapshot('ActiveShopping', ['m1'], now);

    const resumed = resumeLifecycleSnapshot(
      snapshot,
      new Date('2026-02-23T00:31:00.000Z'),
    );

    expect(resumed.restored).toBe(false);
    expect(resumed.reason).toBe('resume_window_expired');
  });
});
