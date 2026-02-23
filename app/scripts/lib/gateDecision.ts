import { getOptionalModuleActivation, type OptionalModuleActivation } from '../../src/features/optionalModuleGuards';
import { type VerificationRuleResult } from '../../src/runtime/contracts';

export type OptionalModuleGateCheck = {
  moduleId: string;
};

export type GateDecisionInput = {
  gateId: string;
  requiredOwners: string[];
  approvals: string[];
  verificationResults: VerificationRuleResult[];
  optionalModules?: OptionalModuleGateCheck[];
};

export type GateDecisionOutcome = {
  gateId: string;
  decision: 'retain' | 'cut';
  rationale: string;
  missingApprovals: string[];
  failingVerificationIds: string[];
  optionalModuleOutcomes: Array<{
    moduleId: string;
    activation: OptionalModuleActivation;
  }>;
};

export function evaluateGateDecision(input: GateDecisionInput): GateDecisionOutcome {
  const approvals = new Set(input.approvals);
  const missingApprovals = input.requiredOwners.filter((owner) => !approvals.has(owner)).sort();
  const failingVerificationIds = input.verificationResults
    .filter((result) => result.status !== 'pass')
    .map((result) => result.verificationId)
    .sort();

  const optionalModuleOutcomes = (input.optionalModules ?? []).map((entry) => ({
    moduleId: entry.moduleId,
    activation: getOptionalModuleActivation(entry.moduleId),
  }));
  const optionalFailures = optionalModuleOutcomes.filter((entry) => !entry.activation.enabled);

  const decision =
    missingApprovals.length === 0 && failingVerificationIds.length === 0 && optionalFailures.length === 0
      ? 'retain'
      : 'cut';

  const rationaleParts: string[] = [];
  if (failingVerificationIds.length > 0) {
    rationaleParts.push(`verification_failures=${failingVerificationIds.join(',')}`);
  }
  if (missingApprovals.length > 0) {
    rationaleParts.push(`missing_approvals=${missingApprovals.join(',')}`);
  }
  if (optionalFailures.length > 0) {
    const details = optionalFailures
      .map((entry) => `${entry.moduleId}:${entry.activation.reason}`)
      .sort()
      .join(',');
    rationaleParts.push(`optional_module_fail_closed=${details}`);
  }

  return {
    gateId: input.gateId,
    decision,
    rationale: rationaleParts.length > 0 ? rationaleParts.join('; ') : 'all_requirements_satisfied',
    missingApprovals,
    failingVerificationIds,
    optionalModuleOutcomes,
  };
}
