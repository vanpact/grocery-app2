import { describe, expect, it } from 'vitest';
import { buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';
import { loadUsabilityFixtures } from '../helpers/usability';

describe('US3 state visibility', () => {
  it('returns explicit, non-duplicative messages for all required states across committed destinations', () => {
    const fixtures = loadUsabilityFixtures();

    for (const destination of fixtures.stateMatrix.destinations) {
      for (const state of fixtures.stateMatrix.requiredStates) {
        const model = buildCommittedScreenModel({
          destination: destination as 'sign-in' | 'active-shopping' | 'overview' | 'settings',
          state: state as 'empty' | 'loading' | 'error' | 'offline' | 'membership-required',
          viewportWidth: 1024,
        });

        expect(model.feedback.message.trim().length).toBeGreaterThan(0);
        expect(model.snapshot.hasSilentFailure).toBe(false);
        const sentenceFragments = model.feedback.message
          .split('.')
          .map((fragment) => fragment.trim())
          .filter((fragment) => fragment.length > 0);
        expect(new Set(sentenceFragments).size).toBe(sentenceFragments.length);
      }
    }
  });
});
