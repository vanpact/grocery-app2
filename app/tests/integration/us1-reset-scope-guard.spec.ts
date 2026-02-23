import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { confirmationTokens, runDbSetup } from '../../scripts/db-setup';

describe('US1 reset scope guard', () => {
  it('fails reset when deletion plan includes non-baseline-owned records', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'grocery-reset-scope-'));
    const manifestPath = join(tempDir, 'fixtures.manifest.json');

    writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          baselineOwned: {
            collections: ['households'],
            listItemSubcollections: ['items'],
          },
          fixtures: {
            households: [{ id: 'hh-default', name: 'Default Household' }],
            lists: [{ id: 'list-default', householdId: 'hh-default', name: 'Should fail' }],
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    await expect(
      runDbSetup({
        mode: 'reset',
        confirmReset: confirmationTokens.reset('default'),
        fixturesConfigPath: manifestPath,
      }),
    ).rejects.toThrow('non-baseline records');
  });
});
