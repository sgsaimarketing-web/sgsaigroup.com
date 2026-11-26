/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Supabase Client Configuration for SGS AI Group CMS
 * Supports both Vite build-time env vars (Cloudflare Pages: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
 * and runtime config hydration from /api/public-config (AI Studio Secrets).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_SITE_ROW_ID = 'live';
export const SUPABASE_MEDIA_BUCKET = 'cms-media';

export function normalizeSupabaseUrl(rawUrl?: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === 'https:' &&
      /^[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(parsed.hostname)
    ) {
      return parsed.origin;
    }
    if (parsed.protocol === 'https:' && parsed.hostname === 'supabase.com') {
      const match = parsed.pathname.match(/^\/dashboard\/project\/([a-z0-9-]+)/i);
      if (match?.[1]) {
        return `https://${match[1]}.supabase.co`;
      }
    }
  } catch {
    // ignore invalid URL
  }
  return '';
}

let runtimeUrl = normalizeSupabaseUrl(import.meta.env?.VITE_SUPABASE_URL as string | undefined);
let runtimeAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';
let cachedClient: SupabaseClient | null = null;
let runtimeFetchPromise: Promise<boolean> | null = null;

function isValidSupabaseConfig(url: string, key: string): boolean {
  return Boolean(normalizeSupabaseUrl(url) && key);
}

export function isSupabaseConfigured(): boolean {
  return isValidSupabaseConfig(runtimeUrl, runtimeAnonKey);
}

export async function hydrateSupabaseFromRuntimeConfig(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  if (runtimeFetchPromise) {
    return runtimeFetchPromise;
  }

  runtimeFetchPromise = (async () => {
    try {
      const res = await fetch('/api/public-config', { cache: 'no-store' });
      if (!res.ok) return false;
      const json = await res.json();
      const url = normalizeSupabaseUrl(typeof json?.supabaseUrl === 'string' ? json.supabaseUrl : '');
      const key = typeof json?.supabaseAnonKey === 'string' ? json.supabaseAnonKey.trim() : '';
      if (isValidSupabaseConfig(url, key)) {
        runtimeUrl = url;
        runtimeAnonKey = key;
        cachedClient = null;
        return true;
      }
    } catch {
      // Static host without /api/public-config
    }
    return false;
  })();

  return runtimeFetchPromise;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(runtimeUrl, runtimeAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}
