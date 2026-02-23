export function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

export function buildDedupKey(name: string, aisleKey: string | null): string {
  const normalizedAisle = (aisleKey ?? '').trim().toLowerCase();
  return `${normalizeName(name)}#${normalizedAisle}`;
}
