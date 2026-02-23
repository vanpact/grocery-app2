export type InputDevice = 'keyboard' | 'pointer';

export type CommittedAction = {
  type: 'add' | 'validate' | 'toggle' | 'undo';
  source: string;
};

export type InteractionAccessibility = {
  ariaLabel: string;
  keyboardShortcut: 'Enter';
  pointerTrigger: 'click';
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
