import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type FirebaseTargetProfile } from './contracts';

export type TargetProfileDocument = {
  profiles: FirebaseTargetProfile[];
};

export class TargetProfileError extends Error {
  constructor(
    readonly code:
      | 'missing_profiles'
      | 'default_profile_missing'
      | 'multiple_default_profiles'
      | 'default_profile_not_nonprod'
      | 'target_not_found',
    message: string,
  ) {
    super(message);
    this.name = 'TargetProfileError';
  }
}

export function validateTargetProfiles(profiles: FirebaseTargetProfile[]): string[] {
  const errors: string[] = [];
  if (profiles.length === 0) {
    errors.push('At least one Firebase target profile is required.');
    return errors;
  }

  const defaults = profiles.filter((profile) => profile.isDefault);
  if (defaults.length === 0) {
    errors.push('Exactly one default target profile is required.');
  } else if (defaults.length > 1) {
    errors.push('Multiple default target profiles found; exactly one is required.');
  } else if (defaults[0].environment !== 'nonprod') {
    errors.push('Default target profile must be nonprod.');
  }

  return errors;
}

export function resolveTargetProfile(
  profiles: FirebaseTargetProfile[],
  targetAlias?: string,
): FirebaseTargetProfile {
  const errors = validateTargetProfiles(profiles);
  if (errors.length > 0) {
    throw new TargetProfileError('missing_profiles', errors.join(' '));
  }

  if (!targetAlias) {
    const defaultProfile = profiles.find((profile) => profile.isDefault);
    if (!defaultProfile) {
      throw new TargetProfileError('default_profile_missing', 'No default target profile found.');
    }
    return defaultProfile;
  }

  const selected = profiles.find((profile) => profile.targetAlias === targetAlias);
  if (!selected) {
    throw new TargetProfileError('target_not_found', `Target alias "${targetAlias}" was not found.`);
  }

  return selected;
}

export function loadTargetProfilesFromConfig(configPath: string): FirebaseTargetProfile[] {
  const absolutePath = resolve(configPath);
  const parsed = JSON.parse(readFileSync(absolutePath, 'utf8')) as TargetProfileDocument;

  if (!parsed.profiles || !Array.isArray(parsed.profiles)) {
    throw new TargetProfileError('missing_profiles', 'Target profile file is missing a valid profiles array.');
  }

  const errors = validateTargetProfiles(parsed.profiles);
  if (errors.length > 0) {
    throw new TargetProfileError('missing_profiles', errors.join(' '));
  }

  return parsed.profiles;
}
