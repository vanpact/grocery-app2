import { buildDedupKey } from './dedupKey';
import { type Item, type QuickTemplate, type QuickWinsProjectionItem } from '../types';

export type BuildQuickWinsProjectionInput = {
  householdId: string;
  listId: string;
  template: QuickTemplate;
  multiplier: number;
  existingItems: Item[];
};

type FoldedTemplateItem = {
  name: string;
  aisleKey: string | null;
  baseQty: number;
};

function foldTemplateItems(template: QuickTemplate): FoldedTemplateItem[] {
  const folded = new Map<string, FoldedTemplateItem>();

  for (const item of template.items) {
    const dedupKey = buildDedupKey(item.name, item.aisleKey);
    const existing = folded.get(dedupKey);
    if (!existing) {
      folded.set(dedupKey, {
        name: item.name.trim(),
        aisleKey: item.aisleKey,
        baseQty: item.baseQty,
      });
      continue;
    }

    existing.baseQty += item.baseQty;
    folded.set(dedupKey, existing);
  }

  return [...folded.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([, value]) => value);
}

function mapExistingByDedupKey(input: BuildQuickWinsProjectionInput): Map<string, Item> {
  const byKey = new Map<string, Item>();

  for (const item of input.existingItems) {
    if (item.householdId !== input.householdId || item.listId !== input.listId) {
      continue;
    }

    const key = buildDedupKey(item.name, item.aisleKey);
    if (!byKey.has(key)) {
      byKey.set(key, item);
    }
  }

  return byKey;
}

export function buildQuickWinsProjection(input: BuildQuickWinsProjectionInput): QuickWinsProjectionItem[] {
  const existingByDedupKey = mapExistingByDedupKey(input);
  const folded = foldTemplateItems(input.template);

  return folded.map((templateItem) => {
    const dedupKey = buildDedupKey(templateItem.name, templateItem.aisleKey);
    const existing = existingByDedupKey.get(dedupKey);

    return {
      dedupKey,
      name: templateItem.name,
      aisleKey: templateItem.aisleKey,
      projectedQty: templateItem.baseQty * input.multiplier,
      matchedExistingItemId: existing?.itemId ?? null,
      resolution: existing ? 'merge' : 'insert',
    };
  });
}
