export type ViewportBand = '<600' | '600-839' | '840-1199' | '>=1200';

export type LayoutMode = 'mobile' | 'tablet' | 'desktop-two-pane';

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
    return 'desktop-two-pane';
  }

  if (band === '<600') {
    return 'mobile';
  }

  return 'tablet';
}
