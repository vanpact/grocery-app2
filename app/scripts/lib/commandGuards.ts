import { type SetupMode } from '../../src/runtime/contracts';

export class CommandGuardError extends Error {
  constructor(
    readonly code: 'non_default_confirmation_required' | 'reset_confirmation_required' | 'reset_not_allowed',
    message: string,
  ) {
    super(message);
    this.name = 'CommandGuardError';
  }
}

export function buildNonDefaultTargetConfirmationToken(targetAlias: string): string {
  return `TARGET:${targetAlias}:CONFIRM`;
}

export function buildResetConfirmationToken(targetAlias: string): string {
  return `RESET:${targetAlias}:CONFIRM`;
}

export function assertNonDefaultTargetConfirmed(input: {
  targetAlias: string;
  defaultTargetAlias: string;
  confirmNonDefaultTarget?: string;
}): void {
  if (input.targetAlias === input.defaultTargetAlias) {
    return;
  }

  const expectedToken = buildNonDefaultTargetConfirmationToken(input.targetAlias);
  if (input.confirmNonDefaultTarget !== expectedToken) {
    throw new CommandGuardError(
      'non_default_confirmation_required',
      `Non-default target "${input.targetAlias}" requires --confirm-non-default-target ${expectedToken}.`,
    );
  }
}

export function assertResetConfirmed(input: {
  targetAlias: string;
  mode: SetupMode;
  confirmReset?: string;
  allowDestructiveReset: boolean;
}): void {
  if (input.mode !== 'reset') {
    return;
  }

  if (!input.allowDestructiveReset) {
    throw new CommandGuardError(
      'reset_not_allowed',
      'Destructive reset is not allowed for the selected target profile.',
    );
  }

  const expectedToken = buildResetConfirmationToken(input.targetAlias);
  if (input.confirmReset !== expectedToken) {
    throw new CommandGuardError(
      'reset_confirmation_required',
      `Reset mode requires --confirm-reset ${expectedToken}.`,
    );
  }
}

export function getConfirmationFlags(input: {
  targetAlias: string;
  defaultTargetAlias: string;
  mode: SetupMode;
  confirmNonDefaultTarget?: string;
  confirmReset?: string;
}): string[] {
  const flags: string[] = [];

  if (input.targetAlias !== input.defaultTargetAlias) {
    flags.push(`confirmNonDefaultTarget=${input.confirmNonDefaultTarget ?? ''}`);
  }

  if (input.mode === 'reset') {
    flags.push(`confirmReset=${input.confirmReset ?? ''}`);
  }

  return flags;
}
