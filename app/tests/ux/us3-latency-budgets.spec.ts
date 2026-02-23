import { describe, expect, it } from 'vitest';

import {
  COMMITTED_LATENCY_BUDGETS,
  evaluateLatencyBudget,
} from '../../src/ui/screens/CommittedScreens';

describe('VR-COM-019 latency and responsiveness thresholds', () => {
  it('passes when action and route timings are within limits', () => {
    const result = evaluateLatencyBudget({
      actionP95Ms: 250,
      routeTransitionMs: 450,
    });

    expect(result.withinBudget).toBe(true);
    expect(COMMITTED_LATENCY_BUDGETS.actionP95Ms).toBe(300);
    expect(COMMITTED_LATENCY_BUDGETS.routeTransitionMs).toBe(500);
  });

  it('fails when any threshold is exceeded', () => {
    const result = evaluateLatencyBudget({
      actionP95Ms: 320,
      routeTransitionMs: 450,
    });

    expect(result.withinBudget).toBe(false);
    expect(result.actionWithinBudget).toBe(false);
    expect(result.routeWithinBudget).toBe(true);
  });
});
