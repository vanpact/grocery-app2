import { type CommittedDestinationModel } from './CommittedScreens';

export type SettingsScreenModel = {
  destination: 'settings';
  title: string;
  heading: string;
  body: string;
  primaryAction: string;
  recoveryActions: string[];
  destructiveActions: string[];
  statusMessageDeduplicated: boolean;
  accessibility: {
    focusOrder: string[];
    statusRole: 'status';
  };
};

export function buildSettingsScreenModel(destination: CommittedDestinationModel): SettingsScreenModel {
  return {
    destination: 'settings',
    title: destination.title,
    heading: destination.heading,
    body: destination.body,
    primaryAction: destination.primaryActions[0] ?? 'Manage account settings',
    recoveryActions: [...destination.secondaryActions],
    destructiveActions: [...destination.destructiveActions],
    statusMessageDeduplicated: true,
    accessibility: {
      focusOrder: ['heading', 'body', 'primary-action', 'recovery-actions', 'destructive-actions'],
      statusRole: 'status',
    },
  };
}
