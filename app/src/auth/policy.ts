import { type LifecycleState, type Role } from '../types';

export type SecurityPolicy = {
  auth_provider: 'firebase_auth';
  roles: ['suggest', 'validate'];
  actor_authority: 'membership_only';
  household_isolation: 'required';
  default_decision: 'deny';
};

export type SecurityTransitionRule = {
  from: LifecycleState;
  to: LifecycleState;
  allowed_roles: Role[];
};

export const SECURITY_POLICY: SecurityPolicy = {
  auth_provider: 'firebase_auth',
  roles: ['suggest', 'validate'],
  actor_authority: 'membership_only',
  household_isolation: 'required',
  default_decision: 'deny',
};

export const TRANSITION_RULES: SecurityTransitionRule[] = [
  { from: 'draft', to: 'suggested', allowed_roles: ['suggest', 'validate'] },
  { from: 'suggested', to: 'validated', allowed_roles: ['validate'] },
  { from: 'validated', to: 'bought', allowed_roles: ['validate'] },
  { from: 'bought', to: 'validated', allowed_roles: ['validate'] },
];

export function canTransition(role: Role, from: LifecycleState, to: LifecycleState): boolean {
  const rule = TRANSITION_RULES.find((entry) => entry.from === from && entry.to === to);
  if (!rule) {
    return false;
  }

  return rule.allowed_roles.includes(role);
}
