import { authorizeTransition } from '../auth/transitionAuthorizer';
import { householdMatches } from '../households/householdScope';
import { type LifecycleState, type Role } from '../types';

export function allowMutation(input: {
  role: Role;
  actorHouseholdId: string;
  targetHouseholdId: string;
  from: LifecycleState;
  to: LifecycleState;
}): boolean {
  const householdAllowed = householdMatches(input.actorHouseholdId, input.targetHouseholdId);
  if (!householdAllowed) {
    return false;
  }

  return authorizeTransition(input.role, input.from, input.to);
}

export function assertMutationAllowed(input: {
  role: Role;
  actorHouseholdId: string;
  targetHouseholdId: string;
  from: LifecycleState;
  to: LifecycleState;
}): void {
  if (!allowMutation(input)) {
    throw new Error('Mutation denied by default policy.');
  }
}
