import { type CommittedDestinationModel } from './CommittedScreens';

export type SettingsScreenModel = {
  destination: 'settings';
  title: string;
  primaryActions: string[];
};

export function buildSettingsScreenModel(destination: CommittedDestinationModel): SettingsScreenModel {
  return {
    destination: 'settings',
    title: destination.title,
    primaryActions: [...destination.primaryActions],
  };
}
