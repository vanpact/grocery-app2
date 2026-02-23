import { type EventLogger } from './eventLogger';

export function emitCommittedEvent(
  logger: EventLogger,
  input: {
    householdId: string;
    type: 'add' | 'merge' | 'validate' | 'toggle' | 'undo' | 'error_retry';
    ref?: Record<string, unknown>;
    payload?: Record<string, unknown>;
  },
): void {
  logger.log({
    householdId: input.householdId,
    type: input.type,
    ref: input.ref ?? null,
    payload: input.payload ?? {},
    at: new Date().toISOString(),
  });
}

export function emitValidateEvent(logger: EventLogger, householdId: string, itemId: string): void {
  emitCommittedEvent(logger, {
    householdId,
    type: 'validate',
    ref: { itemId },
  });
}
