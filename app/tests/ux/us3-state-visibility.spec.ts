import { describe, expect, it } from 'vitest';

import { getStateFeedback } from '../../src/ui/components/StateFeedback';

describe('US3 state visibility', () => {
  it('returns explicit messages for empty/loading/error/offline', () => {
    expect(getStateFeedback('empty').message).toContain('No items yet');
    expect(getStateFeedback('loading').message).toContain('Loading');
    expect(getStateFeedback('error').message).toContain('Something went wrong');
    expect(getStateFeedback('offline').message).toContain('Offline mode');
  });
});
