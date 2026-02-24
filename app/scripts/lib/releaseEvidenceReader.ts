import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type EvidenceBundleRecord = {
  gateId: string;
  bundleId: string;
  bundlePath: string;
  missingArtifacts: string[];
  parseErrors: string[];
  manifest?: Record<string, unknown>;
  decision?: Record<string, unknown>;
  approvals?: Record<string, unknown>;
  uiUsabilitySummary?: Record<string, unknown>;
};

type ParsedJsonResult = {
  value?: Record<string, unknown>;
  error?: string;
};

function readJsonFile(filePath: string): ParsedJsonResult {
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        error: `invalid_json_object:${filePath}`,
      };
    }

    return {
      value: parsed as Record<string, unknown>,
    };
  } catch {
    return {
      error: `invalid_json_parse:${filePath}`,
    };
  }
}

export function readEvidenceBundles(input: { releaseEvidenceRootPath: string }): EvidenceBundleRecord[] {
  if (!existsSync(input.releaseEvidenceRootPath)) {
    return [];
  }

  const bundleRecords: EvidenceBundleRecord[] = [];
  const gateEntries = readdirSync(input.releaseEvidenceRootPath, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const gateEntry of gateEntries) {
    const gatePath = join(input.releaseEvidenceRootPath, gateEntry.name);
    const bundleEntries = readdirSync(gatePath, { withFileTypes: true }).filter((entry) => entry.isDirectory());

    for (const bundleEntry of bundleEntries) {
      const bundlePath = join(gatePath, bundleEntry.name);
      const manifestPath = join(bundlePath, 'manifest.json');
      const decisionPath = join(bundlePath, 'decision.json');
      const approvalsPath = join(bundlePath, 'approvals.json');
      const verificationResultsPath = join(bundlePath, 'verification-results.md');
      const rawDataPath = join(bundlePath, 'raw-data');
      const uiUsabilityTaskRunsPath = join(rawDataPath, 'ui-usability-task-runs.json');
      const uiUsabilitySummaryPath = join(rawDataPath, 'ui-usability-summary.json');

      const missingArtifacts: string[] = [];
      const parseErrors: string[] = [];

      if (!existsSync(manifestPath)) {
        missingArtifacts.push('manifest.json');
      }
      if (!existsSync(decisionPath)) {
        missingArtifacts.push('decision.json');
      }
      if (!existsSync(approvalsPath)) {
        missingArtifacts.push('approvals.json');
      }
      if (!existsSync(verificationResultsPath)) {
        missingArtifacts.push('verification-results.md');
      }
      if (!existsSync(rawDataPath) || !statSync(rawDataPath).isDirectory()) {
        missingArtifacts.push('raw-data');
      }
      if (!existsSync(uiUsabilityTaskRunsPath)) {
        missingArtifacts.push('raw-data/ui-usability-task-runs.json');
      }
      if (!existsSync(uiUsabilitySummaryPath)) {
        missingArtifacts.push('raw-data/ui-usability-summary.json');
      }

      let manifest: Record<string, unknown> | undefined;
      let decision: Record<string, unknown> | undefined;
      let approvals: Record<string, unknown> | undefined;
      let uiUsabilitySummary: Record<string, unknown> | undefined;

      if (existsSync(manifestPath)) {
        const parsedManifest = readJsonFile(manifestPath);
        manifest = parsedManifest.value;
        if (parsedManifest.error) {
          parseErrors.push(parsedManifest.error);
        }
      }

      if (existsSync(decisionPath)) {
        const parsedDecision = readJsonFile(decisionPath);
        decision = parsedDecision.value;
        if (parsedDecision.error) {
          parseErrors.push(parsedDecision.error);
        }
      }

      if (existsSync(approvalsPath)) {
        const parsedApprovals = readJsonFile(approvalsPath);
        approvals = parsedApprovals.value;
        if (parsedApprovals.error) {
          parseErrors.push(parsedApprovals.error);
        }
      }

      if (existsSync(uiUsabilitySummaryPath)) {
        const parsedSummary = readJsonFile(uiUsabilitySummaryPath);
        uiUsabilitySummary = parsedSummary.value;
        if (parsedSummary.error) {
          parseErrors.push(parsedSummary.error);
        }
      }

      bundleRecords.push({
        gateId: gateEntry.name,
        bundleId: bundleEntry.name,
        bundlePath,
        missingArtifacts,
        parseErrors,
        manifest,
        decision,
        approvals,
        uiUsabilitySummary,
      });
    }
  }

  return bundleRecords.sort((left, right) => left.bundlePath.localeCompare(right.bundlePath));
}
