/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Unified Persistent Media Upload Service
 * Routes uploads to Supabase Storage (Cloudflare Pages compatible) when configured,
 * with local Express (/api/upload-media) fallback during local Node development.
 */

import {
  getSupabaseClient,
  isSupabaseConfigured,
  SUPABASE_MEDIA_BUCKET,
} from './supabase.ts';

export interface MediaUploadResult {
  url: string;
  provider: 'supabase' | 'server';
  sizeBytes: number;
  storagePath: string;
}

const ALLOWED_EXTENSIONS = new Set([
  '.mp4',
  '.webm',
  '.mov',
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
]);

function sanitizeFileName(rawName: string, fallbackExt = '.webp'): string {
  const base = rawName.split(/[\\/]/).pop() || `media-${Date.now()}${fallbackExt}`;
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  const dotIdx = cleaned.lastIndexOf('.');
  const ext = dotIdx >= 0 ? cleaned.slice(dotIdx).toLowerCase() : '';
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return cleaned;
  }
  return `${cleaned.replace(/\.+$/, '')}${fallbackExt}`;
}

function guessContentType(fileName: string, explicitType?: string): string {
  if (explicitType && explicitType !== 'application/octet-stream') {
    return explicitType;
  }
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const header = parts[0] || '';
  const base64 = parts[1] || '';
  const mimeMatch = /data:([^;]+);base64/i.exec(header);
  const mime = mimeMatch ? mimeMatch[1] : 'image/webp';

  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * Uploads a binary File or Blob permanently to Supabase Storage (or local Express fallback).
 */
export async function uploadCmsMediaFile(
  file: Blob,
  options: {
    fileName: string;
    folder?: 'images' | 'videos' | 'posters';
    contentType?: string;
    authHeaders?: Record<string, string>;
  }
): Promise<MediaUploadResult> {
  const folder = options.folder || 'images';
  const defaultExt = folder === 'videos' ? '.mp4' : '.webp';
  const safeName = sanitizeFileName(options.fileName, defaultExt);
  const uniqueName = `${Date.now()}-${safeName}`;
  const contentType = guessContentType(safeName, options.contentType || file.type);

  // 1. Primary Cloud Path: Supabase Storage CDN
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not initialized.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Please sign in to the CMS with your Supabase Admin account before uploading media.');
    }

    const storagePath = `${folder}/${uniqueName}`;
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .upload(storagePath, file, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from(SUPABASE_MEDIA_BUCKET)
      .getPublicUrl(storagePath);

    if (!publicData?.publicUrl) {
      throw new Error('Supabase upload succeeded, but failed to resolve public CDN URL.');
    }

    return {
      url: publicData.publicUrl,
      provider: 'supabase',
      sizeBytes: file.size,
      storagePath,
    };
  }

  // 2. Local Express Server Fallback (/api/upload-media)
  const controller = new AbortController();
  const timeoutMs = folder === 'videos' ? 120000 : 25000;
  const abortTimer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      headers: {
        'x-file-name': uniqueName,
        'content-type': contentType,
        ...(options.authHeaders || {}),
      },
      body: file,
      signal: controller.signal,
    });
    clearTimeout(abortTimer);

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(
        errJson?.error ||
          (res.status === 404
            ? 'Static hosting detected. Connect Supabase in Settings to persist uploaded media.'
            : `Upload failed (HTTP ${res.status}).`)
      );
    }

    const json = await res.json();
    if (!json?.url) {
      throw new Error('Server upload returned no asset URL.');
    }

    return {
      url: json.url,
      provider: 'server',
      sizeBytes: file.size,
      storagePath: json.url,
    };
  } catch (err: any) {
    clearTimeout(abortTimer);
    if (err?.name === 'AbortError') {
      throw new Error('Upload timed out. Please try a smaller compressed file or verify network connection.');
    }
    throw err;
  }
}

/**
 * Convenience helper for uploading canvas WebP/JPEG data URLs (e.g. compressed images or video frame grabs).
 */
export async function uploadDataUrlAsset(
  dataUrl: string,
  options: {
    fileName: string;
    folder?: 'images' | 'posters';
    authHeaders?: Record<string, string>;
  }
): Promise<MediaUploadResult> {
  const blob = dataUrlToBlob(dataUrl);
  return uploadCmsMediaFile(blob, {
    fileName: options.fileName,
    folder: options.folder || 'images',
    contentType: blob.type || 'image/webp',
    authHeaders: options.authHeaders,
  });
}
