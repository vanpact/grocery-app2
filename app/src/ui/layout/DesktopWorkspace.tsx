import { resolveLayoutMode } from './layoutModeResolver';

export type DesktopWorkspace = {
  mode: 'single' | 'two-pane';
  primaryColumns: number;
  secondaryColumns: number;
};

export type DesktopTaskGuardrails = {
  mode: 'single' | 'two-pane';
  maxInteractionsToPrimaryAction: number;
  horizontalScrollRequired: boolean;
  secondaryPaneBlocksPrimaryTask: boolean;
  primaryTaskReachable: boolean;
};

export type LifecycleSnapshot = {
  routeName: string;
  pendingMutationIds: string[];
  savedAtIso: string;
};

export type LifecycleResumeResult =
  | {
      restored: true;
      routeName: string;
      pendingMutationIds: string[];
    }
  | {
      restored: false;
      reason: 'resume_window_expired' | 'invalid_snapshot_timestamp';
    };

export function getDesktopWorkspace(width: number): DesktopWorkspace {
  const mode = resolveLayoutMode(width) === 'desktop-two-pane' ? 'two-pane' : 'single';

  if (mode === 'two-pane') {
    return {
      mode,
      primaryColumns: 8,
      secondaryColumns: 4,
    };
  }

  return {
    mode,
    primaryColumns: 12,
    secondaryColumns: 0,
  };
}

export function evaluateDesktopTaskGuardrails(input: {
  width: number;
  interactionsToPrimaryAction: number;
  horizontalScrollRequired: boolean;
  secondaryPaneBlocksPrimaryTask: boolean;
}): DesktopTaskGuardrails {
  const workspace = getDesktopWorkspace(input.width);
  const maxInteractionsToPrimaryAction = workspace.mode === 'two-pane' ? 2 : 2;
  const primaryTaskReachable =
    input.interactionsToPrimaryAction <= maxInteractionsToPrimaryAction &&
    !input.horizontalScrollRequired &&
    !input.secondaryPaneBlocksPrimaryTask;

  return {
    mode: workspace.mode,
    maxInteractionsToPrimaryAction,
    horizontalScrollRequired: input.horizontalScrollRequired,
    secondaryPaneBlocksPrimaryTask: input.secondaryPaneBlocksPrimaryTask,
    primaryTaskReachable,
  };
}

export function createLifecycleSnapshot(
  routeName: string,
  pendingMutationIds: string[],
  at: Date = new Date(),
): LifecycleSnapshot {
  return {
    routeName,
    pendingMutationIds: [...pendingMutationIds],
    savedAtIso: at.toISOString(),
  };
}

export function resumeLifecycleSnapshot(
  snapshot: LifecycleSnapshot,
  at: Date = new Date(),
  maxOfflineMinutes = 30,
): LifecycleResumeResult {
  const snapshotSavedAtMs = new Date(snapshot.savedAtIso).getTime();
  if (!Number.isFinite(snapshotSavedAtMs)) {
    return {
      restored: false,
      reason: 'invalid_snapshot_timestamp',
    };
  }

  const elapsedMs = at.getTime() - snapshotSavedAtMs;
  const elapsedMinutes = elapsedMs / 60000;

  if (elapsedMinutes > maxOfflineMinutes) {
    return {
      restored: false,
      reason: 'resume_window_expired',
    };
  }

  return {
    restored: true,
    routeName: snapshot.routeName,
    pendingMutationIds: [...snapshot.pendingMutationIds],
  };
}
