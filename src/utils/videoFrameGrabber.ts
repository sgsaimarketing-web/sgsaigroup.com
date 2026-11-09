/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Video Frame Grabber & 9:16 Thumbnail Extraction Engine
 * Allows scrubbing through any MP4/WebM video and extracting high-fidelity 9:16 WebP poster covers.
 */

/**
 * Calculates 9:16 cover cropping coordinates for an HTML5 Canvas.
 * Supports passing either a ratio (e.g. 9/16) or (targetWidth, targetHeight).
 */
export function calculateCoverCrop(
  srcWidth: number,
  srcHeight: number,
  targetRatioOrWidth: number = 9 / 16,
  targetHeight?: number
): { sx: number; sy: number; sWidth: number; sHeight: number } {
  const targetRatio = targetHeight ? targetRatioOrWidth / targetHeight : targetRatioOrWidth;
  const currentRatio = srcWidth / srcHeight;

  if (currentRatio > targetRatio) {
    // Source is wider than target: crop sides
    const sWidth = srcHeight * targetRatio;
    const sx = (srcWidth - sWidth) / 2;
    return { sx, sy: 0, sWidth, sHeight: srcHeight };
  } else {
    // Source is taller than target: crop top/bottom
    const sHeight = srcWidth / targetRatio;
    const sy = (srcHeight - sHeight) / 2;
    return { sx: 0, sy, sWidth: srcWidth, sHeight };
  }
}

/**
 * Captures a single 9:16 frame from an active video element or URL at a specific timestamp.
 */
export async function captureVideoFrame(
  videoSource: HTMLVideoElement | string,
  timeInSeconds: number,
  targetWidth: number = 540,
  targetHeight: number = 960
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Video frame capture is only supported in browser environments');
  }

  let video: HTMLVideoElement;
  let isInternalElement = false;

  if (typeof videoSource === 'string') {
    isInternalElement = true;
    video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = videoSource;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Video loading timed out')), 10000);
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load video source for frame capture'));
      };
    });
  } else {
    video = videoSource;
  }

  // Seek video to target second
  const safeTime = Math.max(0, Math.min(timeInSeconds, video.duration || timeInSeconds));
  await new Promise<void>((resolve) => {
    let resolved = false;
    const onSeeked = () => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = safeTime;
    // Fallback if seeked does not fire
    setTimeout(onSeeked, 600);
  });

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    if (isInternalElement) video.remove();
    throw new Error('Failed to acquire 2D canvas context');
  }

  const { sx, sy, sWidth, sHeight } = calculateCoverCrop(
    video.videoWidth || targetWidth,
    video.videoHeight || targetHeight,
    9 / 16
  );

  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  if (isInternalElement) {
    video.remove();
  }

  try {
    return canvas.toDataURL('image/webp', 0.85);
  } catch {
    return canvas.toDataURL('image/jpeg', 0.85);
  }
}

export interface ExtractedFrame {
  time: number;
  label: string;
  dataUrl: string;
}

/**
 * Automatically extracts an array of equidistant preview frames across the video duration.
 */
export async function extractFrameGrid(
  videoUrl: string,
  count: number = 5,
  targetWidth: number = 270,
  targetHeight: number = 480
): Promise<ExtractedFrame[]> {
  if (typeof window === 'undefined') return [];

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = videoUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Video metadata timeout')), 10000);
      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        resolve();
      };
      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to read video for frame grid'));
      };
    });

    const duration = video.duration || 5;
    const results: ExtractedFrame[] = [];

    // Sample points across duration: e.g. for 5 frames: 15%, 32%, 50%, 68%, 85%
    for (let i = 0; i < count; i++) {
      const pct = (i + 1) / (count + 1);
      const time = Math.round(duration * pct * 10) / 10;
      const dataUrl = await captureVideoFrame(video, time, targetWidth, targetHeight);
      
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      const label = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      results.push({ time, label, dataUrl });
    }

    video.remove();
    return results;
  } catch (err) {
    console.warn('Frame grid extraction warning:', err);
    video.remove();
    return [];
  }
}
