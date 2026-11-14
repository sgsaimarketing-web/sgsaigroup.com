import { useState, useEffect } from 'react';
import { useSiteContent } from '../context/ContentContext.tsx';
import type { DeviceBreakpoint } from '../data/siteContent.ts';
import {
  getViewportBreakpoint,
  mapPreviewDeviceToBreakpoint,
} from '../utils/responsiveMedia.ts';

/**
 * Resolves the active device breakpoint ('laptop' | 'tablet' | 'mobile').
 * Automatically switches to simulated CMS device when the editor is open and previewing tablet/mobile,
 * or tracks live browser viewport resizes otherwise.
 */
export function useEffectiveDevice(): DeviceBreakpoint {
  const { isAuthorized, isEditorOpen, previewDevice } = useSiteContent();

  const [viewportDevice, setViewportDevice] = useState<DeviceBreakpoint>(() => {
    if (typeof window === 'undefined') return 'laptop';
    return getViewportBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      setViewportDevice(getViewportBreakpoint(window.innerWidth));
    };

    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  if (isAuthorized && isEditorOpen && (previewDevice === 'tablet' || previewDevice === 'mobile')) {
    return mapPreviewDeviceToBreakpoint(previewDevice);
  }

  return viewportDevice;
}
