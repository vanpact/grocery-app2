import { type EventRecord } from '../types';

export type EventLogger = {
  log: (event: EventRecord) => void;
  all: () => EventRecord[];
};

export function createEventLogger(): EventLogger {
  const events: EventRecord[] = [];

  return {
    log(event) {
      events.push(event);
    },
    all() {
      return [...events];
    },
  };
}
