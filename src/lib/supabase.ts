/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Supabase Client Configuration for SGS AI Group CMS
 * Uses Vite public browser environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).
 * Security is enforced server-side in Supabase via Row-Level Security (RLS).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_SITE_ROW_ID = 'live';
export const SUPABASE_MEDIA_BUCKET = 'cms-media';

const rawUrl = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const rawAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    rawUrl &&
      rawAnonKey &&
      /^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)/i.test(rawUrl)
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}
