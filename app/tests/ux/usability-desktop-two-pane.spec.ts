import { describe, expect, it } from 'vitest';
import { evaluateDesktopTaskGuardrails } from '../../src/ui/layout/DesktopWorkspace';

describe('usability desktop two-pane constraints', () => {
  it('keeps primary controls reachable and enforces context-only secondary pane at >=1200', () => {
    const guardrails = evaluateDesktopTaskGuardrails({
      width: 1280,
      interactionsToPrimaryAction: 2,
      horizontalScrollRequired: false,
      secondaryPaneBlocksPrimaryTask: false,
      stateChangingControlsOutsidePrimaryPane: false,
    });

    expect(guardrails.mode).toBe('two-pane');
    expect(guardrails.primaryTaskReachable).toBe(true);
    expect(guardrails.contextOnlySecondaryPane).toBe(true);
    expect(guardrails.stateChangingControlsOutsidePrimaryPane).toBe(false);
    expect(guardrails.horizontalScrollRequired).toBe(false);
  });
});
