export type FeedbackState = 'empty' | 'loading' | 'error' | 'offline';

export type Feedback = {
  state: FeedbackState;
  message: string;
  accessibility: {
    ariaLabel: string;
    focusIndicatorRequired: boolean;
  };
};

const MESSAGES: Record<FeedbackState, string> = {
  empty: 'No items yet. Add your first grocery item to begin.',
  loading: 'Loading shopping data...',
  error: 'Something went wrong. Retry to continue.',
  offline: 'Offline mode enabled. Changes will replay when online.',
};

export function getStateFeedback(state: FeedbackState): Feedback {
  const readableState = state.charAt(0).toUpperCase() + state.slice(1);

  return {
    state,
    message: MESSAGES[state],
    accessibility: {
      ariaLabel: `${readableState} state message`,
      focusIndicatorRequired: true,
    },
  };
}
