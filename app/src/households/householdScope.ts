export function householdMatches(actorHouseholdId: string, targetHouseholdId: string): boolean {
  return actorHouseholdId === targetHouseholdId;
}

export function assertHouseholdScope(actorHouseholdId: string, targetHouseholdId: string): void {
  if (!householdMatches(actorHouseholdId, targetHouseholdId)) {
    throw new Error('Cross-household access denied.');
  }
}
