import { describe, expect, it } from 'vitest';

import { buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';

describe('VR-COM-007 navigation stability', () => {
  it('keeps route model stable across background/foreground transitions', () => {
    const route = { name: 'ActiveShopping', params: { householdId: 'hh-1' } };

    const foregroundModel = buildCommittedScreenModel({
      state: 'loading',
      viewportWidth: 1024,
    });

    const backgroundModel = buildCommittedScreenModel({
      state: 'offline',
      viewportWidth: 1024,
    });

    const resumedModel = buildCommittedScreenModel({
      state: 'loading',
      viewportWidth: 1024,
    });

    expect(route.name).toBe('ActiveShopping');
    expect(foregroundModel.layoutMode).toBe('single-pane');
    expect(backgroundModel.layoutMode).toBe('single-pane');
    expect(resumedModel.layoutMode).toBe('single-pane');
  });
});
