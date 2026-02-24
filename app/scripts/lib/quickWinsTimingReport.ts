import { type QuickWinsTimingReport } from '../../src/runtime/contracts';
import { type QuickWinsTimingEvaluation } from './quickWinsTimingEvaluation';

export type BuildQuickWinsTimingReportInput = {
  releaseId: string;
  gateId: string;
  bundleId: string;
  evaluation: QuickWinsTimingEvaluation;
};

export function buildQuickWinsTimingReport(input: BuildQuickWinsTimingReportInput): QuickWinsTimingReport {
  return {
    releaseId: input.releaseId,
    gateId: input.gateId,
    bundleId: input.bundleId,
    verificationId: 'VR-CND-101-BULK-ADD-TIME',
    status: input.evaluation.status,
    baselineMedianMs: input.evaluation.baselineMedianMs,
    quickMedianMs: input.evaluation.quickMedianMs,
    improvementPct: Number(input.evaluation.improvementPct.toFixed(4)),
    runCountBaseline: input.evaluation.runCountBaseline,
    runCountQuick: input.evaluation.runCountQuick,
    reasonCodes: [...input.evaluation.reasonCodes].sort(),
  };
}
