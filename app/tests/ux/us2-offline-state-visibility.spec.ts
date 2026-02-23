import { describe, expect, it } from 'vitest';
import { getStateFeedback } from '../../src/ui/components/StateFeedback';
import { buildActiveShoppingScreenModel } from '../../src/ui/screens/ActiveShoppingScreen';

describe('US2 offline/reconnecting state visibility', () => {
  it('surfaces explicit offline and reconnecting state messaging', () => {
    expect(getStateFeedback('offline').message).toContain('Offline mode');
    expect(getStateFeedback('reconnecting').message).toContain('Reconnecting');

    const model = buildActiveShoppingScreenModel([], true, {
      isReconnecting: true,
    });

    expect(model.offlineIndicator).toContain('Offline mode');
    expect(model.reconnectingIndicator).toContain('Reconnecting');
  });
});
