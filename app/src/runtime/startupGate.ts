import { type QuickHealthCheckResult } from './contracts';

export type StartupGateStatus = 'pass' | 'fail';

export type StartupGateResult = {
  status: StartupGateStatus;
  targetAlias: string;
  quickCheck: QuickHealthCheckResult;
  blockedReasons: string[];
  quickCheckBudgetMs: number;
};

export type StartupGateInput = {
  targetAlias: string;
  runQuickCheck: () => Promise<QuickHealthCheckResult>;
  quickCheckBudgetMs?: number;
};

const DEFAULT_QUICK_CHECK_BUDGET_MS = 120_000;

export async function runStartupGate(input: StartupGateInput): Promise<StartupGateResult> {
  const quickCheck = await input.runQuickCheck();
  const quickCheckBudgetMs = input.quickCheckBudgetMs ?? DEFAULT_QUICK_CHECK_BUDGET_MS;
  const blockedReasons: string[] = [];

  if (quickCheck.status !== 'pass') {
    blockedReasons.push(...quickCheck.failures);
  }

  if (quickCheck.durationMs > quickCheckBudgetMs) {
    blockedReasons.push('quick_check_budget_exceeded');
  }

  return {
    status: blockedReasons.length === 0 ? 'pass' : 'fail',
    targetAlias: input.targetAlias,
    quickCheck,
    blockedReasons,
    quickCheckBudgetMs,
  };
}
