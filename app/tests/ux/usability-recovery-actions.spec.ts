import { describe, expect, it } from 'vitest';
import { getRecoveryActions } from '../../src/ui/components/StateFeedback';
import { loadUsabilityFixtures } from '../helpers/usability';

describe('usability recovery actions', () => {
  it('matches the fixed state recovery-action contract', () => {
    const fixtures = loadUsabilityFixtures();

    expect(getRecoveryActions('error')).toEqual(fixtures.stateMatrix.expectedRecoveryActions.error);
    expect(getRecoveryActions('offline')).toEqual(fixtures.stateMatrix.expectedRecoveryActions.offline);
    expect(getRecoveryActions('membership-required')).toEqual(
      fixtures.stateMatrix.expectedRecoveryActions['membership-required'],
    );
  });
});
