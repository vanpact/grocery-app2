import {
  type CommittedDestination,
  type FeedbackState,
  type RecoveryAction,
  type ScreenUsabilitySnapshot,
} from '../../runtime/contracts';
import { getStateFeedback } from '../components/StateFeedback';
import { resolveLayoutMode, resolveViewportBand, type LayoutMode, type ViewportBand } from '../layout/layoutModeResolver';

export const COMMITTED_LATENCY_BUDGETS = {
  actionP95Ms: 300,
  routeTransitionMs: 500,
} as const;

export const COMMITTED_DESTINATIONS: CommittedDestination[] = [
  'sign-in',
  'active-shopping',
  'overview',
  'settings',
];

export type CommittedDestinationModel = {
  destination: CommittedDestination;
  title: string;
  routeKey: string;
  navigationEntryPoints: string[];
  primaryActions: string[];
};

const DESTINATION_MODELS: Record<CommittedDestination, CommittedDestinationModel> = {
  'sign-in': {
    destination: 'sign-in',
    title: 'Sign In',
    routeKey: 'SignIn',
    navigationEntryPoints: ['app-start', 'settings-sign-out'],
    primaryActions: ['Sign in', 'Retry membership', 'Sign out'],
  },
  'active-shopping': {
    destination: 'active-shopping',
    title: 'Active Shopping',
    routeKey: 'ActiveShopping',
    navigationEntryPoints: ['bottom-nav-home', 'overview-to-active'],
    primaryActions: ['Add item', 'Validate item', 'Continue offline', 'Retry connection'],
  },
  overview: {
    destination: 'overview',
    title: 'Overview',
    routeKey: 'Overview',
    navigationEntryPoints: ['bottom-nav-overview', 'active-to-overview'],
    primaryActions: ['Review progress', 'Open active shopping'],
  },
  settings: {
    destination: 'settings',
    title: 'Settings',
    routeKey: 'Settings',
    navigationEntryPoints: ['bottom-nav-settings', 'header-settings'],
    primaryActions: ['Manage account', 'Sign out'],
  },
};

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

const MD3_STATE_MAPPING = {
  empty: 'List.EmptyState',
  loading: 'ActivityIndicator',
  error: 'Banner',
  offline: 'Banner',
  'membership-required': 'Banner',
  reconnecting: 'Banner',
  itemRow: 'List.Item',
} as const;

const MD3_SCREEN_FAMILY_MAPPING: Record<
  CommittedDestination,
  {
    container: 'Screen' | 'Card';
    listComponent: 'List.Item' | 'List.Section' | 'List.Accordion';
    primaryActionComponent: 'Button' | 'FAB';
  }
> = {
  'sign-in': {
    container: 'Screen',
    listComponent: 'List.Section',
    primaryActionComponent: 'Button',
  },
  'active-shopping': {
    container: 'Card',
    listComponent: 'List.Item',
    primaryActionComponent: 'FAB',
  },
  overview: {
    container: 'Card',
    listComponent: 'List.Section',
    primaryActionComponent: 'Button',
  },
  settings: {
    container: 'Screen',
    listComponent: 'List.Accordion',
    primaryActionComponent: 'Button',
  },
};

export function getMd3ComponentMapping() {
  return { ...MD3_STATE_MAPPING };
}

export function getCommittedScreenFamilyMapping() {
  return { ...MD3_SCREEN_FAMILY_MAPPING };
}

export function getCommittedDestinationModels(): CommittedDestinationModel[] {
  return COMMITTED_DESTINATIONS.map((destination) => DESTINATION_MODELS[destination]);
}

export function getCommittedDestinationModel(destination: CommittedDestination): CommittedDestinationModel {
  return DESTINATION_MODELS[destination];
}

export function buildCommittedScreenModel(input: {
  destination?: CommittedDestination;
  state: FeedbackState;
  viewportWidth: number;
}) {
  const destination = input.destination ?? 'active-shopping';
  const destinationModel = getCommittedDestinationModel(destination);
  const layoutMode: LayoutMode = resolveLayoutMode(input.viewportWidth);
  const viewportBand: ViewportBand = resolveViewportBand(input.viewportWidth);
  const feedback = getStateFeedback(input.state);

  const snapshot: ScreenUsabilitySnapshot = {
    destination,
    state: input.state,
    primaryActions: [...destinationModel.primaryActions],
    recoveryActions: [...feedback.recoveryActions],
    hasSilentFailure: feedback.message.trim().length === 0,
    viewportWidth: input.viewportWidth,
    layoutMode,
  };

  return {
    destination,
    routeKey: destinationModel.routeKey,
    title: destinationModel.title,
    layoutMode,
    viewportBand,
    feedback,
    md3Component: MD3_STATE_MAPPING[input.state],
    md3ScreenFamily: MD3_SCREEN_FAMILY_MAPPING[destination],
    navigationEntryPoints: [...destinationModel.navigationEntryPoints],
    primaryActions: [...destinationModel.primaryActions],
    recoveryActions: [...feedback.recoveryActions] as RecoveryAction[],
    snapshot,
  };
}
