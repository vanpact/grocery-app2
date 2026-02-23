import { canTransition } from './policy';
import { type LifecycleState, type Role } from '../types';

export type TransitionDecision = 'allowed' | 'transition_not_allowed' | 'household_mismatch' | 'noop';

export type TransitionOutcome = {
  decision: TransitionDecision;
  mutatesState: boolean;
};

export type ActorType = 'member' | 'service' | 'system';

export function authorizeActorScope(input: { actorType: ActorType; hasMembership: boolean }): boolean {
  return input.actorType === 'member' && input.hasMembership;
}

export function getTransitionOutcome(input: {
  role: Role;
  from: LifecycleState;
  to: LifecycleState;
  actorHouseholdId?: string;
  targetHouseholdId?: string;
}): TransitionOutcome {
  if (
    input.actorHouseholdId !== undefined &&
    input.targetHouseholdId !== undefined &&
    input.actorHouseholdId !== input.targetHouseholdId
  ) {
    return { decision: 'household_mismatch', mutatesState: false };
  }

  if (input.from === input.to) {
    return { decision: 'noop', mutatesState: false };
  }

  if (canTransition(input.role, input.from, input.to)) {
    return { decision: 'allowed', mutatesState: true };
  }

  return { decision: 'transition_not_allowed', mutatesState: false };
}

export function authorizeTransition(role: Role, from: LifecycleState, to: LifecycleState): boolean {
  return getTransitionOutcome({ role, from, to }).decision === 'allowed';
}

export function assertAuthorizedTransition(role: Role, from: LifecycleState, to: LifecycleState): void {
  const outcome = getTransitionOutcome({ role, from, to });
  if (outcome.decision !== 'allowed') {
    throw new Error(`Transition denied by role policy (${outcome.decision}).`);
  }
}
