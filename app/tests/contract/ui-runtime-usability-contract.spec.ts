import { describe, expect, it } from 'vitest';
import {
  COMMITTED_DESTINATIONS,
  buildCommittedScreenModel,
  getCommittedDestinationModels,
  getCommittedScreenFamilyMapping,
} from '../../src/ui/screens/CommittedScreens';

describe('ui runtime usability contract', () => {
  it('covers all committed destinations with explicit primary actions', () => {
    const models = getCommittedDestinationModels();
    expect(models.map((model) => model.destination)).toEqual(COMMITTED_DESTINATIONS);
    for (const model of models) {
      expect(model.primaryActions.length).toBeGreaterThan(0);
      expect(model.navigationEntryPoints.length).toBeGreaterThan(0);
    }
  });

  it('provides committed md3 screen-family coverage for each destination', () => {
    const mapping = getCommittedScreenFamilyMapping();
    for (const destination of COMMITTED_DESTINATIONS) {
      expect(mapping[destination]).toBeDefined();
      expect(mapping[destination].primaryActionComponent).toMatch(/Button|FAB/);
    }
  });

  it('enforces wrapped-top navigation at <600 and context-only two-pane mode at >=1200', () => {
    const mobile = buildCommittedScreenModel({
      destination: 'active-shopping',
      state: 'loading',
      viewportWidth: 390,
    });
    expect(mobile.navigationPattern).toBe('top-wrapped');
    expect(mobile.layoutMode).toBe('single-pane');
    expect(mobile.secondaryPaneMode).toBe('n/a');

    const desktop = buildCommittedScreenModel({
      destination: 'active-shopping',
      state: 'loading',
      viewportWidth: 1280,
    });
    expect(desktop.layoutMode).toBe('two-pane');
    expect(desktop.secondaryPaneMode).toBe('context-only');
    expect(desktop.desktopTwoPaneContextOnly).toBe(true);
  });
});
