import { describe, expect, it } from 'vitest';
import { getRecoveryActions } from '../../src/ui/components/StateFeedback';
import { buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';
import { loadUsabilityFixtures } from '../helpers/usability';

describe('usability recovery actions', () => {
  it('matches the fixed state recovery-action contract and preserves outcome-oriented labels', () => {
    const fixtures = loadUsabilityFixtures();

    expect(getRecoveryActions('error')).toEqual(fixtures.stateMatrix.expectedRecoveryActions.error);
    expect(getRecoveryActions('offline')).toEqual(fixtures.stateMatrix.expectedRecoveryActions.offline);
    expect(getRecoveryActions('membership-required')).toEqual(
      fixtures.stateMatrix.expectedRecoveryActions['membership-required'],
    );

    const signIn = buildCommittedScreenModel({
      destination: 'sign-in',
      state: 'membership-required',
      viewportWidth: 390,
    });
    const settings = buildCommittedScreenModel({
      destination: 'settings',
      state: 'error',
      viewportWidth: 390,
    });

    for (const action of [...signIn.secondaryActions, ...settings.secondaryActions]) {
      expect(action).toMatch(/Retry|Continue|Manage|Open|Review|Sign/i);
    }
  });
});
