import { type CommittedDestinationModel } from './CommittedScreens';

export type OverviewScreenModel = {
  destination: 'overview';
  title: string;
  heading: string;
  body: string;
  primaryAction: string;
  secondaryActions: string[];
  statusCards: Array<'validated-count' | 'draft-count' | 'sync-status'>;
  accessibility: {
    focusOrder: string[];
    statusRole: 'status';
  };
};

export function buildOverviewScreenModel(destination: CommittedDestinationModel): OverviewScreenModel {
  return {
    destination: 'overview',
    title: destination.title,
    heading: destination.heading,
    body: destination.body,
    primaryAction: destination.primaryActions[0] ?? 'Review current progress',
    secondaryActions: [...destination.secondaryActions],
    statusCards: ['validated-count', 'draft-count', 'sync-status'],
    accessibility: {
      focusOrder: ['heading', 'summary', 'primary-action', 'secondary-actions'],
      statusRole: 'status',
    },
  };
}
