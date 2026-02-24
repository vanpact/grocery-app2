import { type ReleaseReadinessScope, type ReleaseReadinessSource } from '../../src/runtime/contracts';

const VALID_SCOPES: ReleaseReadinessScope[] = ['committed', 'committed_plus_optional'];

export function resolveReleaseReadinessScope(scope?: string): ReleaseReadinessScope {
  if (!scope) {
    return 'committed';
  }

  if (VALID_SCOPES.includes(scope as ReleaseReadinessScope)) {
    return scope as ReleaseReadinessScope;
  }

  throw new Error(`Invalid scope "${scope}". Expected one of: ${VALID_SCOPES.join(', ')}.`);
}

export function resolveReleaseReadinessSource(input: {
  source?: ReleaseReadinessSource;
  ciEnv?: string | undefined;
} = {}): ReleaseReadinessSource {
  if (input.source) {
    return input.source;
  }

  return input.ciEnv === 'true' ? 'ci_authoritative' : 'local_preview';
}
