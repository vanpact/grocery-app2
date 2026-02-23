import { canTransition } from '../../src/auth/policy';
import { householdMatches } from '../../src/households/householdScope';
import { type LifecycleState, type Role } from '../../src/types';

export function emulatorAllowsTransition(role: Role, from: LifecycleState, to: LifecycleState): boolean {
  return canTransition(role, from, to);
}

export function emulatorAllowsHouseholdAccess(actorHouseholdId: string, targetHouseholdId: string): boolean {
  return householdMatches(actorHouseholdId, targetHouseholdId);
}
