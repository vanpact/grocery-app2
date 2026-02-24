import { describe, expect, it } from 'vitest';
import { getCommittedDestinationModels } from '../../src/ui/screens/CommittedScreens';

const EXPLICIT_ACTION_PATTERN = /sign|add|validate|retry|continue|review|manage|open/i;

describe('usability action language', () => {
  it('uses explicit action language for committed primary controls', () => {
    const models = getCommittedDestinationModels();
    for (const model of models) {
      for (const action of model.primaryActions) {
        expect(action).toMatch(EXPLICIT_ACTION_PATTERN);
      }
    }
  });
});
