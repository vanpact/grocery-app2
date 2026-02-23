import { type SetupCommandResult } from '../../src/runtime/contracts';

export function formatSetupResult(result: SetupCommandResult): string {
  const stable = {
    status: result.status,
    targetAlias: result.targetAlias,
    mode: result.mode,
    fixtureUpserts: result.fixtureUpserts,
    fixtureDeletes: result.fixtureDeletes,
    accountsValidated: result.accountsValidated,
    accountsCreated: result.accountsCreated,
    warnings: [...result.warnings].sort(),
    errors: [...result.errors].sort(),
  };

  return JSON.stringify(stable, null, 2);
}

export function summarizeSetupResult(result: SetupCommandResult): string {
  return [
    `status=${result.status}`,
    `target=${result.targetAlias}`,
    `mode=${result.mode}`,
    `fixtureUpserts=${result.fixtureUpserts}`,
    `fixtureDeletes=${result.fixtureDeletes}`,
    `accountsValidated=${result.accountsValidated}`,
    `accountsCreated=${result.accountsCreated}`,
  ].join(' ');
}
