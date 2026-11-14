import type {
  DeviceBreakpoint,
  DeviceHeightScale,
  DeviceMediaOverride,
  MediaAspectRatio,
  MediaFitMode,
  MediaFocalPoint,
  ResponsiveMediaOverrides,
  ResponsiveSectionOverrides,
  SectionLayoutOverride,
} from '../data/siteContent.ts';

export interface ResolvedMediaSettings {
  aspectRatio: MediaAspectRatio;
  fit: MediaFitMode;
  focalPoint: MediaFocalPoint;
  heightScale: DeviceHeightScale;
}

export function mapPreviewDeviceToBreakpoint(
  previewDevice?: 'desktop' | 'tablet' | 'mobile'
): DeviceBreakpoint {
  if (previewDevice === 'mobile') return 'mobile';
  if (previewDevice === 'tablet') return 'tablet';
  return 'laptop';
}

export function getViewportBreakpoint(width: number): DeviceBreakpoint {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'laptop';
}

export function getFocalClass(focalPoint?: MediaFocalPoint | string): string {
  switch (focalPoint) {
    case 'top':
      return 'object-top';
    case 'bottom':
      return 'object-bottom';
    case 'left':
      return 'object-left';
    case 'right':
      return 'object-right';
    default:
      return 'object-center';
  }
}

export function getAspectRatioClass(aspectRatio?: MediaAspectRatio | string): string {
  switch (aspectRatio) {
    case '16:9':
      return 'aspect-[16/9]';
    case '16:10':
      return 'aspect-[16/10]';
    case '4:3':
      return 'aspect-[4/3]';
    case '3:2':
      return 'aspect-[3/2]';
    case '4:5':
      return 'aspect-[4/5]';
    case '3:4':
      return 'aspect-[3/4]';
    case '9:16':
      return 'aspect-[9/16]';
    case '1:1':
      return 'aspect-square';
    default:
      return 'aspect-[4/5]';
  }
}

export function isVideoAssetUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    url.startsWith('data:video/') ||
    url.startsWith('blob:') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov')
  );
}

export function isImageAssetUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    url.startsWith('data:image/') ||
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.gif') ||
    clean.endsWith('.svg')
  );
}

/**
 * Resolves effective media sizing, aspect ratio, fit, and focal point for a given device.
 * Priority: Explicit device override -> Device sensible default -> Base media config.
 */
export function resolveMediaForDevice(
  device: DeviceBreakpoint,
  base: {
    aspectRatio?: MediaAspectRatio;
    fit?: MediaFitMode;
    focalPoint?: MediaFocalPoint;
    heightScale?: DeviceHeightScale;
  },
  responsiveMedia?: ResponsiveMediaOverrides,
  deviceDefaults?: Partial<Record<DeviceBreakpoint, DeviceMediaOverride>>
): ResolvedMediaSettings {
  const deviceDefault = deviceDefaults?.[device] || {};
  const explicit = responsiveMedia?.[device] || {};

  return {
    aspectRatio:
      explicit.aspectRatio && explicit.aspectRatio !== 'auto'
        ? explicit.aspectRatio
        : deviceDefault.aspectRatio || base.aspectRatio || 'auto',
    fit: explicit.fit || deviceDefault.fit || base.fit || 'cover',
    focalPoint: explicit.focalPoint || deviceDefault.focalPoint || base.focalPoint || 'center',
    heightScale: explicit.heightScale || deviceDefault.heightScale || base.heightScale || 'standard',
  };
}

/**
 * Resolves section-level layout overrides (padding density, mobile layout style, tablet columns).
 */
export function resolveSectionLayoutForDevice(
  device: DeviceBreakpoint,
  responsiveLayout?: ResponsiveSectionOverrides,
  defaults?: Partial<Record<DeviceBreakpoint, SectionLayoutOverride>>
): Required<SectionLayoutOverride> {
  const deviceDefault = defaults?.[device] || {};
  const explicit = responsiveLayout?.[device] || {};

  return {
    paddingY: explicit.paddingY || deviceDefault.paddingY || (device === 'mobile' ? 'compact' : 'standard'),
    mobileLayout: explicit.mobileLayout || deviceDefault.mobileLayout || 'carousel',
    columnsTablet: explicit.columnsTablet || deviceDefault.columnsTablet || 3,
    columnsLaptop: explicit.columnsLaptop || deviceDefault.columnsLaptop || 4,
  };
}

export function getSectionPaddingClass(
  device: DeviceBreakpoint,
  paddingY: 'compact' | 'standard' | 'spacious'
): string {
  if (device === 'mobile') {
    if (paddingY === 'compact') return 'py-14';
    if (paddingY === 'spacious') return 'py-24';
    return 'py-16';
  }
  if (device === 'tablet') {
    if (paddingY === 'compact') return 'py-16';
    if (paddingY === 'spacious') return 'py-28';
    return 'py-20';
  }
  if (paddingY === 'compact') return 'py-20';
  if (paddingY === 'spacious') return 'py-36';
  return 'py-28';
}
