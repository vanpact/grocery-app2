export type ViewportBand = '<600' | '600-839' | '840-1199' | '>=1200';

export type LayoutMode = 'single-pane' | 'two-pane';

export type NavigationPattern = 'top-wrapped' | 'top-single-row';

export type SecondaryPaneMode = 'context-only' | 'n/a';

export const REFRESH_VIEWPORT_MATRIX = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
] as const;

export function resolveViewportBand(width: number): ViewportBand {
  if (!Number.isFinite(width)) {
    return '<600';
  }

  if (width < 600) {
    return '<600';
  }

  if (width < 840) {
    return '600-839';
  }

  if (width < 1200) {
    return '840-1199';
  }

  return '>=1200';
}

export function resolveLayoutMode(width: number): LayoutMode {
  const band = resolveViewportBand(width);
  if (band === '>=1200') {
    return 'two-pane';
  }

  return 'single-pane';
}

export function resolveNavigationPattern(width: number): NavigationPattern {
  return resolveViewportBand(width) === '<600' ? 'top-wrapped' : 'top-single-row';
}

export function resolveSecondaryPaneMode(width: number): SecondaryPaneMode {
  return resolveLayoutMode(width) === 'two-pane' ? 'context-only' : 'n/a';
}
