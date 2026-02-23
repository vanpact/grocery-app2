import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type FixtureRecord = {
  id: string;
  [key: string]: unknown;
};

export type FixtureManifest = {
  baselineOwned: {
    collections: string[];
    listItemSubcollections: string[];
  };
  fixtures: {
    households: FixtureRecord[];
    lists: FixtureRecord[];
    memberships?: FixtureRecord[];
    events?: FixtureRecord[];
    items?: FixtureRecord[];
  };
};

export type FixtureDocument = {
  collection: string;
  documentId: string;
  payload: Record<string, unknown>;
};

export type ResetDeletionRef = {
  path: string;
  baselineOwned: boolean;
};

export function loadFixtureManifest(manifestPath: string): FixtureManifest {
  const absolutePath = resolve(manifestPath);
  return JSON.parse(readFileSync(absolutePath, 'utf8')) as FixtureManifest;
}

export function buildFixtureDocuments(manifest: FixtureManifest): FixtureDocument[] {
  const documents: FixtureDocument[] = [];
  const pushFixtures = (collection: string, fixtures: FixtureRecord[] | undefined) => {
    for (const fixture of fixtures ?? []) {
      const { id, ...payload } = fixture;
      documents.push({
        collection,
        documentId: id,
        payload,
      });
    }
  };

  pushFixtures('households', manifest.fixtures.households);
  pushFixtures('lists', manifest.fixtures.lists);
  pushFixtures('memberships', manifest.fixtures.memberships);
  pushFixtures('events', manifest.fixtures.events);
  pushFixtures('items', manifest.fixtures.items);

  return documents;
}

export function buildBaselineOwnedFixtureKeys(manifest: FixtureManifest): string[] {
  return buildFixtureDocuments(manifest).map((document) => `${document.collection}/${document.documentId}`);
}

export function buildResetDeletionPlan(manifest: FixtureManifest): ResetDeletionRef[] {
  const allowedCollections = new Set(manifest.baselineOwned.collections);

  return buildFixtureDocuments(manifest).map((document) => ({
    path: `${document.collection}/${document.documentId}`,
    baselineOwned: allowedCollections.has(document.collection),
  }));
}

export function assertResetDeletionPlanInBaselineScope(plan: ResetDeletionRef[]): void {
  const outsideScope = plan.filter((entry) => !entry.baselineOwned).map((entry) => entry.path);
  if (outsideScope.length > 0) {
    throw new Error(
      `Reset deletion plan includes non-baseline records: ${outsideScope.sort().join(', ')}`,
    );
  }
}
