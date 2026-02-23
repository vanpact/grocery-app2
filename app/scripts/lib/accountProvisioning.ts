import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type AccountPreparationResult, type VerificationAccountRequirement } from '../../src/runtime/contracts';

export type VerificationAccountsDocument = {
  accounts: VerificationAccountRequirement[];
};

export type AccountDirectoryEntry = {
  email: string;
  role: VerificationAccountRequirement['requiredRole'];
  householdId: string;
};

export type AccountDirectory = Record<string, AccountDirectoryEntry>;

export type PrepareVerificationAccountsInput = {
  requirements: VerificationAccountRequirement[];
  directory: AccountDirectory;
  provisionAccounts: boolean;
  createMissing?: (requirement: VerificationAccountRequirement) => Promise<AccountDirectoryEntry | null>;
};

export function loadVerificationAccounts(configPath: string): VerificationAccountRequirement[] {
  const absolutePath = resolve(configPath);
  const parsed = JSON.parse(readFileSync(absolutePath, 'utf8')) as VerificationAccountsDocument;
  if (!Array.isArray(parsed.accounts)) {
    throw new Error('Verification account config is missing an accounts array.');
  }

  return parsed.accounts;
}

function satisfiesRequirement(
  entry: AccountDirectoryEntry | undefined,
  requirement: VerificationAccountRequirement,
): boolean {
  if (!entry) {
    return false;
  }

  return (
    entry.email === requirement.email &&
    entry.role === requirement.requiredRole &&
    entry.householdId === requirement.requiredHouseholdId
  );
}

export async function prepareVerificationAccounts(
  input: PrepareVerificationAccountsInput,
): Promise<AccountPreparationResult> {
  const validated: string[] = [];
  const missing: string[] = [];
  const created: string[] = [];

  for (const requirement of input.requirements) {
    const existing = Object.values(input.directory).find((entry) => entry.email === requirement.email);

    if (satisfiesRequirement(existing, requirement)) {
      validated.push(requirement.key);
      continue;
    }

    if (!input.provisionAccounts) {
      missing.push(requirement.key);
      continue;
    }

    const createdEntry = input.createMissing ? await input.createMissing(requirement) : null;
    if (!createdEntry) {
      missing.push(requirement.key);
      continue;
    }

    input.directory[requirement.key] = createdEntry;
    created.push(requirement.key);
    validated.push(requirement.key);
  }

  return {
    validated: validated.sort(),
    missing: missing.sort(),
    created: created.sort(),
    mode: input.provisionAccounts ? 'provision' : 'validate_only',
  };
}
