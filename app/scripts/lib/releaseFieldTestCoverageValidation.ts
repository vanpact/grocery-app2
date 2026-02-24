export type FieldTestCoverageInputRecord = {
  scenarioId: string;
  status: string;
};

type FieldTestCoverageValidationInput = {
  committedScenarioIds: string[];
  coverageRecords: FieldTestCoverageInputRecord[];
};

export type FieldTestCoverageValidationResult = {
  fieldTestCoverageIssues: string[];
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function validateCommittedFieldTestCoverage(
  input: FieldTestCoverageValidationInput,
): FieldTestCoverageValidationResult {
  const issues: string[] = [];
  const recordsByScenarioId = new Map<string, FieldTestCoverageInputRecord[]>();

  for (const record of input.coverageRecords) {
    const existing = recordsByScenarioId.get(record.scenarioId) ?? [];
    existing.push(record);
    recordsByScenarioId.set(record.scenarioId, existing);
  }

  for (const scenarioId of input.committedScenarioIds) {
    const entries = recordsByScenarioId.get(scenarioId) ?? [];
    if (entries.length === 0) {
      issues.push(`missing:${scenarioId}`);
      continue;
    }

    if (entries.length > 1) {
      issues.push(`duplicated:${scenarioId}`);
      continue;
    }

    const status = entries[0].status;
    if (status === 'pass') {
      continue;
    }

    if (status === 'fail') {
      issues.push(`failed:${scenarioId}`);
      continue;
    }

    if (status === 'missing') {
      issues.push(`missing:${scenarioId}`);
      continue;
    }

    issues.push(`invalid_status:${scenarioId}:${status}`);
  }

  return {
    fieldTestCoverageIssues: uniqSorted(issues),
  };
}
