import { describe, expect, it } from 'vitest';
import {
  COMMITTED_DESTINATIONS,
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
});
