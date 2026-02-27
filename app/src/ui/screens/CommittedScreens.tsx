import {
  type CommittedDestination,
  type FeedbackState,
  type RecoveryAction,
  type ScreenUsabilitySnapshot,
} from '../../runtime/contracts';
import { getStateFeedback } from '../components/StateFeedback';
import {
  resolveLayoutMode,
  resolveNavigationPattern,
  resolveSecondaryPaneMode,
  resolveViewportBand,
  type LayoutMode,
  type NavigationPattern,
  type SecondaryPaneMode,
  type ViewportBand,
} from '../layout/layoutModeResolver';

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
  heading: string;
  body: string;
  selectedStateLabel: string;
  navigationEntryPoints: string[];
  primaryActions: string[];
  secondaryActions: string[];
  destructiveActions: string[];
};

const DESTINATION_MODELS: Record<CommittedDestination, CommittedDestinationModel> = {
  'sign-in': {
    destination: 'sign-in',
    title: 'Sign In',
    routeKey: 'SignIn',
    heading: 'Sign in to continue',
    body: 'Use your household account to resume shopping.',
    selectedStateLabel: 'Current screen: Sign In',
    navigationEntryPoints: ['app-start', 'settings-sign-out'],
    primaryActions: ['Sign in'],
    secondaryActions: ['Retry membership lookup'],
    destructiveActions: ['Sign out of household'],
  },
  'active-shopping': {
    destination: 'active-shopping',
    title: 'Active Shopping',
    routeKey: 'ActiveShopping',
    heading: 'Shop and validate quickly',
    body: 'Add items first, then validate each draft item.',
    selectedStateLabel: 'Current screen: Active Shopping',
    navigationEntryPoints: ['bottom-nav-home', 'overview-to-active'],
    primaryActions: ['Add item to list'],
    secondaryActions: ['Validate next item', 'Continue in offline mode', 'Retry sync connection'],
    destructiveActions: [],
  },
  overview: {
    destination: 'overview',
    title: 'Overview',
    routeKey: 'Overview',
    heading: 'Review household progress',
    body: 'Scan validated and draft totals before returning to shopping.',
    selectedStateLabel: 'Current screen: Overview',
    navigationEntryPoints: ['bottom-nav-overview', 'active-to-overview'],
    primaryActions: ['Review current progress'],
    secondaryActions: ['Open active shopping workspace'],
    destructiveActions: [],
  },
  settings: {
    destination: 'settings',
    title: 'Settings',
    routeKey: 'Settings',
    heading: 'Manage account and recovery',
    body: 'Use recovery actions only when session checks fail.',
    selectedStateLabel: 'Current screen: Settings',
    navigationEntryPoints: ['bottom-nav-settings', 'header-settings'],
    primaryActions: ['Manage account settings'],
    secondaryActions: ['Retry startup checks', 'Retry membership lookup'],
    destructiveActions: ['Sign out of household'],
  },
};

function normalizeActionCopy(label: string): string {
  return label.trim().toLowerCase();
}

function evaluateActionCopyUniqueness(actions: string[]): 'pass' | 'fail' {
  const normalized = actions.map(normalizeActionCopy);
  return new Set(normalized).size === normalized.length ? 'pass' : 'fail';
}

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
  return COMMITTED_DESTINATIONS.map((destination) => {
    const model = DESTINATION_MODELS[destination];
    return {
      ...model,
      primaryActions: [...model.primaryActions, ...model.secondaryActions, ...model.destructiveActions],
    };
  });
}

export function getCommittedDestinationModel(destination: CommittedDestination): CommittedDestinationModel {
  return DESTINATION_MODELS[destination];
}

export function buildCommittedScreenModel(input: {
  destination?: CommittedDestination;
  state: FeedbackState;
  viewportWidth: number;
  selectedDestination?: CommittedDestination;
}) {
  const destination = input.destination ?? 'active-shopping';
  const destinationModel = getCommittedDestinationModel(destination);
  const layoutMode: LayoutMode = resolveLayoutMode(input.viewportWidth);
  const viewportBand: ViewportBand = resolveViewportBand(input.viewportWidth);
  const navigationPattern: NavigationPattern = resolveNavigationPattern(input.viewportWidth);
  const secondaryPaneMode: SecondaryPaneMode = resolveSecondaryPaneMode(input.viewportWidth);
  const feedback = getStateFeedback(input.state);
  const selectedDestination = input.selectedDestination ?? destination;
  const allActionCopy = [
    ...destinationModel.primaryActions,
    ...destinationModel.secondaryActions,
    ...destinationModel.destructiveActions,
    ...feedback.recoveryActions.map((action) => action.replace(/_/g, ' ')),
  ];
  const copyUniquenessStatus = evaluateActionCopyUniqueness(allActionCopy);

  const snapshot: ScreenUsabilitySnapshot = {
    destination,
    state: input.state,
    primaryActions: [...destinationModel.primaryActions, ...destinationModel.secondaryActions],
    recoveryActions: [...feedback.recoveryActions],
    hasSilentFailure: feedback.message.trim().length === 0,
    viewportWidth: input.viewportWidth,
    viewportBand,
    layoutMode,
    navigationPattern,
    secondaryPaneMode,
  };

  return {
    destination,
    routeKey: destinationModel.routeKey,
    title: destinationModel.title,
    heading: destinationModel.heading,
    body: destinationModel.body,
    layoutMode,
    viewportBand,
    navigationPattern,
    secondaryPaneMode,
    feedback,
    md3Component: MD3_STATE_MAPPING[input.state],
    md3ScreenFamily: MD3_SCREEN_FAMILY_MAPPING[destination],
    navigationEntryPoints: [...destinationModel.navigationEntryPoints],
    primaryActions: [...destinationModel.primaryActions],
    secondaryActions: [...destinationModel.secondaryActions],
    destructiveActions: [...destinationModel.destructiveActions],
    actionCopyUniqueness: copyUniquenessStatus,
    controlFeedbackStates: ['idle', 'focused', 'pressed', 'disabled'] as const,
    selectedDestination,
    selectedStateVisible: selectedDestination === destination,
    selectedStateLabel: destinationModel.selectedStateLabel,
    navigationDestinations: [...COMMITTED_DESTINATIONS],
    navigationWraps: navigationPattern === 'top-wrapped',
    desktopTwoPaneContextOnly:
      viewportBand !== '>=1200' ? true : layoutMode === 'two-pane' && secondaryPaneMode === 'context-only',
    recoveryActions: [...feedback.recoveryActions] as RecoveryAction[],
    snapshot,
  };
}
