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
  safeSetLocalStorage,
} from '../utils/draftStorage.ts';
import { isImageAssetUrl, isVideoAssetUrl } from '../utils/responsiveMedia.ts';

export const CODEBASE_CONTENT_VERSION = '2026-11-13-v6-it-audit';
const DRAFT_STORAGE_KEY = 'sgs_site_content_draft_v5';
const AUTH_STORAGE_KEY = 'sgs_editor_authorized_v2';
const AUTH_TOKEN_STORAGE_KEY = 'sgs_cms_auth_token_v1';

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

export function sanitizeCaseStudies(studies: CaseStudy[]): CaseStudy[] {
  return studies.map((p) => {
    const validCover = isImageAssetUrl(p.coverImage)
      ? p.coverImage
      : isImageAssetUrl(p.posterUrl)
      ? p.posterUrl!
      : '/assets/work/nelson-trading.png';
    const validPoster = isImageAssetUrl(p.posterUrl) ? p.posterUrl : validCover;

    const sanitizedGallery = p.gallery?.map((g) => {
      const isVid = isVideoAssetUrl(g.url);
      const isImg = isImageAssetUrl(g.url);
      return {
        ...g,
        type: isImg ? ('image' as const) : isVid ? ('video' as const) : g.type,
        poster: isImageAssetUrl(g.poster) ? g.poster : validPoster,
      };
    });

    if (p.hasVideo) {
      const validVideoUrl = isVideoAssetUrl(p.videoUrl) ? p.videoUrl : '/assets/nira-loop.mp4';
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

function hydrateSiteData(raw: Partial<SiteData> | null | undefined): SiteData {
  const incoming = raw || {};
  return {
    ...DEFAULT_SITE_DATA,
    ...incoming,
    config: { ...DEFAULT_SITE_DATA.config, ...(incoming.config || {}) },
    hero: { ...DEFAULT_SITE_DATA.hero, ...(incoming.hero || {}) },
    whoWeAre: { ...DEFAULT_SITE_DATA.whoWeAre, ...(incoming.whoWeAre || {}) },
    industries: { ...DEFAULT_SITE_DATA.industries, ...(incoming.industries || {}) },
    expertise: { ...DEFAULT_SITE_DATA.expertise, ...(incoming.expertise || {}) },
    contact: { ...DEFAULT_SITE_DATA.contact, ...(incoming.contact || {}) },
    workCategories: incoming.workCategories || DEFAULT_SITE_DATA.workCategories,
    caseStudies: sanitizeCaseStudies(incoming.caseStudies || DEFAULT_SITE_DATA.caseStudies),
  };
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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

interface ContentContextType {
  siteData: SiteData;
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
  authorize: (passcode: string) => boolean;
  deauthorize: () => void;
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
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const hasParam =
      params.get('edit') === 'true' ||
      params.get('editor') === 'true' ||
      params.get('cms') === 'true' ||
      params.get('admin') === 'sgs';
    const hasStoredAuth = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    return hasParam || hasStoredAuth;
  });

  const [siteData, setSiteDataState] = useState<SiteData>(DEFAULT_SITE_DATA);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [undoStack, setUndoStack] = useState<SiteData[]>([]);
  const [redoStack, setRedoStack] = useState<SiteData[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('open') === 'true' || params.get('edit') === 'true';
  });
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(false);
  const [isClickToEditActive, setIsClickToEditActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('hero');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const latestSiteDataRef = useRef<SiteData>(siteData);
  latestSiteDataRef.current = siteData;

  const cmsAuthTokenRef = useRef<string>(
    typeof window !== 'undefined'
      ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || 'sgs2026'
      : 'sgs2026'
  );

  const lastLocalEditTimestampRef = useRef<number>(0);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createdBlobUrlsRef = useRef<Map<string, string>>(new Map());

  const cancelPendingAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  // Revoke any tracked blob object URLs & cancel pending timers on unmount
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
    return {
      'x-cms-auth': cmsAuthTokenRef.current || 'sgs2026',
    };
  }, []);

  const isDraft = useMemo(() => {
    try {
      return JSON.stringify(siteData) !== JSON.stringify(DEFAULT_SITE_DATA);
    } catch {
      return false;
    }
  }, [siteData]);

  // 1. Authoritative initial server hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    async function hydrateFromServer() {
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

      try {
        const idbDraft = await loadFromIndexedDB<SiteData>(DRAFT_STORAGE_KEY);
        if (idbDraft && idbDraft.caseStudies && isMounted) {
          setSiteDataState(hydrateSiteData(idbDraft));
        }
      } catch (e) {
        console.warn('Local draft load error:', e);
      }
    }

    hydrateFromServer();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time SSE cross-client updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
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
  }, []);

  // 3. Direct Server Save Routine
  const saveToServer = useCallback(
    async (overrideData?: SiteData): Promise<{ success: boolean; message: string }> => {
      const dataToSave = overrideData || latestSiteDataRef.current;
      setSaveStatus('saving');

      try {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCmsAuthHeaders(),
          },
          body: JSON.stringify({ content: dataToSave }),
        });

        if (res.ok) {
          setSaveStatus('saved');
          setLastSavedAt(new Date());
          safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(dataToSave));
          saveToIndexedDB(DRAFT_STORAGE_KEY, dataToSave);
          return { success: true, message: 'Saved to server (24/7 live)' };
        }
        setSaveStatus('error');
        return { success: false, message: 'Server responded with save error' };
      } catch (err: any) {
        setSaveStatus('error');
        return { success: false, message: err?.message || 'Network error saving to server' };
      }
    },
    [getCmsAuthHeaders]
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

  // 4. State mutation handler with History and Debounced Auto-Save
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
      }, 400);
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

  // Authorization helper
  const authorize = useCallback((passcode: string) => {
    const cleaned = passcode.trim();
    const valid = cleaned.toLowerCase() === 'sgs2026' || cleaned === 'sgs';
    if (valid) {
      cmsAuthTokenRef.current = cleaned.toLowerCase() === 'sgs2026' ? 'sgs2026' : cleaned;
      setIsAuthorized(true);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, cmsAuthTokenRef.current);
      } catch {
        // ignore storage restrictions
      }
      return true;
    }
    return false;
  }, []);

  const deauthorize = useCallback(() => {
    setIsAuthorized(false);
    setIsEditorOpen(false);
    setIsClickToEditActive(false);
    setIsPasscodeModalOpen(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const openPasscodeModal = useCallback(() => {
    setIsPasscodeModalOpen(true);
  }, []);

  const closePasscodeModal = useCallback(() => {
    setIsPasscodeModalOpen(false);
  }, []);

  // Keyboard shortcut: Ctrl + Shift + E or Cmd + Shift + E (opens React modal instead of window.prompt)
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

  // Updaters read from latestSiteDataRef to avoid stale closures
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

    setUndoStack([]);
    setRedoStack([]);
    setSiteDataState(DEFAULT_SITE_DATA);
  }, [cancelPendingAutoSave]);

  const discardDraft = useCallback(() => {
    syncWithCodebase();
  }, [syncWithCodebase]);

  const exportTypeScriptCode = useCallback(() => {
    return generateSiteContentTs(latestSiteDataRef.current);
  }, []);

  const exportJsonCode = useCallback(() => {
    return JSON.stringify(latestSiteDataRef.current, null, 2);
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

  const publishToCodebase = useCallback(async () => {
    const current = latestSiteDataRef.current;
    const tsCode = generateSiteContentTs(current);
    try {
      await saveToServer(current);

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
        message: 'Authorization required or codebase write failed.',
      };
    } catch {
      return {
        success: false,
        message: 'Direct API writing not reachable in static mode.',
      };
    }
  }, [saveToServer, getCmsAuthHeaders]);

  const openEditor = useCallback((tab?: EditorTab, projectId?: string | null) => {
    setIsAuthorized(true);
    setIsEditorOpen(true);
    setIsPasscodeModalOpen(false);
    if (tab) setActiveTab(tab);
    if (projectId !== undefined) setEditingProjectId(projectId);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const toggleEditor = useCallback(() => {
    setIsEditorOpen((prev) => !prev);
  }, []);

  const toggleClickToEdit = useCallback(() => {
    setIsClickToEditActive((prev) => !prev);
  }, []);

  const saveProjectVideoBlob = useCallback(
    async (projectId: string, blob: Blob): Promise<string> => {
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
      updateSingleCaseStudy(projectId, {
        videoUrl: liveUrl,
        hasVideo: true,
      });
      return liveUrl;
    },
    [updateSingleCaseStudy]
  );

  return (
    <ContentContext.Provider
      value={{
        siteData,
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
        authorize,
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
