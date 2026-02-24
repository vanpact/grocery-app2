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
        expect(model.navigationEntryPoints.length).toBeLessThanOrEqual(2);
      }
    }
  });

  it('falls back to mobile layout when viewport width is non-finite', () => {
    expect(resolveLayoutMode(Number.NaN)).toBe('mobile');
    expect(resolveLayoutMode(Number.POSITIVE_INFINITY)).toBe('mobile');
  });
});
