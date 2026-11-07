/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Media Compression & Optimization Utility for SGS AI Group CMS
 * Client-side Canvas WebP downsampling to prevent localStorage quota exhaustion.
 */

export interface CompressionResult {
  dataUrl: string;
  type: 'image' | 'video';
  width: number;
  height: number;
  originalSizeKb: number;
  compressedSizeKb: number;
  format: string;
}

/**
 * Auto-compresses an uploaded image using HTML5 Canvas to WebP (or JPEG fallback).
 * Scales images exceeding maxWidth/maxHeight proportionally, reducing 5-20MB photos to ~100-250KB.
 */
export async function processMediaUpload(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<CompressionResult> {
  const isVideo = file.type.startsWith('video/');
  const originalSizeKb = Math.round(file.size / 1024);

  // Video handling: Use native ObjectURL to prevent base64 decoder stalls and black screens
  if (isVideo) {
    if (file.size > 25 * 1024 * 1024) {
      throw new Error(
        `Video size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 25MB limit. Please upload an optimized vertical 9:16 MP4/WebM clip.`
      );
    }

    try {
      // Create native browser media stream URL
      const streamUrl = URL.createObjectURL(file);
      return {
        dataUrl: streamUrl,
        type: 'video',
        width: 1080,
        height: 1920,
        originalSizeKb,
        compressedSizeKb: originalSizeKb,
        format: file.type || 'video/mp4',
      };
    } catch {
      throw new Error('Failed to create media stream URL for uploaded video.');
    }
  }

  // Image handling with HTML5 Canvas auto-compression
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const timeout = setTimeout(() => {
      reader.abort();
      reject(new Error('Image reading timed out.'));
    }, 15000);

    reader.onload = (e) => {
      clearTimeout(timeout);
      const rawDataUrl = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Proportional downsampling if dimensions exceed max bounds
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw dataUrl if canvas context unavailable
            resolve({
              dataUrl: rawDataUrl,
              type: 'image',
              width,
              height,
              originalSizeKb,
              compressedSizeKb: originalSizeKb,
              format: file.type,
            });
            return;
          }

          // Render with high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP compression first, fallback to JPEG
          let compressedUrl = canvas.toDataURL('image/webp', quality);
          let format = 'image/webp';

          // If browser doesn't support WebP export (returns PNG), fallback to JPEG
          if (compressedUrl.startsWith('data:image/png') && file.type !== 'image/png') {
            compressedUrl = canvas.toDataURL('image/jpeg', quality);
            format = 'image/jpeg';
          }

          const compressedSizeKb = Math.round((compressedUrl.length * (3 / 4)) / 1024);

          resolve({
            dataUrl: compressedUrl,
            type: 'image',
            width,
            height,
            originalSizeKb,
            compressedSizeKb,
            format,
          });
        } catch (err: any) {
          reject(new Error(`Failed to compress image: ${err?.message || 'Canvas error'}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to parse uploaded image format.'));
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsDataURL(file);
  });
}
