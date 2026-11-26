import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  SITE_CONFIG,
  NAV_LINKS,
  HERO_CONTENT,
  WHO_WE_ARE_CONTENT,
  INDUSTRIES_CONTENT,
  EXPERTISE_CONTENT,
  WORK_CATEGORIES,
  CASE_STUDIES,
  CONTACT_CONTENT,
  SiteConfig,
  HeroContent,
  WhoWeAreContent,
  IndustriesContent,
  ExpertiseContent,
  WorkCategory,
  CaseStudy,
  ContactContent,
} from '../data/siteContent.ts';
import { SiteData, generateSiteContentTs } from '../data/contentSerializer.ts';
import {
  saveToIndexedDB,
  loadFromIndexedDB,
  removeFromIndexedDB,
  saveVideoBlob,
  loadVideoBlob,
  safeSetLocalStorage,
} from '../utils/draftStorage.ts';
import { isImageAssetUrl, isVideoAssetUrl } from '../utils/responsiveMedia.ts';
import {
  getSupabaseClient,
  hydrateSupabaseFromRuntimeConfig,
  isSupabaseConfigured,
  SUPABASE_SITE_ROW_ID,
} from '../lib/supabase.ts';

export const CODEBASE_CONTENT_VERSION = '2026-11-26-v7-supabase';
const DRAFT_STORAGE_KEY = 'sgs_site_content_draft_v5';

export const DEFAULT_SITE_DATA: SiteData = {
  config: SITE_CONFIG,
  navLinks: NAV_LINKS,
  hero: HERO_CONTENT,
  whoWeAre: WHO_WE_ARE_CONTENT,
  industries: INDUSTRIES_CONTENT,
  expertise: EXPERTISE_CONTENT,
  workCategories: WORK_CATEGORIES,
  caseStudies: CASE_STUDIES,
  contact: CONTACT_CONTENT,
};

function isEphemeralBlobUrl(url?: string): boolean {
  return typeof url === 'string' && url.startsWith('blob:');
}

export function sanitizeCaseStudies(
  studies: CaseStudy[],
  activeBlobUrls?: Set<string>
): CaseStudy[] {
  return studies.map((p) => {
    const validCover = isImageAssetUrl(p.coverImage)
      ? p.coverImage
      : isImageAssetUrl(p.posterUrl)
      ? p.posterUrl!
      : '/assets/work/nelson-trading.png';
    const validPoster: string =
      isImageAssetUrl(p.posterUrl) && p.posterUrl ? p.posterUrl : validCover;

    const sanitizedGallery = p.gallery?.map((g) => {
      const urlIsLiveBlob = isEphemeralBlobUrl(g.url) && activeBlobUrls?.has(g.url);
      const isVid = isVideoAssetUrl(g.url) && (!isEphemeralBlobUrl(g.url) || urlIsLiveBlob);
      const isImg = isImageAssetUrl(g.url);
      return {
        ...g,
        url: isEphemeralBlobUrl(g.url) && !urlIsLiveBlob ? validPoster : g.url,
        type: isImg ? ('image' as const) : isVid ? ('video' as const) : g.type,
        poster: isImageAssetUrl(g.poster) ? g.poster : validPoster,
      };
    });

    if (p.hasVideo) {
      const videoIsLiveBlob = isEphemeralBlobUrl(p.videoUrl) && activeBlobUrls?.has(p.videoUrl || '');
      const validVideoUrl =
        isVideoAssetUrl(p.videoUrl) && (!isEphemeralBlobUrl(p.videoUrl) || videoIsLiveBlob)
          ? p.videoUrl
          : '/assets/nira-loop.mp4';
      return {
        ...p,
        videoUrl: validVideoUrl,
        coverImage: validCover,
        posterUrl: validPoster,
        gallery: sanitizedGallery,
      };
    }

    return {
      ...p,
      coverImage: validCover,
      posterUrl: validPoster,
      gallery: sanitizedGallery,
    };
  });
}

function hydrateSiteData(
  raw: Partial<SiteData> | null | undefined,
  activeBlobUrls?: Set<string>
): SiteData {
  const incoming = raw || {};
  const rawHero = { ...DEFAULT_SITE_DATA.hero, ...(incoming.hero || {}) };
  if (isEphemeralBlobUrl(rawHero.backgroundVideo) && !activeBlobUrls?.has(rawHero.backgroundVideo || '')) {
    rawHero.backgroundVideo = DEFAULT_SITE_DATA.hero.backgroundVideo;
  }

  return {
    ...DEFAULT_SITE_DATA,
    ...incoming,
    config: { ...DEFAULT_SITE_DATA.config, ...(incoming.config || {}) },
    hero: rawHero,
    whoWeAre: { ...DEFAULT_SITE_DATA.whoWeAre, ...(incoming.whoWeAre || {}) },
    industries: { ...DEFAULT_SITE_DATA.industries, ...(incoming.industries || {}) },
    expertise: { ...DEFAULT_SITE_DATA.expertise, ...(incoming.expertise || {}) },
    contact: { ...DEFAULT_SITE_DATA.contact, ...(incoming.contact || {}) },
    workCategories: incoming.workCategories || DEFAULT_SITE_DATA.workCategories,
    caseStudies: sanitizeCaseStudies(
      incoming.caseStudies || DEFAULT_SITE_DATA.caseStudies,
      activeBlobUrls
    ),
  };
}

/**
 * Strips any ephemeral browser-local blob: URLs before persisting to cloud or server storage.
 */
function sanitizeForRemotePersistence(data: SiteData): SiteData {
  return hydrateSiteData(data, new Set<string>());
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type StorageBackend = 'supabase' | 'server';
export type ServerAuthMode = 'env' | 'claimed' | 'setup_required' | 'unknown';

export type EditorTab =
  | 'hero'
  | 'whoweare'
  | 'industries'
  | 'expertise'
  | 'work'
  | 'contact'
  | 'config'
  | 'media'
  | 'export';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface ContentContextType {
  siteData: SiteData;
  storageBackend: StorageBackend;
  serverAuthMode: ServerAuthMode;
  adminEmail: string | null;
  isAuthorized: boolean;
  isEditorOpen: boolean;
  isPasscodeModalOpen: boolean;
  isClickToEditActive: boolean;
  activeTab: EditorTab;
  previewDevice: PreviewDevice;
  editingProjectId: string | null;
  isDraft: boolean;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  saveErrorMessage: string | null;
  lastSavedAt: Date | null;
  // Controls
  openEditor: (tab?: EditorTab, projectId?: string | null) => void;
  closeEditor: () => void;
  toggleEditor: () => void;
  openPasscodeModal: () => void;
  closePasscodeModal: () => void;
  toggleClickToEdit: () => void;
  setActiveTab: (tab: EditorTab) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setEditingProjectId: (id: string | null) => void;
  signInWithSupabase: (email: string, password: string) => Promise<AuthResult>;
  authorizePasscode: (passcode: string) => Promise<AuthResult>;
  setupAdminPasscode: (passcode: string) => Promise<AuthResult>;
  deauthorize: () => Promise<void>;
  getCmsAuthHeaders: () => Record<string, string>;
  // Updaters
  updateConfig: (patch: Partial<SiteConfig>) => void;
  updateHero: (patch: Partial<HeroContent>) => void;
  updateWhoWeAre: (patch: Partial<WhoWeAreContent>) => void;
  updateIndustries: (patch: Partial<IndustriesContent>) => void;
  updateExpertise: (patch: Partial<ExpertiseContent>) => void;
  updateWorkCategories: (categories: WorkCategory[]) => void;
  updateCaseStudies: (studies: CaseStudy[]) => void;
  updateSingleCaseStudy: (id: string, patch: Partial<CaseStudy>) => void;
  addCaseStudy: (study: CaseStudy) => void;
  deleteCaseStudy: (id: string) => void;
  duplicateCaseStudy: (id: string) => void;
  updateContact: (patch: Partial<ContactContent>) => void;
  // History & Storage
  undo: () => void;
  redo: () => void;
  saveDraft: () => void;
  saveToServer: () => Promise<{ success: boolean; message: string }>;
  resetToDefaults: () => void;
  discardDraft: () => void;
  exportTypeScriptCode: () => string;
  exportJsonCode: () => string;
  importJsonCode: (jsonStr: string) => { success: boolean; error?: string };
  publishToCodebase: () => Promise<{ success: boolean; message: string; bytes?: number }>;
  saveProjectVideoBlob: (projectId: string, blob: Blob) => Promise<string>;
  syncWithCodebase: () => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageBackend, setStorageBackend] = useState<StorageBackend>(() =>
    isSupabaseConfigured() ? 'supabase' : 'server'
  );

  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [serverAuthMode, setServerAuthMode] = useState<ServerAuthMode>('unknown');

  const [siteData, setSiteDataState] = useState<SiteData>(DEFAULT_SITE_DATA);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [undoStack, setUndoStack] = useState<SiteData[]>([]);
  const [redoStack, setRedoStack] = useState<SiteData[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('edit') === 'true' ||
      params.get('editor') === 'true' ||
      params.get('cms') === 'true'
    );
  });
  const [isClickToEditActive, setIsClickToEditActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('hero');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const latestSiteDataRef = useRef<SiteData>(siteData);
  latestSiteDataRef.current = siteData;

  // Held strictly in JS memory — never persisted to localStorage
  const cmsSessionTokenRef = useRef<string | null>(null);
  const lastLocalEditTimestampRef = useRef<number>(0);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createdBlobUrlsRef = useRef<Map<string, string>>(new Map());

  const getActiveBlobUrlSet = useCallback(() => {
    return new Set<string>(createdBlobUrlsRef.current.values());
  }, []);

  const cancelPendingAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelPendingAutoSave();
      for (const blobUrl of createdBlobUrlsRef.current.values()) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
      }
      createdBlobUrlsRef.current.clear();
    };
  }, [cancelPendingAutoSave]);

  const getCmsAuthHeaders = useCallback((): Record<string, string> => {
    if (!cmsSessionTokenRef.current) return {};
    return {
      Authorization: `Bearer ${cmsSessionTokenRef.current}`,
    };
  }, []);

  const isDraft = useMemo(() => {
    try {
      return JSON.stringify(siteData) !== JSON.stringify(DEFAULT_SITE_DATA);
    } catch {
      return false;
    }
  }, [siteData]);

  // Verify whether current Supabase user is in public.cms_admins
  const verifySupabaseAdminUser = useCallback(
    async (email?: string | null): Promise<{ authorized: boolean; error?: string }> => {
      const supabase = getSupabaseClient();
      if (!supabase || !email) {
        return { authorized: false, error: 'Missing Supabase session or email.' };
      }

      try {
        // Primary check: SECURITY DEFINER function is_cms_admin() (works reliably even if table-level SELECT grant on cms_admins is restricted)
        const { data: rpcIsAdmin, error: rpcError } = await supabase.rpc('is_cms_admin');
        if (!rpcError && typeof rpcIsAdmin === 'boolean') {
          if (rpcIsAdmin) {
            return { authorized: true };
          }
          return {
            authorized: false,
            error: `Account (${email}) is signed in, but is not listed in public.cms_admins.`,
          };
        }

        // Fallback check: direct allowlist query
        const { data, error } = await supabase
          .from('cms_admins')
          .select('email')
          .ilike('email', email.trim())
          .maybeSingle();

        if (error) {
          console.warn('Supabase cms_admins verification error:', error.message);
          if (error.code === '42501') {
            return {
              authorized: false,
              error:
                'Database permission error (42501): please re-run the updated supabase/schema.sql in Supabase SQL Editor to apply GRANT statements.',
            };
          }
          return { authorized: false, error: error.message };
        }

        if (data?.email) {
          return { authorized: true };
        }
        return {
          authorized: false,
          error: `Account (${email}) is signed in, but is not listed in public.cms_admins.`,
        };
      } catch (err: any) {
        return {
          authorized: false,
          error: err?.message || 'Unable to verify administrator privileges.',
        };
      }
    },
    []
  );

  const refreshRuntimeConfigAndAuth = useCallback(async () => {
    const hasSupabase = await hydrateSupabaseFromRuntimeConfig();
    if (hasSupabase) {
      setStorageBackend('supabase');
      return;
    }

    try {
      const res = await fetch('/api/auth/status', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.mode === 'env' || json?.mode === 'claimed' || json?.mode === 'setup_required') {
        setServerAuthMode(json.mode);
      }
    } catch {
      setServerAuthMode('unknown');
    }
  }, []);

  // Hydrate runtime Supabase config on mount (for AI Studio Secrets)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    void refreshRuntimeConfigAndAuth();
  }, [refreshRuntimeConfigAndAuth]);

  // Re-check auth mode & config whenever the sign-in modal opens
  useEffect(() => {
    if (typeof window === 'undefined' || !isPasscodeModalOpen) return;
    void refreshRuntimeConfigAndAuth();
  }, [isPasscodeModalOpen, refreshRuntimeConfigAndAuth]);

  // Auth initialization (Supabase Auth listener or Local Server /api/auth/status)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    if (storageBackend === 'supabase') {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const syncSession = async (session: any) => {
        if (!isMounted) return;
        const email = session?.user?.email || null;
        if (session && email) {
          const check = await verifySupabaseAdminUser(email);
          if (!isMounted) return;
          if (check.authorized) {
            setIsAuthorized(true);
            setAdminEmail(email);
          } else {
            setIsAuthorized(false);
            setAdminEmail(null);
          }
        } else {
          setIsAuthorized(false);
          setAdminEmail(null);
        }
      };

      supabase.auth.getSession().then(({ data }) => {
        syncSession(data.session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        syncSession(session);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [storageBackend, verifySupabaseAdminUser]);

  // Recover any offline IndexedDB video blobs for local unsaved drafts
  const rehydrateOfflineVideoBlobs = useCallback(async (candidate: SiteData): Promise<SiteData> => {
    let changed = false;
    const updatedStudies = await Promise.all(
      candidate.caseStudies.map(async (proj) => {
        if (proj.hasVideo && isEphemeralBlobUrl(proj.videoUrl)) {
          const blob = await loadVideoBlob(`video_blob_${proj.id}`);
          if (blob) {
            const freshUrl = URL.createObjectURL(blob);
            createdBlobUrlsRef.current.set(proj.id, freshUrl);
            changed = true;
            return { ...proj, videoUrl: freshUrl };
          }
        }
        return proj;
      })
    );
    if (!changed) return candidate;
    return { ...candidate, caseStudies: updatedStudies };
  }, []);

  // 1. Authoritative Initial Hydration (Supabase Postgres -> Local Express -> IndexedDB fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    async function hydrateInitialContent() {
      // Path A: Supabase Postgres (Production Cloudflare Pages & multi-device)
      if (storageBackend === 'supabase') {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data: row, error } = await supabase
              .from('site_content')
              .select('data, updated_at')
              .eq('id', SUPABASE_SITE_ROW_ID)
              .maybeSingle();

            if (error) {
              console.warn('Supabase site_content hydration warning:', error.code, error.message);
              if (error.code === '42501' && isMounted) {
                setSaveErrorMessage(
                  'Supabase table permissions missing (42501). Run updated supabase/schema.sql in Supabase SQL Editor.'
                );
              }
            } else if (row?.data && isMounted) {
              const hydrated = hydrateSiteData(row.data as Partial<SiteData>);
              setSiteDataState(hydrated);
              setSaveStatus('saved');
              setLastSavedAt(row.updated_at ? new Date(row.updated_at) : new Date());
              safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(hydrated));
              saveToIndexedDB(DRAFT_STORAGE_KEY, hydrated);
              return;
            }
          } catch (err) {
            console.warn('Supabase content hydration unavailable, checking local cache:', err);
          }
        }
      } else {
        // Path B: Local Express Server
        try {
          const res = await fetch('/api/content');
          if (res.ok) {
            const json = await res.json();
            if (json && json.data && isMounted) {
              const hydrated = hydrateSiteData(json.data);
              setSiteDataState(hydrated);
              setSaveStatus('saved');
              setLastSavedAt(new Date());
              safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(hydrated));
              saveToIndexedDB(DRAFT_STORAGE_KEY, hydrated);
              return;
            }
          }
        } catch (err) {
          console.warn('Initial server fetch not available, checking local cache:', err);
        }
      }

      // Path C: Offline IndexedDB draft recovery (with binary video blob rehydration)
      try {
        const idbDraft = await loadFromIndexedDB<SiteData>(DRAFT_STORAGE_KEY);
        if (idbDraft && idbDraft.caseStudies && isMounted) {
          const recovered = await rehydrateOfflineVideoBlobs(idbDraft);
          if (isMounted) {
            setSiteDataState(hydrateSiteData(recovered, getActiveBlobUrlSet()));
          }
        }
      } catch (e) {
        console.warn('Local draft load error:', e);
      }
    }

    hydrateInitialContent();

    return () => {
      isMounted = false;
    };
  }, [storageBackend, rehydrateOfflineVideoBlobs, getActiveBlobUrlSet]);

  // 2. Real-Time Cross-Device Sync (Supabase Realtime or Local Server SSE)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (storageBackend === 'supabase') {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const channel = supabase
        .channel('sgs-site-content-live')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_content',
            filter: `id=eq.${SUPABASE_SITE_ROW_ID}`,
          },
          (payload) => {
            const nextRow = payload.new as { data?: Partial<SiteData>; updated_at?: string } | null;
            if (!nextRow?.data) return;
            const incomingTs = nextRow.updated_at ? Date.parse(nextRow.updated_at) : Date.now();
            if (incomingTs > lastLocalEditTimestampRef.current + 1500) {
              const synced = hydrateSiteData(nextRow.data);
              setSiteDataState(synced);
              setSaveStatus('saved');
              setLastSavedAt(new Date(incomingTs));
              safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(synced));
              saveToIndexedDB(DRAFT_STORAGE_KEY, synced);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Local Express SSE stream
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('/api/content/stream');
      evtSource.onmessage = (event) => {
        try {
          if (!event.data || typeof event.data !== 'string') return;
          const trimmed = event.data.trim();
          if (!trimmed.startsWith('{')) return;
          const parsed = JSON.parse(trimmed);
          if ((parsed.type === 'init' || parsed.type === 'content_update') && parsed.data) {
            const incomingTimestamp = parsed.timestamp || 0;
            if (incomingTimestamp > lastLocalEditTimestampRef.current) {
              const synced = hydrateSiteData(parsed.data);
              setSiteDataState(synced);
              setSaveStatus('saved');
              setLastSavedAt(new Date(incomingTimestamp));
              safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(synced));
            }
          }
        } catch (e) {
          console.warn('SSE message parse error:', e);
        }
      };
    } catch (err) {
      console.warn('SSE connection unavailable:', err);
    }

    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, [storageBackend]);

  // 3. Authoritative Remote Persistence (Supabase Postgres or Local Express)
  const saveToServer = useCallback(
    async (overrideData?: SiteData): Promise<{ success: boolean; message: string }> => {
      const rawSnapshot = overrideData || latestSiteDataRef.current;
      const cleanSnapshot = sanitizeForRemotePersistence(rawSnapshot);
      setSaveStatus('saving');
      setSaveErrorMessage(null);

      // Path A: Supabase Postgres Persistence
      if (storageBackend === 'supabase') {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setSaveStatus('error');
          setSaveErrorMessage('Supabase client not configured.');
          return { success: false, message: 'Supabase client not configured.' };
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setSaveStatus('error');
          setSaveErrorMessage('Sign in as Supabase admin to save live.');
          return { success: false, message: 'Sign in required before saving live.' };
        }

        const nowIso = new Date().toISOString();
        const { error } = await supabase.from('site_content').upsert(
          {
            id: SUPABASE_SITE_ROW_ID,
            data: cleanSnapshot,
            updated_at: nowIso,
            updated_by: sessionData.session.user?.email || adminEmail || 'admin',
          },
          { onConflict: 'id' }
        );

        if (error) {
          const friendlyError =
            error.code === '42501'
              ? 'Database permission denied (42501). Run updated supabase/schema.sql in Supabase SQL Editor.'
              : error.message;
          setSaveStatus('error');
          setSaveErrorMessage(friendlyError);
          return { success: false, message: `Supabase save failed: ${friendlyError}` };
        }

        setSaveStatus('saved');
        setLastSavedAt(new Date(nowIso));
        safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(cleanSnapshot));
        saveToIndexedDB(DRAFT_STORAGE_KEY, cleanSnapshot);
        return { success: true, message: 'Saved live to Supabase Postgres' };
      }

      // Path B: Local Express Server
      try {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCmsAuthHeaders(),
          },
          body: JSON.stringify({ content: cleanSnapshot }),
        });

        if (res.ok) {
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(cleanSnapshot));
          saveToIndexedDB(DRAFT_STORAGE_KEY, cleanSnapshot);
          return { success: true, message: 'Saved to local Express server' };
        }

        const errData = await res.json().catch(() => null);
        const msg =
          errData?.error ||
          (res.status === 404
            ? 'Static host detected — connect Supabase to persist changes globally.'
            : `Save failed (HTTP ${res.status})`);
        setSaveStatus('error');
        setSaveErrorMessage(msg);
        return { success: false, message: msg };
      } catch (err: any) {
        const msg = err?.message || 'Network error saving content';
        setSaveStatus('error');
        setSaveErrorMessage(msg);
        return { success: false, message: msg };
      }
    },
    [storageBackend, adminEmail, getCmsAuthHeaders]
  );

  const persistSnapshot = useCallback(
    (snapshot: SiteData) => {
      cancelPendingAutoSave();
      lastLocalEditTimestampRef.current = Date.now();
      setSiteDataState(snapshot);
      saveToIndexedDB(DRAFT_STORAGE_KEY, snapshot);
      safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
      saveToServer(snapshot);
    },
    [cancelPendingAutoSave, saveToServer]
  );

  // 4. State mutation handler with Undo/Redo & Debounced Cloud Auto-Save
  const pushState = useCallback(
    (newState: SiteData) => {
      const previous = latestSiteDataRef.current;
      lastLocalEditTimestampRef.current = Date.now();
      setUndoStack((prev) => [...prev.slice(-25), previous]);
      setRedoStack([]);
      setSiteDataState(newState);
      setSaveStatus('saving');

      saveToIndexedDB(DRAFT_STORAGE_KEY, newState);
      safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(newState));

      cancelPendingAutoSave();
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveTimerRef.current = null;
        saveToServer(newState);
      }, 450);
    },
    [cancelPendingAutoSave, saveToServer]
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const current = latestSiteDataRef.current;
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, current]);
    persistSnapshot(previous);
  }, [undoStack, persistSnapshot]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const current = latestSiteDataRef.current;
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, current]);
    persistSnapshot(next);
  }, [redoStack, persistSnapshot]);

  // Supabase Email + Password Sign-In
  const signInWithSupabase = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Supabase environment variables are not configured yet.' };
      }

      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        return { success: false, error: 'Please enter both admin email and password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const signedEmail = data.user?.email || trimmedEmail;
      const check = await verifySupabaseAdminUser(signedEmail);
      if (!check.authorized) {
        await supabase.auth.signOut();
        return {
          success: false,
          error:
            check.error ||
            'Account signed in, but email is not listed in public.cms_admins (or supabase/schema.sql has not been executed yet).',
        };
      }

      setIsAuthorized(true);
      setAdminEmail(signedEmail);
      return { success: true };
    },
    [verifySupabaseAdminUser]
  );

  // Local Express Server Passcode Login
  const authorizePasscode = useCallback(async (passcode: string): Promise<AuthResult> => {
    const cleaned = passcode.trim();
    if (!cleaned) {
      return { success: false, error: 'Please enter your administrator passcode.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: cleaned }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token) {
        if (data?.mode === 'setup_required') {
          setServerAuthMode('setup_required');
        }
        return { success: false, error: data?.error || 'Invalid administrator passcode.' };
      }
      cmsSessionTokenRef.current = data.token;
      setIsAuthorized(true);
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Local server unreachable. Connect Supabase (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) for static hosting.',
      };
    }
  }, []);

  // Local Express Server First-Time Passcode Setup
  const setupAdminPasscode = useCallback(
    async (passcode: string): Promise<AuthResult> => {
      const cleaned = passcode.trim();
      if (cleaned.length < 6) {
        return { success: false, error: 'Passcode must be at least 6 characters.' };
      }

      try {
        const res = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode: cleaned }),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 409) {
          const nextMode: ServerAuthMode =
            data?.mode === 'env' || data?.mode === 'claimed' ? data.mode : 'claimed';
          setServerAuthMode(nextMode);
          // Automatically attempt login with the entered passcode
          return authorizePasscode(cleaned);
        }
        if (!res.ok || !data?.token) {
          return { success: false, error: data?.error || 'Failed to save admin passcode.' };
        }
        cmsSessionTokenRef.current = data.token;
        setServerAuthMode('claimed');
        setIsAuthorized(true);
        return { success: true };
      } catch {
        return {
          success: false,
          error: 'Local server is unavailable on static hosting. Configure Supabase environment variables to sign in.',
        };
      }
    },
    [authorizePasscode]
  );

  const deauthorize = useCallback(async () => {
    cmsSessionTokenRef.current = null;
    setIsAuthorized(false);
    setAdminEmail(null);
    setIsEditorOpen(false);
    setIsClickToEditActive(false);
    setIsPasscodeModalOpen(false);

    if (storageBackend === 'supabase') {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    }
  }, [storageBackend]);

  const openPasscodeModal = useCallback(() => {
    setIsPasscodeModalOpen(true);
  }, []);

  const closePasscodeModal = useCallback(() => {
    setIsPasscodeModalOpen(false);
  }, []);

  // Keyboard shortcut: Ctrl + Shift + E or Cmd + Shift + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        if (!isAuthorized) {
          setIsPasscodeModalOpen(true);
        } else {
          setIsEditorOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorized]);

  const updateConfig = useCallback(
    (patch: Partial<SiteConfig>) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, config: { ...curr.config, ...patch } });
    },
    [pushState]
  );

  const updateHero = useCallback(
    (patch: Partial<HeroContent>) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, hero: { ...curr.hero, ...patch } });
    },
    [pushState]
  );

  const updateWhoWeAre = useCallback(
    (patch: Partial<WhoWeAreContent>) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, whoWeAre: { ...curr.whoWeAre, ...patch } });
    },
    [pushState]
  );

  const updateIndustries = useCallback(
    (patch: Partial<IndustriesContent>) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, industries: { ...curr.industries, ...patch } });
    },
    [pushState]
  );

  const updateExpertise = useCallback(
    (patch: Partial<ExpertiseContent>) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, expertise: { ...curr.expertise, ...patch } });
    },
    [pushState]
  );

  const updateWorkCategories = useCallback(
    (categories: WorkCategory[]) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, workCategories: categories });
    },
    [pushState]
  );

  const updateCaseStudies = useCallback(
    (studies: CaseStudy[]) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, caseStudies: studies });
    },
    [pushState]
  );

  const updateSingleCaseStudy = useCallback(
    (id: string, patch: Partial<CaseStudy>) => {
      const curr = latestSiteDataRef.current;
      const updated = curr.caseStudies.map((cs) => (cs.id === id ? { ...cs, ...patch } : cs));
      pushState({ ...curr, caseStudies: updated });
    },
    [pushState]
  );

  const addCaseStudy = useCallback(
    (study: CaseStudy) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, caseStudies: [study, ...curr.caseStudies] });
    },
    [pushState]
  );

  const deleteCaseStudy = useCallback(
    (id: string) => {
      const curr = latestSiteDataRef.current;
      const updated = curr.caseStudies.filter((cs) => cs.id !== id);
      pushState({ ...curr, caseStudies: updated });
    },
    [pushState]
  );

  const duplicateCaseStudy = useCallback(
    (id: string) => {
      const curr = latestSiteDataRef.current;
      const target = curr.caseStudies.find((cs) => cs.id === id);
      if (!target) return;
      const clone: CaseStudy = {
        ...target,
        id: `${target.id}-copy-${Date.now().toString().slice(-4)}`,
        title: `${target.title} (Copy)`,
      };
      pushState({ ...curr, caseStudies: [...curr.caseStudies, clone] });
    },
    [pushState]
  );

  const updateContact = useCallback(
    (patch: Partial<ContactContent>) => {
      const curr = latestSiteDataRef.current;
      pushState({ ...curr, contact: { ...curr.contact, ...patch } });
    },
    [pushState]
  );

  const saveDraft = useCallback(() => {
    cancelPendingAutoSave();
    saveToServer(latestSiteDataRef.current);
  }, [cancelPendingAutoSave, saveToServer]);

  const resetToDefaults = useCallback(() => {
    removeFromIndexedDB(DRAFT_STORAGE_KEY);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUndoStack((prev) => [...prev, latestSiteDataRef.current]);
    setRedoStack([]);
    persistSnapshot(DEFAULT_SITE_DATA);
  }, [persistSnapshot]);

  const syncWithCodebase = useCallback(async () => {
    cancelPendingAutoSave();

    if (storageBackend === 'supabase') {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: row, error } = await supabase
            .from('site_content')
            .select('data')
            .eq('id', SUPABASE_SITE_ROW_ID)
            .maybeSingle();
          if (!error && row?.data) {
            const fresh = hydrateSiteData(row.data as Partial<SiteData>);
            setUndoStack([]);
            setRedoStack([]);
            setSiteDataState(fresh);
            setSaveStatus('saved');
            return;
          }
        } catch {
          // fallback below
        }
      }
    } else {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            const fresh = hydrateSiteData(json.data);
            setUndoStack([]);
            setRedoStack([]);
            setSiteDataState(fresh);
            setSaveStatus('saved');
            return;
          }
        }
      } catch {
        // fallback below
      }
    }

    setUndoStack([]);
    setRedoStack([]);
    setSiteDataState(DEFAULT_SITE_DATA);
  }, [cancelPendingAutoSave, storageBackend]);

  const discardDraft = useCallback(() => {
    syncWithCodebase();
  }, [syncWithCodebase]);

  const exportTypeScriptCode = useCallback(() => {
    return generateSiteContentTs(sanitizeForRemotePersistence(latestSiteDataRef.current));
  }, []);

  const exportJsonCode = useCallback(() => {
    return JSON.stringify(sanitizeForRemotePersistence(latestSiteDataRef.current), null, 2);
  }, []);

  const importJsonCode = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed.hero || !parsed.whoWeAre || !parsed.caseStudies) {
          return { success: false, error: 'Invalid configuration format' };
        }
        pushState(hydrateSiteData(parsed));
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'JSON parsing failed' };
      }
    },
    [pushState]
  );

  // Publish Live: Supabase Postgres + immutable snapshot in site_content_versions (or local server codebase write)
  const publishToCodebase = useCallback(async () => {
    const cleanSnapshot = sanitizeForRemotePersistence(latestSiteDataRef.current);
    const saveResult = await saveToServer(cleanSnapshot);

    if (storageBackend === 'supabase') {
      if (!saveResult.success) {
        return saveResult;
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        const { error: versionError } = await supabase.from('site_content_versions').insert({
          content_id: SUPABASE_SITE_ROW_ID,
          data: cleanSnapshot,
          created_by: sessionData.session?.user?.email || adminEmail || 'admin',
        });
        if (versionError) {
          console.warn('Supabase version snapshot warning:', versionError.message);
        }
      }

      return {
        success: true,
        message: 'Published Live to Supabase across all devices & deployments',
      };
    }

    const tsCode = generateSiteContentTs(cleanSnapshot);
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCmsAuthHeaders(),
        },
        body: JSON.stringify({ tsContent: tsCode }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message || 'Published 24/7 Live to Server & Codebase',
          bytes: data.bytes,
        };
      }
      return {
        success: false,
        message: saveResult.message || 'Authorization required or codebase write failed.',
      };
    } catch {
      return {
        success: false,
        message: 'Connect Supabase environment variables to publish live on static hosting.',
      };
    }
  }, [storageBackend, adminEmail, saveToServer, getCmsAuthHeaders]);

  const openEditor = useCallback(
    (tab?: EditorTab, projectId?: string | null) => {
      if (!isAuthorized) {
        setIsPasscodeModalOpen(true);
        return;
      }
      setIsEditorOpen(true);
      setIsPasscodeModalOpen(false);
      if (tab) setActiveTab(tab);
      if (projectId !== undefined) setEditingProjectId(projectId);
    },
    [isAuthorized]
  );

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const toggleEditor = useCallback(() => {
    if (!isAuthorized) {
      setIsPasscodeModalOpen(true);
      return;
    }
    setIsEditorOpen((prev) => !prev);
  }, [isAuthorized]);

  const toggleClickToEdit = useCallback(() => {
    setIsClickToEditActive((prev) => !prev);
  }, []);

  // Offline IndexedDB blob backup only (returns preview ObjectURL; never writes over cloud URLs)
  const saveProjectVideoBlob = useCallback(async (projectId: string, blob: Blob): Promise<string> => {
    await saveVideoBlob(`video_blob_${projectId}`, blob);
    const existingUrl = createdBlobUrlsRef.current.get(projectId);
    if (existingUrl) {
      try {
        URL.revokeObjectURL(existingUrl);
      } catch {
        // ignore
      }
    }
    const liveUrl = URL.createObjectURL(blob);
    createdBlobUrlsRef.current.set(projectId, liveUrl);
    return liveUrl;
  }, []);

  return (
    <ContentContext.Provider
      value={{
        siteData,
        storageBackend,
        serverAuthMode,
        adminEmail,
        isAuthorized,
        isEditorOpen,
        isPasscodeModalOpen,
        isClickToEditActive,
        activeTab,
        previewDevice,
        editingProjectId,
        isDraft,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        saveStatus,
        saveErrorMessage,
        lastSavedAt,
        openEditor,
        closeEditor,
        toggleEditor,
        openPasscodeModal,
        closePasscodeModal,
        toggleClickToEdit,
        setActiveTab,
        setPreviewDevice,
        setEditingProjectId,
        signInWithSupabase,
        authorizePasscode,
        setupAdminPasscode,
        deauthorize,
        getCmsAuthHeaders,
        updateConfig,
        updateHero,
        updateWhoWeAre,
        updateIndustries,
        updateExpertise,
        updateWorkCategories,
        updateCaseStudies,
        updateSingleCaseStudy,
        addCaseStudy,
        deleteCaseStudy,
        duplicateCaseStudy,
        updateContact,
        undo,
        redo,
        saveDraft,
        saveToServer: () => saveToServer(latestSiteDataRef.current),
        resetToDefaults,
        discardDraft,
        exportTypeScriptCode,
        exportJsonCode,
        importJsonCode,
        publishToCodebase,
        saveProjectVideoBlob,
        syncWithCodebase,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useSiteContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a ContentProvider');
  }
  return context;
};
