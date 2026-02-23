export type VerificationOutcomeInput = {
  verificationId: string;
  status: string;
  deterministic?: boolean;
};

type VerificationEvaluationInput = {
  committedVerificationIds: string[];
  verificationOutcomes: VerificationOutcomeInput[] | unknown;
};

export type VerificationEvaluationResult = {
  failingVerificationIds: string[];
  evaluationIssues: string[];
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function evaluateCommittedVerificationOutcomes(
  input: VerificationEvaluationInput,
): VerificationEvaluationResult {
  const failingVerificationIds: string[] = [];
  const evaluationIssues: string[] = [];
  const outcomesByVerificationId = new Map<string, VerificationOutcomeInput[]>();
  const verificationOutcomes = Array.isArray(input.verificationOutcomes) ? input.verificationOutcomes : [];

  if (!Array.isArray(input.verificationOutcomes)) {
    evaluationIssues.push('invalid_outcomes_type');
  }

  for (const outcome of verificationOutcomes) {
    const existing = outcomesByVerificationId.get(outcome.verificationId) ?? [];
    existing.push(outcome);
    outcomesByVerificationId.set(outcome.verificationId, existing);
  }

  for (const committedVerificationId of input.committedVerificationIds) {
    const entries = outcomesByVerificationId.get(committedVerificationId) ?? [];
    if (entries.length === 0) {
      failingVerificationIds.push(committedVerificationId);
      evaluationIssues.push(`missing_outcome:${committedVerificationId}`);
      continue;
    }

    if (entries.length > 1) {
      failingVerificationIds.push(committedVerificationId);
      evaluationIssues.push(`duplicated_outcome:${committedVerificationId}`);
      continue;
    }

    const entry = entries[0];
    const deterministic = entry.deterministic ?? true;
    if (!deterministic) {
      failingVerificationIds.push(committedVerificationId);
      evaluationIssues.push(`non_deterministic_outcome:${committedVerificationId}`);
      continue;
    }

    if (entry.status !== 'pass') {
      failingVerificationIds.push(committedVerificationId);
      evaluationIssues.push(`non_pass_outcome:${committedVerificationId}:${entry.status}`);
      continue;
    }
  }

  return {
    failingVerificationIds: uniqSorted(failingVerificationIds),
    evaluationIssues: uniqSorted(evaluationIssues),
  };
}
