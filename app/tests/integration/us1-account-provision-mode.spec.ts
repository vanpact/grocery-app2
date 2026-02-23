import { describe, expect, it } from 'vitest';
import { runDbSetup } from '../../scripts/db-setup';

describe('US1 account provisioning mode', () => {
  it('creates missing accounts only when explicit provision mode is enabled', async () => {
    const validateOnly = await runDbSetup();
    const provision = await runDbSetup({
      state: validateOnly.state,
      provisionAccounts: true,
    });

    expect(validateOnly.result.accountsCreated).toBe(0);
    expect(validateOnly.result.warnings.some((warning) => warning.startsWith('accounts_missing:'))).toBe(true);

    expect(provision.result.accountsCreated).toBeGreaterThan(0);
    expect(provision.result.warnings.some((warning) => warning.startsWith('accounts_missing:'))).toBe(false);
  });
});
