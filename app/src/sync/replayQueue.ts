import { type Mutation } from '../types';

export type ReplayQueue = {
  enqueue: (mutation: Mutation) => void;
  getPending: () => Mutation[];
  drain: () => Mutation[];
};

export function createReplayQueue(): ReplayQueue {
  const pending: Mutation[] = [];

  return {
    enqueue(mutation) {
      pending.push(mutation);
    },
    getPending() {
      return [...pending];
    },
    drain() {
      const drained = [...pending];
      pending.length = 0;
      return drained;
    },
  };
}
