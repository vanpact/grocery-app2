import { assertHouseholdScope, householdMatches } from './householdScope';

export type HouseholdSurface = 'document' | 'aggregate' | 'stream';

export function canAccessHouseholdSurface(
  actorHouseholdId: string,
  targetHouseholdId: string,
  surface: HouseholdSurface,
): boolean {
  if (surface !== 'document' && surface !== 'aggregate' && surface !== 'stream') {
    return false;
  }

  return householdMatches(actorHouseholdId, targetHouseholdId);
}

export function assertHouseholdSurfaceAccess(
  actorHouseholdId: string,
  targetHouseholdId: string,
  surface: HouseholdSurface,
): void {
  if (!canAccessHouseholdSurface(actorHouseholdId, targetHouseholdId, surface)) {
    throw new Error(`Cross-household ${surface} access denied.`);
  }
}

export function assertHouseholdRepositoryAccess(actorHouseholdId: string, targetHouseholdId: string): void {
  assertHouseholdSurfaceAccess(actorHouseholdId, targetHouseholdId, 'document');
}

export function assertHouseholdScopeAccess(actorHouseholdId: string, targetHouseholdId: string): void {
  assertHouseholdScope(actorHouseholdId, targetHouseholdId);
}
