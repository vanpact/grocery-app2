import { describe, expect, it } from 'vitest';

import {
  COMMITTED_DESTINATIONS,
  getCommittedScreenFamilyMapping,
  getMd3ComponentMapping,
} from '../../src/ui/screens/CommittedScreens';

describe('US3 MD3 component mapping', () => {
  it('covers required state components for VR-COM-008', () => {
    const mapping = getMd3ComponentMapping();

    expect(mapping.empty).toBe('List.EmptyState');
    expect(mapping.loading).toBe('ActivityIndicator');
    expect(mapping.error).toBe('Banner');
    expect(mapping.offline).toBe('Banner');
    expect(mapping['membership-required']).toBe('Banner');
    expect(mapping.itemRow).toBe('List.Item');
  });

  it('covers committed screen-family component mappings for all destinations', () => {
    const screenFamilyMapping = getCommittedScreenFamilyMapping();
    for (const destination of COMMITTED_DESTINATIONS) {
      expect(screenFamilyMapping[destination]).toBeDefined();
      expect(screenFamilyMapping[destination].container).toMatch(/Screen|Card/);
    }
  });
});
