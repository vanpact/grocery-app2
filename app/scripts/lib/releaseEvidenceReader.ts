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
      const uiRefreshTaskRunsPath = join(rawDataPath, 'ui-refresh-task-runs.json');
      const uiRefreshSummaryPath = join(rawDataPath, 'ui-refresh-usability-summary.json');
      const uiRefreshPlaywrightArtifactsPath = join(rawDataPath, 'ui-refresh-playwright-artifacts.json');
      const uiRefreshMobileArtifactsPath = join(rawDataPath, 'ui-refresh-mobile-mcp-artifacts.json');
      const uiRefreshBeforeAfterPath = join(rawDataPath, 'ui-refresh-before-after-index.json');
      const uiRefreshAccessibilityPath = join(rawDataPath, 'ui-refresh-accessibility-summary.json');
      const uiRefreshTimingPath = join(rawDataPath, 'ui-refresh-timing-summary.json');
      const uiRefreshClarityPath = join(rawDataPath, 'ui-refresh-clarity-summary.json');
      const uiRefreshMistapPath = join(rawDataPath, 'ui-refresh-mistap-summary.json');

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
      if (!existsSync(uiRefreshTaskRunsPath)) {
        missingArtifacts.push('raw-data/ui-refresh-task-runs.json');
      }
      if (!existsSync(uiRefreshSummaryPath)) {
        missingArtifacts.push('raw-data/ui-refresh-usability-summary.json');
      }
      if (!existsSync(uiRefreshPlaywrightArtifactsPath)) {
        missingArtifacts.push('raw-data/ui-refresh-playwright-artifacts.json');
      }
      if (!existsSync(uiRefreshMobileArtifactsPath)) {
        missingArtifacts.push('raw-data/ui-refresh-mobile-mcp-artifacts.json');
      }
      if (!existsSync(uiRefreshBeforeAfterPath)) {
        missingArtifacts.push('raw-data/ui-refresh-before-after-index.json');
      }
      if (!existsSync(uiRefreshAccessibilityPath)) {
        missingArtifacts.push('raw-data/ui-refresh-accessibility-summary.json');
      }
      if (!existsSync(uiRefreshTimingPath)) {
        missingArtifacts.push('raw-data/ui-refresh-timing-summary.json');
      }
      if (!existsSync(uiRefreshClarityPath)) {
        missingArtifacts.push('raw-data/ui-refresh-clarity-summary.json');
      }
      if (!existsSync(uiRefreshMistapPath)) {
        missingArtifacts.push('raw-data/ui-refresh-mistap-summary.json');
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

      if (existsSync(uiRefreshSummaryPath)) {
        const parsedSummary = readJsonFile(uiRefreshSummaryPath);
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
