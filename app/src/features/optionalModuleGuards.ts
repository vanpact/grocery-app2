export type OptionalModuleId = string;

export type GateDecision = 'pass' | 'fail' | 'cut';

export const QUICK_WINS_MODULE_ID = 'quick-wins-bulk-add' as const;

export type OptionalModuleConfig = {
  enabled: boolean;
  gateDecision?: GateDecision;
  owners?: string[];
  approvals?: string[];
};

const registry = new Map<OptionalModuleId, OptionalModuleConfig>();

export function registerOptionalModule(moduleId: OptionalModuleId, config: OptionalModuleConfig): void {
  registry.set(moduleId, config);
}

export type OptionalModuleActivation = {
  enabled: boolean;
  reason:
    | 'module_not_registered'
    | 'feature_flag_disabled'
    | 'gate_not_passed'
    | 'owner_missing'
    | 'owner_approval_missing'
    | 'activation_requirements_satisfied';
};

export function getOptionalModuleActivation(moduleId: OptionalModuleId): OptionalModuleActivation {
  const config = registry.get(moduleId);
  if (!config) {
    return { enabled: false, reason: 'module_not_registered' };
  }

  if (!config.enabled) {
    return { enabled: false, reason: 'feature_flag_disabled' };
  }

  if (config.gateDecision !== 'pass') {
    return { enabled: false, reason: 'gate_not_passed' };
  }

  const owners = config.owners ?? [];
  if (owners.length === 0) {
    return { enabled: false, reason: 'owner_missing' };
  }

  const approvals = new Set(config.approvals ?? []);
  for (const owner of owners) {
    if (!approvals.has(owner)) {
      return { enabled: false, reason: 'owner_approval_missing' };
    }
  }

  return { enabled: true, reason: 'activation_requirements_satisfied' };
}

export function isOptionalModuleEnabled(moduleId: OptionalModuleId): boolean {
  return getOptionalModuleActivation(moduleId).enabled;
}

export function assertOptionalModuleEnabled(moduleId: OptionalModuleId): void {
  const activation = getOptionalModuleActivation(moduleId);
  if (!activation.enabled) {
    throw new Error(
      `Optional module "${moduleId}" is disabled (${activation.reason}).`,
    );
  }
}

export function clearOptionalModuleRegistry(): void {
  registry.clear();
}
