import { type EvidenceBundleRecord } from './releaseEvidenceReader';

type ApprovalValidationInput = {
  bundles: EvidenceBundleRecord[];
  gateOwnersByGateId: Record<string, string[]>;
  now?: () => Date;
};

export type ApprovalValidationResult = {
  approvalIssues: string[];
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string').sort();
}

function sameSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((entry, index) => entry === right[index]);
}

export function validateApprovals(input: ApprovalValidationInput): ApprovalValidationResult {
  const now = input.now ?? (() => new Date());
  const approvalIssues: string[] = [];

  for (const bundle of input.bundles) {
    const approvals = bundle.approvals ?? {};
    const requiredOwners = asStringArray(approvals.required_owners);
    const approvedOwners = asStringArray(approvals.approvals);

    if (requiredOwners.length === 0) {
      approvalIssues.push(`missing_required_owners:${bundle.gateId}/${bundle.bundleId}`);
      continue;
    }

    const canonicalOwners = input.gateOwnersByGateId[bundle.gateId];
    if (!canonicalOwners) {
      approvalIssues.push(`unresolved_gate_owner_source:${bundle.gateId}`);
    } else if (!sameSet(requiredOwners, [...canonicalOwners].sort())) {
      approvalIssues.push(`owner_boundary_mismatch:${bundle.gateId}`);
    }

    const missingOwners = requiredOwners.filter((owner) => !approvedOwners.includes(owner));
    if (missingOwners.length > 0) {
      approvalIssues.push(`missing_owners:${bundle.gateId}:${missingOwners.sort().join(',')}`);
    }

    const approvedAt = approvals.approved_at_utc;
    if (typeof approvedAt !== 'string') {
      approvalIssues.push(`missing_approval_timestamp:${bundle.gateId}`);
      continue;
    }

    const approvedAtMs = Date.parse(approvedAt);
    if (Number.isNaN(approvedAtMs)) {
      approvalIssues.push(`invalid_approval_timestamp:${bundle.gateId}`);
      continue;
    }

    const freshnessHours = (now().getTime() - approvedAtMs) / (60 * 60 * 1000);
    if (freshnessHours > 24) {
      approvalIssues.push(`stale_approval:${bundle.gateId}:${freshnessHours.toFixed(2)}h`);
    }
  }

  return {
    approvalIssues: uniqSorted(approvalIssues),
  };
}
