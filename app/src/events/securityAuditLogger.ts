import { type EventLogger } from './eventLogger';

export function logDeniedAttempt(
  logger: EventLogger,
  input: {
    householdId: string;
    reason: string;
    ref?: Record<string, unknown>;
  },
): void {
  logger.log({
    householdId: input.householdId,
    type: 'denied',
    ref: input.ref ?? null,
    payload: { reason: input.reason },
    at: new Date().toISOString(),
  });
}
