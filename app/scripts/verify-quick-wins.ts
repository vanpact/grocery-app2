import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { type QuickWinsTimingRun } from '../src/runtime/contracts';
import { writeEvidenceBundle, buildEvidenceBundlePath } from './lib/evidenceWriter';
import { evaluateGateDecision } from './lib/gateDecision';
import { evaluateQuickWinsTiming } from './lib/quickWinsTimingEvaluation';
import { buildQuickWinsTimingReport } from './lib/quickWinsTimingReport';

type QuickWinsTimingRunsFile = {
  baselineRuns?: Array<{ runId: string; durationMs: number; scenarioId?: string }>;
  quickRuns?: Array<{ runId: string; durationMs: number; scenarioId?: string }>;
};

type RunQuickWinsVerificationInput = {
  releaseId: string;
  gateId: string;
  bundleId: string;
  timingRunsPath?: string;
  evidenceRootDir?: string;
  now?: () => Date;
};

type RunQuickWinsVerificationOutput = {
  status: 'pass' | 'fail';
  report: ReturnType<typeof buildQuickWinsTimingReport>;
  gateDecision: ReturnType<typeof evaluateGateDecision>;
  timingRunsPath: string;
  evidenceBundlePath: string;
};

function resolveEvidenceRootDir(evidenceRootDir?: string): string {
  if (evidenceRootDir) {
    return resolve(evidenceRootDir);
  }

  return resolve(process.cwd(), '..', 'evidence');
}

function parseArgValue(flag: string): string | undefined {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index < 0) {
    return undefined;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--') || value === '--') {
    return undefined;
  }

  return value;
}

function parsePositionalArgs(): string[] {
  return process.argv.slice(2).filter((arg) => !arg.startsWith('--') && arg !== '--');
}

function requireArg(flag: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required argument: ${flag}`);
  }

  return value;
}

function defaultRequiredOwners(gateId: string): string[] {
  if (gateId === 'G-QW-01') {
    return ['Engineering Lead', 'Product Owner'];
  }

  return ['Engineering Lead'];
}

function resolveTimingRunsPath(input: RunQuickWinsVerificationInput, evidenceRootDir: string): string {
  if (input.timingRunsPath) {
    return resolve(input.timingRunsPath);
  }

  const bundlePath = buildEvidenceBundlePath({
    releaseId: input.releaseId,
    gateId: input.gateId,
    bundleId: input.bundleId,
    evidenceRootDir,
  });
  return join(bundlePath, 'raw-data', 'quick-wins-timing-runs.json');
}

function parseTimingRunsFile(path: string): {
  baselineRuns: QuickWinsTimingRun[];
  quickRuns: QuickWinsTimingRun[];
  parseIssues: string[];
  rawContent?: QuickWinsTimingRunsFile;
} {
  if (!existsSync(path)) {
    return {
      baselineRuns: [],
      quickRuns: [],
      parseIssues: ['MISSING_TIMING_RUNS_FILE'],
    };
  }

  let parsed: QuickWinsTimingRunsFile;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8')) as QuickWinsTimingRunsFile;
  } catch {
    return {
      baselineRuns: [],
      quickRuns: [],
      parseIssues: ['INVALID_TIMING_RUNS_JSON'],
    };
  }

  const parseIssues: string[] = [];
  if (!Array.isArray(parsed.baselineRuns)) {
    parseIssues.push('INVALID_BASELINE_RUNS_ARRAY');
  }
  if (!Array.isArray(parsed.quickRuns)) {
    parseIssues.push('INVALID_QUICK_RUNS_ARRAY');
  }

  const toRuns = (
    mode: 'baseline' | 'quick',
    rows: Array<{ runId: string; durationMs: number; scenarioId?: string }> | undefined,
  ): QuickWinsTimingRun[] =>
    (rows ?? []).map((row, index) => ({
      runId: row.runId ?? `${mode}-${index + 1}`,
      mode,
      durationMs: row.durationMs,
      scenarioId: row.scenarioId ?? `${mode}-scenario-${index + 1}`,
    }));

  return {
    baselineRuns: toRuns('baseline', Array.isArray(parsed.baselineRuns) ? parsed.baselineRuns : []),
    quickRuns: toRuns('quick', Array.isArray(parsed.quickRuns) ? parsed.quickRuns : []),
    parseIssues: [...new Set(parseIssues)].sort(),
    rawContent: parsed,
  };
}

function toRuleStatus(status: 'pass' | 'fail'): 'pass' | 'fail' {
  return status;
}

export function runQuickWinsVerification(input: RunQuickWinsVerificationInput): RunQuickWinsVerificationOutput {
  const now = input.now ?? (() => new Date());
  const evidenceRootDir = resolveEvidenceRootDir(input.evidenceRootDir);
  const timingRunsPath = resolveTimingRunsPath(input, evidenceRootDir);
  const parsedRuns = parseTimingRunsFile(timingRunsPath);

  const evaluation = evaluateQuickWinsTiming({
    baselineRuns: parsedRuns.baselineRuns,
    quickRuns: parsedRuns.quickRuns,
  });

  const combinedReasonCodes = [...new Set([...evaluation.reasonCodes, ...parsedRuns.parseIssues])].sort();
  const status: 'pass' | 'fail' = combinedReasonCodes.length === 0 ? 'pass' : 'fail';

  const report = buildQuickWinsTimingReport({
    releaseId: input.releaseId,
    gateId: input.gateId,
    bundleId: input.bundleId,
    evaluation: {
      ...evaluation,
      status,
      reasonCodes: combinedReasonCodes,
    },
  });

  const verificationResult = {
    verificationId: report.verificationId,
    status: toRuleStatus(report.status),
    evidenceRefs: ['raw-data/quick-wins-timing-runs.json', 'raw-data/quick-wins-timing-report.json'],
    notes: `baseline_runs=${report.runCountBaseline}; quick_runs=${report.runCountQuick}; baseline_median_ms=${report.baselineMedianMs}; quick_median_ms=${report.quickMedianMs}; improvement_pct=${report.improvementPct}; reasons=${report.reasonCodes.join(',') || 'none'}`,
  } as const;

  const requiredOwners = defaultRequiredOwners(input.gateId);
  const gateDecision = evaluateGateDecision({
    gateId: input.gateId,
    requiredOwners,
    approvals: requiredOwners,
    verificationResults: [verificationResult],
    optionalModules: [],
  });

  const bundleWrite = writeEvidenceBundle({
    releaseId: input.releaseId,
    gateId: input.gateId,
    bundleId: input.bundleId,
    scope: 'conditional',
    storyIds: ['GS-101'],
    targetAlias: 'default',
    results: [verificationResult],
    requiredOwners,
    approvals: requiredOwners,
    decision: gateDecision.decision,
    rationale: gateDecision.rationale,
    extraRawArtifacts: [
      {
        filename: 'quick-wins-timing-runs.json',
        content: parsedRuns.rawContent ?? { baselineRuns: [], quickRuns: [] },
      },
      {
        filename: 'quick-wins-timing-report.json',
        content: report,
      },
    ],
    evidenceRootDir,
    now,
  });

  return {
    status,
    report,
    gateDecision,
    timingRunsPath,
    evidenceBundlePath: bundleWrite.bundlePath,
  };
}

function main(): void {
  const positional = parsePositionalArgs();
  const releaseId = requireArg('--release', parseArgValue('--release') ?? positional[0]);
  const gateId = requireArg('--gate', parseArgValue('--gate') ?? positional[1]);
  const bundleId = requireArg('--bundle', parseArgValue('--bundle') ?? positional[2]);
  const timingRunsPath = parseArgValue('--timing-runs');

  const output = runQuickWinsVerification({
    releaseId,
    gateId,
    bundleId,
    timingRunsPath,
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output, null, 2));

  if (output.status !== 'pass') {
    process.exitCode = 1;
  }
}

const isMainModule = (() => {
  const entryPath = process.argv[1];
  if (!entryPath) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryPath).href;
})();

if (isMainModule) {
  try {
    main();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
