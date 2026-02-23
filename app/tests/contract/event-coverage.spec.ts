import { describe, expect, it } from 'vitest';

import { createEventLogger } from '../../src/events/eventLogger';
import { emitCommittedEvent } from '../../src/events/committedEventHandlers';

describe('VR-COM-006 event coverage', () => {
  it('emits all required committed event types', () => {
    const logger = createEventLogger();

    const required = ['add', 'merge', 'validate', 'toggle', 'undo', 'error_retry'] as const;

    for (const type of required) {
      emitCommittedEvent(logger, {
        householdId: 'hh-1',
        type,
      });
    }

    expect(logger.all().map((event) => event.type)).toEqual(required);
  });
});
