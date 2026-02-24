import { type Role } from '../types';

export type Session = {
  userId: string;
  householdId: string;
  role: Role;
};

export type MembershipRecoveryAction = 'retry_membership' | 'sign_out';

export class MembershipRequiredError extends Error {
  readonly code = 'membership_required';
  readonly recoveryActions: MembershipRecoveryAction[] = ['retry_membership', 'sign_out'];

  constructor() {
    super('No household membership found.');
    this.name = 'MembershipRequiredError';
  }
}

export function isMembershipRequiredError(value: unknown): value is MembershipRequiredError {
  return value instanceof MembershipRequiredError;
}

export async function bootstrapSession(input: {
  userId: string;
  resolveMembership: (userId: string) => Promise<{ householdId: string; role: Role } | null>;
}): Promise<Session> {
  const membership = await input.resolveMembership(input.userId);

  if (!membership) {
    throw new MembershipRequiredError();
  }

  return {
    userId: input.userId,
    householdId: membership.householdId,
    role: membership.role,
  };
}
