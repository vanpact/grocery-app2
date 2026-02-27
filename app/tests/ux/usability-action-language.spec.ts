import { describe, expect, it } from 'vitest';
import { COMMITTED_DESTINATIONS, buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';

const EXPLICIT_ACTION_PATTERN = /sign|add|validate|retry|continue|review|manage|open/i;

describe('usability action language', () => {
  it('uses explicit language while preserving primary-vs-secondary hierarchy and copy uniqueness', () => {
    for (const destination of COMMITTED_DESTINATIONS) {
      const model = buildCommittedScreenModel({
        destination,
        state: 'loading',
        viewportWidth: 1024,
      });

      expect(model.primaryActions.length).toBe(1);
      expect(model.actionCopyUniqueness).toBe('pass');

      for (const action of [...model.primaryActions, ...model.secondaryActions, ...model.destructiveActions]) {
        expect(action).toMatch(EXPLICIT_ACTION_PATTERN);
      }

      for (const primaryAction of model.primaryActions) {
        expect(model.secondaryActions).not.toContain(primaryAction);
        expect(model.destructiveActions).not.toContain(primaryAction);
      }
    }
  });
});
