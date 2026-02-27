import { describe, expect, it } from 'vitest';

import { resolveLayoutMode, resolveViewportBand } from '../../src/ui/layout/layoutModeResolver';
import { buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';
import { loadUsabilityFixtures } from '../helpers/usability';

describe('US3 responsive layout coverage', () => {
  it('maps widths to committed bands and layouts', () => {
    const fixtures = loadUsabilityFixtures();
    for (const viewport of fixtures.layoutAndParity.viewports) {
      expect(resolveViewportBand(viewport.width)).toBe(viewport.expectedBand);
      expect(resolveLayoutMode(viewport.width)).toBe(viewport.expectedLayout);
    }
  });

  it('keeps all destinations reachable across every committed viewport band', () => {
    const fixtures = loadUsabilityFixtures();
    const destinations = fixtures.stateMatrix.destinations as Array<'sign-in' | 'active-shopping' | 'overview' | 'settings'>;

    for (const destination of destinations) {
      for (const viewport of fixtures.layoutAndParity.viewports) {
        const model = buildCommittedScreenModel({
          destination,
          state: 'loading',
          viewportWidth: viewport.width,
        });

        expect(model.viewportBand).toBe(viewport.expectedBand);
        if (viewport.expectedBand === '<600') {
          expect(model.navigationPattern).toBe('top-wrapped');
          expect(model.navigationWraps).toBe(true);
        }
        if (viewport.expectedBand === '>=1200') {
          expect(model.layoutMode).toBe('two-pane');
          expect(model.secondaryPaneMode).toBe('context-only');
        }
        expect(model.navigationEntryPoints.length).toBeLessThanOrEqual(2);
      }
    }
  });

  it('keeps key controls visible at committed mobile viewport matrix sizes', () => {
    const committedMobileMatrix = [
      { width: 360, height: 640 },
      { width: 390, height: 844 },
      { width: 412, height: 915 },
    ];

    for (const viewport of committedMobileMatrix) {
      const model = buildCommittedScreenModel({
        destination: 'active-shopping',
        state: 'loading',
        viewportWidth: viewport.width,
      });

      expect(model.primaryActions[0]).toBe('Add item to list');
      expect(model.navigationPattern).toBe('top-wrapped');
      expect(model.layoutMode).toBe('single-pane');
      expect(viewport.height).toBeGreaterThan(0);
    }
  });

  it('falls back to single-pane layout when viewport width is non-finite', () => {
    expect(resolveLayoutMode(Number.NaN)).toBe('single-pane');
    expect(resolveLayoutMode(Number.POSITIVE_INFINITY)).toBe('single-pane');
  });
});
