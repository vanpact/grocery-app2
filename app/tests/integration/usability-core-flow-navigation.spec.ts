import { describe, expect, it } from 'vitest';
import { COMMITTED_DESTINATIONS, buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';
import { buildActiveShoppingScreenModel } from '../../src/ui/screens/ActiveShoppingScreen';

describe('usability core flow navigation', () => {
  it('keeps all committed destinations reachable from the app shell in two interactions or less', () => {
    for (const destination of COMMITTED_DESTINATIONS) {
      const model = buildCommittedScreenModel({
        destination,
        state: 'loading',
        viewportWidth: 1024,
      });

      expect(model.navigationEntryPoints.length).toBeLessThanOrEqual(2);
      expect(model.routeKey.length).toBeGreaterThan(0);
    }
  });

  it('preserves add-then-validate action sequence and selected-destination state across transitions', () => {
    const activeModel = buildActiveShoppingScreenModel([], false);
    expect(activeModel.actionGroups[0].primaryAction).toBe('Add item to list');
    expect(activeModel.actionGroups[0].secondaryActions).toContain('Validate next item');

    for (const destination of COMMITTED_DESTINATIONS) {
      const model = buildCommittedScreenModel({
        destination,
        selectedDestination: destination,
        state: 'loading',
        viewportWidth: 390,
      });

      expect(model.selectedStateVisible).toBe(true);
      expect(model.selectedDestination).toBe(destination);
    }
  });
});
