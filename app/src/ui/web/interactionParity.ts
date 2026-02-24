export type InputDevice = 'keyboard' | 'pointer';

export type CommittedAction = {
  type: 'add' | 'validate' | 'toggle' | 'undo' | 'continue' | 'retry_connection';
  source: string;
};

export type InteractionAccessibility = {
  ariaLabel: string;
  keyboardShortcut: 'Enter';
  pointerTrigger: 'click';
};

export type InputParityComparison = {
  scenarioId: string;
  keyboardHash: string;
  pointerHash: string;
  parity: 'pass' | 'fail';
};

function mapIntent(intent: string): CommittedAction['type'] {
  if (intent.includes('validate')) {
    return 'validate';
  }

  if (intent.includes('undo')) {
    return 'undo';
  }

  if (intent.includes('toggle')) {
    return 'toggle';
  }

  if (intent.includes('retry_connection')) {
    return 'retry_connection';
  }

  if (intent.includes('continue')) {
    return 'continue';
  }

  return 'add';
}

export function toCommittedAction(_device: InputDevice, _trigger: string, intent: string): CommittedAction {
  return {
    type: mapIntent(intent),
    source: intent,
  };
}

export function getInteractionAccessibility(intent: string): InteractionAccessibility {
  return {
    ariaLabel: intent.replace(/[-_]+/g, ' '),
    keyboardShortcut: 'Enter',
    pointerTrigger: 'click',
  };
}

export function hashCommittedActions(actions: CommittedAction[]): string {
  const canonical = actions
    .map((action) => `${action.type}:${action.source}`)
    .sort()
    .join('|');

  return Buffer.from(canonical, 'utf8').toString('base64url');
}

export function compareKeyboardPointerOutcomes(input: {
  scenarioId: string;
  keyboardActions: CommittedAction[];
  pointerActions: CommittedAction[];
}): InputParityComparison {
  const keyboardHash = hashCommittedActions(input.keyboardActions);
  const pointerHash = hashCommittedActions(input.pointerActions);

  return {
    scenarioId: input.scenarioId,
    keyboardHash,
    pointerHash,
    parity: keyboardHash === pointerHash ? 'pass' : 'fail',
  };
}
