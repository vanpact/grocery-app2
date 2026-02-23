export type LayoutMode = 'mobile' | 'web-600-839' | 'web-840-1199' | 'desktop-2pane';

export function resolveLayoutMode(width: number): LayoutMode {
  if (width < 600) {
    return 'mobile';
  }

  if (width < 840) {
    return 'web-600-839';
  }

  if (width < 1200) {
    return 'web-840-1199';
  }

  return 'desktop-2pane';
}
