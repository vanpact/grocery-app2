import { describe, expect, it } from 'vitest';

import { evaluateUiUsabilityEvidence } from '../../scripts/lib/uiUsabilityEvaluation';
import { getStateFeedback } from '../../src/ui/components/StateFeedback';
import { buildCommittedScreenModel } from '../../src/ui/screens/CommittedScreens';
import { getInteractionAccessibility } from '../../src/ui/web/interactionParity';
import { buildUiRefreshEvidenceInput, loadUsabilityFixtures } from '../helpers/usability';

describe('VR-COM-020 accessibility baseline', () => {
  it('exposes focus and accessibility metadata for committed feedback states', () => {
    const offline = getStateFeedback('offline');

    expect(offline.accessibility.ariaLabel).toContain('Offline');
    expect(offline.accessibility.focusIndicatorRequired).toBe(true);
    expect(offline.accessibility.keyboardTraversalOrder.length).toBeGreaterThan(0);
    expect(offline.accessibility.minimumTouchTargetPx).toBeGreaterThanOrEqual(44);
  });

  it('defines keyboard and pointer accessibility mapping for committed actions', () => {
    const a11y = getInteractionAccessibility('validate-item');

    expect(a11y.keyboardShortcut).toBe('Enter');
    expect(a11y.pointerTrigger).toBe('click');
    expect(a11y.ariaLabel).toBe('validate item');
  });

  it('passes SC-007 accessibility checks for refreshed screens', () => {
    const fixtures = loadUsabilityFixtures();
    const evaluation = evaluateUiUsabilityEvidence(buildUiRefreshEvidenceInput(fixtures));
    const model = buildCommittedScreenModel({
      destination: 'active-shopping',
      state: 'loading',
      viewportWidth: 390,
    });

    expect(model.controlFeedbackStates).toEqual(['idle', 'focused', 'pressed', 'disabled']);
    expect(evaluation.successCriteria.sc007).toBe('pass');
    expect(evaluation.accessibilityPassRatePct).toBe(100);
  });
});
