import { type CommittedDestinationModel } from './CommittedScreens';

export type SignInScreenModel = {
  destination: 'sign-in';
  title: string;
  heading: string;
  body: string;
  primaryAction: string;
  secondaryActions: string[];
  destructiveActions: string[];
  recoveryGroupLabel: string;
  accessibility: {
    focusOrder: string[];
    statusRole: 'status';
  };
};

export function buildSignInScreenModel(destination: CommittedDestinationModel): SignInScreenModel {
  return {
    destination: 'sign-in',
    title: destination.title,
    heading: destination.heading,
    body: destination.body,
    primaryAction: destination.primaryActions[0] ?? 'Sign in',
    secondaryActions: [...destination.secondaryActions],
    destructiveActions: [...destination.destructiveActions],
    recoveryGroupLabel: 'Account recovery actions',
    accessibility: {
      focusOrder: ['heading', 'body', 'primary-action', 'secondary-actions', 'destructive-actions'],
      statusRole: 'status',
    },
  };
}
