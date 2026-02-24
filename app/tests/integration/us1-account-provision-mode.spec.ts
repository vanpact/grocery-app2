import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runDbSetup } from '../../scripts/db-setup';

describe('US1 account provisioning mode', () => {
  it('creates missing accounts only when explicit provision mode is enabled', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'grocery-us1-account-provision-'));
    const runSuffix = `${Date.now()}`;
    const accountsConfigPath = join(tempDir, 'verification-accounts.json');
    writeFileSync(
      accountsConfigPath,
      `${JSON.stringify(
        {
          accounts: [
            {
              key: `owner_${runSuffix}`,
              email: `owner.${runSuffix}@example.com`,
              requiredRole: 'validate',
              requiredHouseholdId: 'household_alpha',
              mustExist: true,
            },
            {
              key: `member_${runSuffix}`,
              email: `member.${runSuffix}@example.com`,
              requiredRole: 'suggest',
              requiredHouseholdId: 'household_alpha',
              mustExist: true,
            },
          ],
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const validateOnly = await runDbSetup({
      accountsConfigPath,
    });
    const provision = await runDbSetup({
      state: validateOnly.state,
      accountsConfigPath,
      provisionAccounts: true,
    });

    expect(validateOnly.result.accountsCreated).toBe(0);
    expect(validateOnly.result.warnings.some((warning) => warning.startsWith('accounts_missing:'))).toBe(true);

    expect(provision.result.accountsCreated).toBeGreaterThan(0);
    expect(provision.result.warnings.some((warning) => warning.startsWith('accounts_missing:'))).toBe(false);
  });
});
