import { assertOptionalModuleEnabled, QUICK_WINS_MODULE_ID } from '../features/optionalModuleGuards';
import { type EventLogger } from '../events/eventLogger';
import { type Item, type QuickWinsOutcome, type QuickWinsProjectionItem } from '../types';
import { applyQuickWinsProjection } from './quickWinsApplyService';
import { type QuickTemplateRepository } from './quickTemplateRepository';
import { buildQuickWinsProjection } from './quickWinsProjection';
import { validatePositiveIntegerMultiplier, validateQuickTemplate } from './quickWinsValidation';

export type PreviewQuickWinsInput = {
  actorHouseholdId: string;
  householdId: string;
  listId: string;
  templateId: string;
  multiplier: unknown;
  existingItems: Item[];
};

export type PreviewQuickWinsResult =
  | {
      status: 'ready';
      projection: QuickWinsProjectionItem[];
    }
  | {
      status: 'rejected';
      reason: string;
      projection: QuickWinsProjectionItem[];
    };

export type ExecuteQuickWinsInput = PreviewQuickWinsInput & {
  confirm: boolean;
  logger?: EventLogger;
};

function reject(reason: string, items: Item[], projection: QuickWinsProjectionItem[] = []): QuickWinsOutcome {
  return {
    status: 'rejected',
    insertedItemIds: [],
    mergedItemIds: [],
    rejectionReason: reason,
    items,
    projection,
  };
}

export function createQuickWinsService(repository: QuickTemplateRepository) {
  function previewQuickWins(input: PreviewQuickWinsInput): PreviewQuickWinsResult {
    if (input.actorHouseholdId !== input.householdId) {
      return {
        status: 'rejected',
        reason: 'cross_household_denied',
        projection: [],
      };
    }

    const multiplierValidation = validatePositiveIntegerMultiplier(input.multiplier);
    if (!multiplierValidation.ok) {
      return {
        status: 'rejected',
        reason: multiplierValidation.reason,
        projection: [],
      };
    }

    let template;
    try {
      template = repository.getTemplateForHousehold({
        actorHouseholdId: input.actorHouseholdId,
        templateId: input.templateId,
      });
    } catch {
      return {
        status: 'rejected',
        reason: 'cross_household_denied',
        projection: [],
      };
    }

    if (!template) {
      return {
        status: 'rejected',
        reason: 'template_not_found',
        projection: [],
      };
    }

    const templateError = validateQuickTemplate(template);
    if (templateError) {
      return {
        status: 'rejected',
        reason: templateError,
        projection: [],
      };
    }

    return {
      status: 'ready',
      projection: buildQuickWinsProjection({
        householdId: input.householdId,
        listId: input.listId,
        template,
        multiplier: multiplierValidation.multiplier,
        existingItems: input.existingItems,
      }),
    };
  }

  function executeQuickWins(input: ExecuteQuickWinsInput): QuickWinsOutcome {
    const preview = previewQuickWins(input);
    if (preview.status !== 'ready') {
      return reject(preview.reason, input.existingItems, preview.projection);
    }

    if (!input.confirm) {
      return {
        status: 'cancelled',
        insertedItemIds: [],
        mergedItemIds: [],
        items: [...input.existingItems],
        projection: preview.projection,
      };
    }

    try {
      assertOptionalModuleEnabled(QUICK_WINS_MODULE_ID);
    } catch {
      return reject('quick_wins_module_disabled', input.existingItems, preview.projection);
    }

    const applied = applyQuickWinsProjection({
      householdId: input.householdId,
      listId: input.listId,
      projection: preview.projection,
      existingItems: input.existingItems,
      logger: input.logger,
    });

    return {
      status: 'applied',
      insertedItemIds: applied.insertedItemIds,
      mergedItemIds: applied.mergedItemIds,
      items: applied.items,
      projection: preview.projection,
    };
  }

  return {
    previewQuickWins,
    executeQuickWins,
  };
}
