import { type EvidenceBundleRecord } from './releaseEvidenceReader';

type EvidenceValidationInput = {
  releaseId: string;
  bundles: EvidenceBundleRecord[];
};

export type EvidenceValidationResult = {
  missingArtifacts: string[];
  validBundles: EvidenceBundleRecord[];
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function validateEvidenceBundles(input: EvidenceValidationInput): EvidenceValidationResult {
  const missingArtifacts: string[] = [];
  const validBundles: EvidenceBundleRecord[] = [];

  for (const bundle of input.bundles) {
    for (const missing of bundle.missingArtifacts) {
      missingArtifacts.push(`missing:${bundle.gateId}/${bundle.bundleId}/${missing}`);
    }
    for (const parseError of bundle.parseErrors) {
      missingArtifacts.push(`invalid_json:${bundle.gateId}/${bundle.bundleId}:${parseError}`);
    }

    if (!bundle.manifest || !bundle.decision || !bundle.approvals) {
      continue;
    }

    const manifestReleaseId = asString(bundle.manifest.release_id);
    if (manifestReleaseId !== input.releaseId) {
      missingArtifacts.push(`release_mismatch:${bundle.gateId}/${bundle.bundleId}/manifest.json`);
      continue;
    }

    const manifestGateId = asString(bundle.manifest.gate_id);
    if (manifestGateId !== bundle.gateId) {
      missingArtifacts.push(`gate_mismatch:${bundle.gateId}/${bundle.bundleId}/manifest.json`);
      continue;
    }

    const manifestBundleId = asString(bundle.manifest.bundle_id);
    if (manifestBundleId !== bundle.bundleId) {
      missingArtifacts.push(`bundle_mismatch:${bundle.gateId}/${bundle.bundleId}/manifest.json`);
      continue;
    }

    const decisionGateId = asString(bundle.decision.gate_id);
    if (decisionGateId !== bundle.gateId) {
      missingArtifacts.push(`gate_mismatch:${bundle.gateId}/${bundle.bundleId}/decision.json`);
      continue;
    }

    const decisionBundleId = asString(bundle.decision.bundle_id);
    if (decisionBundleId !== bundle.bundleId) {
      missingArtifacts.push(`bundle_mismatch:${bundle.gateId}/${bundle.bundleId}/decision.json`);
      continue;
    }

    const decisionValue = asString(bundle.decision.decision);
    if (!decisionValue) {
      missingArtifacts.push(`invalid_payload:${bundle.gateId}/${bundle.bundleId}/decision.json:decision`);
      continue;
    }

    const decisionRationale = asString(bundle.decision.rationale);
    if (!decisionRationale) {
      missingArtifacts.push(`invalid_payload:${bundle.gateId}/${bundle.bundleId}/decision.json:rationale`);
      continue;
    }

    const decisionTimestamp = asString(bundle.decision.decided_at_utc);
    if (!decisionTimestamp) {
      missingArtifacts.push(`invalid_payload:${bundle.gateId}/${bundle.bundleId}/decision.json:decided_at_utc`);
      continue;
    }

    const approvalsGateId = asString(bundle.approvals.gate_id);
    if (approvalsGateId !== bundle.gateId) {
      missingArtifacts.push(`gate_mismatch:${bundle.gateId}/${bundle.bundleId}/approvals.json`);
      continue;
    }

    const approvalsBundleId = asString(bundle.approvals.bundle_id);
    if (approvalsBundleId !== bundle.bundleId) {
      missingArtifacts.push(`bundle_mismatch:${bundle.gateId}/${bundle.bundleId}/approvals.json`);
      continue;
    }

    validBundles.push(bundle);
  }

  return {
    missingArtifacts: uniqSorted(missingArtifacts),
    validBundles,
  };
}
