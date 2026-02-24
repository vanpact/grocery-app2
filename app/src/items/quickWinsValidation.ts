import { type QuickTemplate } from '../types';

export type MultiplierValidationResult =
  | { ok: true; multiplier: number }
  | { ok: false; reason: 'invalid_multiplier_type' | 'invalid_multiplier_not_integer' | 'invalid_multiplier_not_positive' };

export function validatePositiveIntegerMultiplier(multiplier: unknown): MultiplierValidationResult {
  if (typeof multiplier !== 'number' || Number.isNaN(multiplier)) {
    return { ok: false, reason: 'invalid_multiplier_type' };
  }

  if (!Number.isInteger(multiplier)) {
    return { ok: false, reason: 'invalid_multiplier_not_integer' };
  }

  if (multiplier < 1) {
    return { ok: false, reason: 'invalid_multiplier_not_positive' };
  }

  return {
    ok: true,
    multiplier,
  };
}

export function validateQuickTemplate(template: QuickTemplate): string | null {
  if (!Array.isArray(template.items) || template.items.length === 0) {
    return 'invalid_template_items';
  }

  for (const item of template.items) {
    if (!item.name || !item.name.trim()) {
      return 'invalid_template_item_name';
    }
    if (typeof item.baseQty !== 'number' || Number.isNaN(item.baseQty) || item.baseQty <= 0) {
      return 'invalid_template_item_qty';
    }
  }

  return null;
}
