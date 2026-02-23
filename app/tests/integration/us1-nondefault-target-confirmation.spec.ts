import { describe, expect, it } from 'vitest';
import { confirmationTokens, runDbSetup } from '../../scripts/db-setup';

describe('US1 non-default target confirmation', () => {
  it('requires explicit non-default confirmation token', async () => {
    await expect(
      runDbSetup({
        targetAlias: 'staging-alt',
      }),
    ).rejects.toThrow('confirm-non-default-target');

    const success = await runDbSetup({
      targetAlias: 'staging-alt',
      confirmNonDefaultTarget: confirmationTokens.nonDefaultTarget('staging-alt'),
    });

    expect(success.result.status).toBe('success');
    expect(success.result.targetAlias).toBe('staging-alt');
  });
});
