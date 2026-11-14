import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAspectRatioClass,
  getFocalClass,
  getSectionPaddingClass,
  getViewportBreakpoint,
  mapPreviewDeviceToBreakpoint,
  resolveMediaForDevice,
  resolveSectionLayoutForDevice,
} from './responsiveMedia.ts';

test('getViewportBreakpoint classifies mobile, tablet, and laptop widths accurately', () => {
  assert.equal(getViewportBreakpoint(375), 'mobile');
  assert.equal(getViewportBreakpoint(390), 'mobile');
  assert.equal(getViewportBreakpoint(639), 'mobile');
  assert.equal(getViewportBreakpoint(640), 'tablet');
  assert.equal(getViewportBreakpoint(768), 'tablet');
  assert.equal(getViewportBreakpoint(1023), 'tablet');
  assert.equal(getViewportBreakpoint(1024), 'laptop');
  assert.equal(getViewportBreakpoint(1440), 'laptop');
});

test('mapPreviewDeviceToBreakpoint maps CMS previewDevice tokens', () => {
  assert.equal(mapPreviewDeviceToBreakpoint('desktop'), 'laptop');
  assert.equal(mapPreviewDeviceToBreakpoint('tablet'), 'tablet');
  assert.equal(mapPreviewDeviceToBreakpoint('mobile'), 'mobile');
  assert.equal(mapPreviewDeviceToBreakpoint(undefined), 'laptop');
});

test('resolveMediaForDevice follows priority: explicit override -> device default -> base', () => {
  const base = {
    aspectRatio: '9:16' as const,
    fit: 'cover' as const,
    focalPoint: 'center' as const,
  };
  const defaults = {
    mobile: { aspectRatio: '3:4' as const },
    tablet: { aspectRatio: '4:5' as const },
    laptop: { aspectRatio: '9:16' as const },
  };
  const overrides = {
    mobile: { aspectRatio: '1:1' as const, fit: 'contain' as const, focalPoint: 'top' as const },
  };

  // Explicit mobile override wins over device default and base
  const mobileResolved = resolveMediaForDevice('mobile', base, overrides, defaults);
  assert.equal(mobileResolved.aspectRatio, '1:1');
  assert.equal(mobileResolved.fit, 'contain');
  assert.equal(mobileResolved.focalPoint, 'top');

  // Tablet has no explicit override -> uses tablet default + base
  const tabletResolved = resolveMediaForDevice('tablet', base, overrides, defaults);
  assert.equal(tabletResolved.aspectRatio, '4:5');
  assert.equal(tabletResolved.fit, 'cover');
  assert.equal(tabletResolved.focalPoint, 'center');

  // Auto aspectRatio on override falls back cleanly to device default
  const autoFallback = resolveMediaForDevice(
    'tablet',
    base,
    { tablet: { aspectRatio: 'auto' } },
    defaults
  );
  assert.equal(autoFallback.aspectRatio, '4:5');
});

test('resolveSectionLayoutForDevice resolves per-device padding, mobile layout, and columns', () => {
  const layout = {
    mobile: { paddingY: 'spacious' as const, mobileLayout: 'grid-2' as const },
    tablet: { columnsTablet: 3 as const },
  };

  const mobile = resolveSectionLayoutForDevice('mobile', layout);
  assert.equal(mobile.paddingY, 'spacious');
  assert.equal(mobile.mobileLayout, 'grid-2');

  const tablet = resolveSectionLayoutForDevice('tablet', layout);
  assert.equal(tablet.columnsTablet, 3);
  assert.equal(tablet.paddingY, 'standard');

  const laptop = resolveSectionLayoutForDevice('laptop', layout);
  assert.equal(laptop.columnsLaptop, 4);
  assert.equal(laptop.paddingY, 'standard');
});

test('CSS class helpers return deterministic Tailwind utility strings', () => {
  assert.equal(getFocalClass('top'), 'object-top');
  assert.equal(getFocalClass('right'), 'object-right');
  assert.equal(getFocalClass(undefined), 'object-center');

  assert.equal(getAspectRatioClass('16:10'), 'aspect-[16/10]');
  assert.equal(getAspectRatioClass('3:4'), 'aspect-[3/4]');
  assert.equal(getAspectRatioClass('1:1'), 'aspect-square');

  assert.equal(getSectionPaddingClass('mobile', 'compact'), 'py-14');
  assert.equal(getSectionPaddingClass('tablet', 'standard'), 'py-20');
  assert.equal(getSectionPaddingClass('laptop', 'spacious'), 'py-36');
});
