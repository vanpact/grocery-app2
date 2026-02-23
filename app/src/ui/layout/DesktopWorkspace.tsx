import { resolveLayoutMode } from './layoutModeResolver';

export type DesktopWorkspace = {
  mode: 'single' | 'two-pane';
  primaryColumns: number;
  secondaryColumns: number;
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
      reason: 'resume_window_expired';
    };

export function getDesktopWorkspace(width: number): DesktopWorkspace {
  const mode = resolveLayoutMode(width) === 'desktop-2pane' ? 'two-pane' : 'single';

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
  const elapsedMs = at.getTime() - new Date(snapshot.savedAtIso).getTime();
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
