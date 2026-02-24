import { assertHouseholdRepositoryAccess } from '../households/householdAccessGuard';
import { type QuickTemplate } from '../types';

export type QuickTemplateLookupInput = {
  actorHouseholdId: string;
  templateId: string;
};

export type QuickTemplateRepository = {
  getTemplateForHousehold: (input: QuickTemplateLookupInput) => QuickTemplate | undefined;
};

export function createInMemoryQuickTemplateRepository(templates: QuickTemplate[]): QuickTemplateRepository {
  const byTemplateId = new Map(templates.map((template) => [template.templateId, template]));

  return {
    getTemplateForHousehold(input) {
      const template = byTemplateId.get(input.templateId);
      if (!template) {
        return undefined;
      }

      assertHouseholdRepositoryAccess(input.actorHouseholdId, template.householdId);
      return template;
    },
  };
}
