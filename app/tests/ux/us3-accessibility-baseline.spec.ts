import { describe, expect, it } from 'vitest';

import { getStateFeedback } from '../../src/ui/components/StateFeedback';
import { getInteractionAccessibility } from '../../src/ui/web/interactionParity';

describe('VR-COM-020 accessibility baseline', () => {
  it('exposes focus and aria metadata for committed feedback states', () => {
    const offline = getStateFeedback('offline');

    expect(offline.accessibility.ariaLabel).toContain('Offline');
    expect(offline.accessibility.focusIndicatorRequired).toBe(true);
  });

  it('defines keyboard and pointer accessibility mapping for committed actions', () => {
    const a11y = getInteractionAccessibility('validate-item');

    expect(a11y.keyboardShortcut).toBe('Enter');
    expect(a11y.pointerTrigger).toBe('click');
    expect(a11y.ariaLabel).toBe('validate item');
  });
});
