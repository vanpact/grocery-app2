import { describe, expect, it } from 'vitest';
import { runDbSetup, type RuntimeSetupState } from '../../scripts/db-setup';

describe('US1 setup non-target record preservation', () => {
  it('preserves non-target records during default non-destructive setup', async () => {
    const state: RuntimeSetupState = {
      fixturesByTarget: {},
      nonTargetRecordsByTarget: {
        default: ['custom/non-target-1', 'custom/non-target-2'],
      },
      accountDirectoryByTarget: {},
    };

    const before = [...state.nonTargetRecordsByTarget.default];
    const run = await runDbSetup({ state });

    expect(run.result.status).toBe('success');
    expect(run.state.nonTargetRecordsByTarget.default).toEqual(before);
  });
});
