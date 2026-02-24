import { describe, expect, it } from 'vitest';

import { resolveLayoutMode } from '../../src/ui/layout/layoutModeResolver';

describe('US3 responsive layout coverage', () => {
  it('maps web widths to committed breakpoints', () => {
    expect(resolveLayoutMode(375)).toBe('mobile');
    expect(resolveLayoutMode(700)).toBe('web-600-839');
    expect(resolveLayoutMode(1024)).toBe('web-840-1199');
    expect(resolveLayoutMode(1280)).toBe('desktop-2pane');
  });

  it('falls back to mobile layout when viewport width is non-finite', () => {
    expect(resolveLayoutMode(Number.NaN)).toBe('mobile');
    expect(resolveLayoutMode(Number.POSITIVE_INFINITY)).toBe('mobile');
  });
});
