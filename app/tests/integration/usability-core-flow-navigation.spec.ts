import { describe, expect, it } from 'vitest';
import { COMMITTED_DESTINATIONS, buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';

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
});
