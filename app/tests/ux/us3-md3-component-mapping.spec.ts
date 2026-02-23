import { describe, expect, it } from 'vitest';

import { getMd3ComponentMapping } from '../../src/ui/screens/CommittedScreens';

describe('US3 MD3 component mapping', () => {
  it('covers required state components for VR-COM-008', () => {
    const mapping = getMd3ComponentMapping();

    expect(mapping.empty).toBe('List.EmptyState');
    expect(mapping.loading).toBe('ActivityIndicator');
    expect(mapping.error).toBe('Banner');
    expect(mapping.offline).toBe('Banner');
    expect(mapping.itemRow).toBe('List.Item');
  });
});
