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
  const byHouseholdId = new Map<string, Map<string, QuickTemplate>>();
  const byTemplateId = new Map<string, QuickTemplate[]>();

  for (const template of templates) {
    const householdTemplates = byHouseholdId.get(template.householdId) ?? new Map<string, QuickTemplate>();
    if (!householdTemplates.has(template.templateId)) {
      householdTemplates.set(template.templateId, template);
    }
    byHouseholdId.set(template.householdId, householdTemplates);

    const sameTemplateId = byTemplateId.get(template.templateId) ?? [];
    sameTemplateId.push(template);
    byTemplateId.set(template.templateId, sameTemplateId);
  }

  return {
    getTemplateForHousehold(input) {
      const template = byHouseholdId.get(input.actorHouseholdId)?.get(input.templateId);
      if (!template) {
        const foreignTemplate = byTemplateId.get(input.templateId)?.[0];
        if (foreignTemplate) {
          assertHouseholdRepositoryAccess(input.actorHouseholdId, foreignTemplate.householdId);
        }
        return undefined;
      }

      assertHouseholdRepositoryAccess(input.actorHouseholdId, template.householdId);
      return template;
    },
  };
}
