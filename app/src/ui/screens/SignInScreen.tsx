import { type CommittedDestinationModel } from './CommittedScreens';

export type SignInScreenModel = {
  destination: 'sign-in';
  title: string;
  primaryActions: string[];
};

export function buildSignInScreenModel(destination: CommittedDestinationModel): SignInScreenModel {
  return {
    destination: 'sign-in',
    title: destination.title,
    primaryActions: [...destination.primaryActions],
  };
}
