import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type CanonicalSourceSet = {
  committedVerificationIds: string[];
  gateOwnersByGateId: Record<string, string[]>;
  committedFieldTestScenarioIds: string[];
  sourceDocuments: string[];
  unresolvedSources: string[];
};

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function parseCommittedVerificationIds(content: string): string[] {
  const ids: string[] = [];
  const pattern = /`(VR-COM-[0-9]{3}-[A-Z0-9-]+)`/g;
  let match = pattern.exec(content);
  while (match) {
    ids.push(match[1]);
    match = pattern.exec(content);
  }

  return uniqSorted(ids);
}

function parseGateOwners(content: string): {
  gateOwnersByGateId: Record<string, string[]>;
  issues: string[];
} {
  const gateOwnersByGateId: Record<string, string[]> = {};
  const issues: string[] = [];

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes('| `G-')) {
      continue;
    }

    const cells = line.split('|').map((cell) => cell.trim());
    if (cells.length < 6) {
      continue;
    }

    const gateIdCell = cells[1];
    const ownersCell = cells[5];
    if (!gateIdCell.startsWith('`G-')) {
      continue;
    }

    const gateId = gateIdCell.replace(/`/g, '');
    const ownersLiteral = ownersCell.replace(/^`/, '').replace(/`$/, '');
    try {
      const parsed = JSON.parse(ownersLiteral) as unknown;
      if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
        issues.push(`invalid_gate_owner_format:${gateId}`);
        continue;
      }

      gateOwnersByGateId[gateId] = uniqSorted(parsed);
    } catch {
      issues.push(`unparseable_gate_owner_list:${gateId}`);
    }
  }

  return {
    gateOwnersByGateId,
    issues,
  };
}

function parseCommittedFieldTestScenarioIds(content: string): string[] {
  const ids: string[] = [];
  const pattern = /^### Scenario ([A-Z0-9-]+).*?\(`committed`\)/gm;
  let match = pattern.exec(content);
  while (match) {
    ids.push(match[1]);
    match = pattern.exec(content);
  }

  return uniqSorted(ids);
}

export function loadCanonicalSources(input: { specsRootPath?: string } = {}): CanonicalSourceSet {
  const specsRootPath = input.specsRootPath ?? resolve(process.cwd(), '..', 'specs');
  const productSpecPath = resolve(specsRootPath, '00-product-spec.md');
  const gatesSpecPath = resolve(specsRootPath, '10-roadmap-and-gates.md');
  const backlogSpecPath = resolve(specsRootPath, '30-backlog-and-validation.md');

  const sourceDocuments = [productSpecPath, gatesSpecPath, backlogSpecPath].filter((path) => existsSync(path));
  const unresolvedSources: string[] = [];

  if (!existsSync(productSpecPath)) {
    unresolvedSources.push('missing_source:00-product-spec.md');
  }
  if (!existsSync(gatesSpecPath)) {
    unresolvedSources.push('missing_source:10-roadmap-and-gates.md');
  }
  if (!existsSync(backlogSpecPath)) {
    unresolvedSources.push('missing_source:30-backlog-and-validation.md');
  }

  const committedVerificationIds = existsSync(productSpecPath)
    ? parseCommittedVerificationIds(readFileSync(productSpecPath, 'utf8'))
    : [];
  if (committedVerificationIds.length === 0) {
    unresolvedSources.push('missing_committed_verification_ids');
  }

  const gateOwners = existsSync(gatesSpecPath) ? parseGateOwners(readFileSync(gatesSpecPath, 'utf8')) : undefined;
  const gateOwnersByGateId = gateOwners?.gateOwnersByGateId ?? {};
  if (gateOwners) {
    unresolvedSources.push(...gateOwners.issues);
  }

  const committedFieldTestScenarioIds = existsSync(backlogSpecPath)
    ? parseCommittedFieldTestScenarioIds(readFileSync(backlogSpecPath, 'utf8'))
    : [];
  if (committedFieldTestScenarioIds.length === 0) {
    unresolvedSources.push('missing_committed_field_test_scenarios');
  }

  return {
    committedVerificationIds,
    gateOwnersByGateId,
    committedFieldTestScenarioIds,
    sourceDocuments,
    unresolvedSources: uniqSorted(unresolvedSources),
  };
}
