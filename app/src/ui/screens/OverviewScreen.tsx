import { type CommittedDestinationModel } from './CommittedScreens';

export type OverviewScreenModel = {
  destination: 'overview';
  title: string;
  primaryActions: string[];
};

export function buildOverviewScreenModel(destination: CommittedDestinationModel): OverviewScreenModel {
  return {
    destination: 'overview',
    title: destination.title,
    primaryActions: [...destination.primaryActions],
  };
}
