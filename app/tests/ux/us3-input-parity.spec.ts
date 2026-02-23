import { describe, expect, it } from 'vitest';

import { toCommittedAction } from '../../src/ui/web/interactionParity';

describe('US3 input parity web', () => {
  it('produces the same committed action for keyboard and pointer', () => {
    const keyboard = toCommittedAction('keyboard', 'Enter', 'validate-item');
    const pointer = toCommittedAction('pointer', 'click', 'validate-item');

    expect(keyboard).toEqual(pointer);
    expect(keyboard).toEqual({ type: 'validate', source: 'validate-item' });
  });
});
