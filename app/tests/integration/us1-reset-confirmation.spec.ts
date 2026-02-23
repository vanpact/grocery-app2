import { describe, expect, it } from 'vitest';
import { confirmationTokens, runDbSetup } from '../../scripts/db-setup';

describe('US1 reset confirmation token', () => {
  it('requires explicit reset confirmation token for reset mode', async () => {
    await expect(
      runDbSetup({
        mode: 'reset',
      }),
    ).rejects.toThrow('confirm-reset');

    const success = await runDbSetup({
      mode: 'reset',
      confirmReset: confirmationTokens.reset('default'),
    });

    expect(success.result.status).toBe('success');
    expect(success.result.mode).toBe('reset');
  });
});
