import { describe, expect, it } from 'vitest';
import { evaluateDesktopTaskGuardrails } from '../../src/ui/layout/DesktopWorkspace';

describe('usability desktop two-pane constraints', () => {
  it('keeps primary controls reachable within two interactions without horizontal scroll', () => {
    const guardrails = evaluateDesktopTaskGuardrails({
      width: 1280,
      interactionsToPrimaryAction: 2,
      horizontalScrollRequired: false,
      secondaryPaneBlocksPrimaryTask: false,
    });

    expect(guardrails.mode).toBe('two-pane');
    expect(guardrails.primaryTaskReachable).toBe(true);
    expect(guardrails.horizontalScrollRequired).toBe(false);
  });
});
