import { getStateFeedback, type FeedbackState } from '../components/StateFeedback';
import { resolveLayoutMode, type LayoutMode } from '../layout/layoutModeResolver';

export const COMMITTED_LATENCY_BUDGETS = {
  actionP95Ms: 300,
  routeTransitionMs: 500,
} as const;

export function evaluateLatencyBudget(input: { actionP95Ms: number; routeTransitionMs: number }) {
  const actionWithinBudget = input.actionP95Ms <= COMMITTED_LATENCY_BUDGETS.actionP95Ms;
  const routeWithinBudget = input.routeTransitionMs <= COMMITTED_LATENCY_BUDGETS.routeTransitionMs;

  return {
    withinBudget: actionWithinBudget && routeWithinBudget,
    actionWithinBudget,
    routeWithinBudget,
    thresholds: { ...COMMITTED_LATENCY_BUDGETS },
  };
}

const MD3_MAPPING = {
  empty: 'List.EmptyState',
  loading: 'ActivityIndicator',
  error: 'Banner',
  offline: 'Banner',
  itemRow: 'List.Item',
} as const;

export function getMd3ComponentMapping() {
  return { ...MD3_MAPPING };
}

export function buildCommittedScreenModel(input: {
  state: FeedbackState;
  viewportWidth: number;
}) {
  const layoutMode: LayoutMode = resolveLayoutMode(input.viewportWidth);
  const feedback = getStateFeedback(input.state);

  return {
    layoutMode,
    feedback,
    md3Component: MD3_MAPPING[input.state],
  };
}
