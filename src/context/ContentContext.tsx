import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  NavItem,
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
  deleteVideoBlob,
  safeSetLocalStorage,
} from '../utils/draftStorage.ts';

export const CODEBASE_CONTENT_VERSION = '2026-11-11-v5-biho-alzara-mykaapie';
const DRAFT_STORAGE_KEY = 'sgs_site_content_draft_v5';
const VERSION_STORAGE_KEY = 'sgs_content_version_stamp';
const AUTH_STORAGE_KEY = 'sgs_editor_authorized_v2';
const LEGACY_STORAGE_KEYS = [
  'sgs_site_content_draft_v1',
  'sgs_site_content_draft_v2',
  'sgs_site_content_draft_v3',
  'sgs_site_content_draft_v4',
];

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
    if (p.hasVideo) {
      const isVid = (u?: string) =>
        !!u && (u.endsWith('.mp4') || u.endsWith('.webm') || u.startsWith('blob:') || u.startsWith('data:video/') || u.startsWith('/assets/'));
      const isImg = (u?: string) =>
        !!u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.jpeg') || u.endsWith('.webp') || u.startsWith('data:image/') || u.startsWith('/assets/'));

      const validVideoUrl = isVid(p.videoUrl) ? p.videoUrl : '/assets/nira-loop.mp4';
      const validCover = isImg(p.coverImage) ? p.coverImage : (isImg(p.posterUrl) ? p.posterUrl! : '/assets/work/nelson-trading.png');
      const validPoster = isImg(p.posterUrl) ? p.posterUrl : validCover;

      return {
        ...p,
        videoUrl: validVideoUrl,
        coverImage: validCover,
        posterUrl: validPoster,
      };
    }
    return p;
  });
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
  toggleClickToEdit: () => void;
  setActiveTab: (tab: EditorTab) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setEditingProjectId: (id: string | null) => void;
  authorize: (passcode: string) => boolean;
  deauthorize: () => void;
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
  // Check authorization from URL query or localStorage
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

  // Base state starts with DEFAULT_SITE_DATA, then hydrates authoritatively from server
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
  const [isClickToEditActive, setIsClickToEditActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('hero');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Reference timestamp of latest local edit to avoid race conditions with SSE
  const lastLocalEditTimestampRef = React.useRef<number>(0);
  const isAutoSavingRef = React.useRef<boolean>(false);
  const autoSaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if current data has modifications compared to code defaults
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
            const serverData = json.data;
            const hydrated: SiteData = {
              ...DEFAULT_SITE_DATA,
              ...serverData,
              config: { ...DEFAULT_SITE_DATA.config, ...(serverData.config || {}) },
              hero: { ...DEFAULT_SITE_DATA.hero, ...(serverData.hero || {}) },
              whoWeAre: { ...DEFAULT_SITE_DATA.whoWeAre, ...(serverData.whoWeAre || {}) },
              industries: { ...DEFAULT_SITE_DATA.industries, ...(serverData.industries || {}) },
              expertise: { ...DEFAULT_SITE_DATA.expertise, ...(serverData.expertise || {}) },
              contact: { ...DEFAULT_SITE_DATA.contact, ...(serverData.contact || {}) },
              workCategories: serverData.workCategories || DEFAULT_SITE_DATA.workCategories,
              caseStudies: sanitizeCaseStudies(serverData.caseStudies || DEFAULT_SITE_DATA.caseStudies),
            };
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

      // Fallback: check IndexedDB or localStorage
      try {
        const idbDraft = await loadFromIndexedDB<SiteData>(DRAFT_STORAGE_KEY);
        if (idbDraft && idbDraft.caseStudies && isMounted) {
          setSiteDataState({
            ...DEFAULT_SITE_DATA,
            ...idbDraft,
            caseStudies: sanitizeCaseStudies(idbDraft.caseStudies),
          });
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

  // 2. Real-time SSE cross-client updates (24/7 server sync)
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
            // Only update if incoming broadcast is newer than our local edits
            if (incomingTimestamp > lastLocalEditTimestampRef.current) {
              const serverData = parsed.data;
              const synced: SiteData = {
                ...DEFAULT_SITE_DATA,
                ...serverData,
                config: { ...DEFAULT_SITE_DATA.config, ...(serverData.config || {}) },
                hero: { ...DEFAULT_SITE_DATA.hero, ...(serverData.hero || {}) },
                whoWeAre: { ...DEFAULT_SITE_DATA.whoWeAre, ...(serverData.whoWeAre || {}) },
                industries: { ...DEFAULT_SITE_DATA.industries, ...(serverData.industries || {}) },
                expertise: { ...DEFAULT_SITE_DATA.expertise, ...(serverData.expertise || {}) },
                contact: { ...DEFAULT_SITE_DATA.contact, ...(serverData.contact || {}) },
                workCategories: serverData.workCategories || DEFAULT_SITE_DATA.workCategories,
                caseStudies: sanitizeCaseStudies(serverData.caseStudies || DEFAULT_SITE_DATA.caseStudies),
              };
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
      const dataToSave = overrideData || siteData;
      setSaveStatus('saving');
      isAutoSavingRef.current = true;

      try {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cms-auth': 'sgs2026',
          },
          body: JSON.stringify({ content: dataToSave }),
        });

        if (res.ok) {
          setSaveStatus('saved');
          const now = new Date();
          setLastSavedAt(now);
          safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(dataToSave));
          saveToIndexedDB(DRAFT_STORAGE_KEY, dataToSave);
          return { success: true, message: 'Saved to server (24/7 live)' };
        } else {
          setSaveStatus('error');
          return { success: false, message: 'Server responded with save error' };
        }
      } catch (err: any) {
        setSaveStatus('error');
        return { success: false, message: err?.message || 'Network error saving to server' };
      } finally {
        isAutoSavingRef.current = false;
      }
    },
    [siteData]
  );

  // 4. State mutation handler with History and Debounced Auto-Save
  const pushState = useCallback(
    (newState: SiteData) => {
      lastLocalEditTimestampRef.current = Date.now();
      setUndoStack((prev) => [...prev.slice(-25), siteData]);
      setRedoStack([]);
      setSiteDataState(newState);
      setSaveStatus('saving');

      // Local offline backup
      saveToIndexedDB(DRAFT_STORAGE_KEY, newState);
      safeSetLocalStorage(DRAFT_STORAGE_KEY, JSON.stringify(newState));

      // Debounced 400ms auto-save to server backend
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        saveToServer(newState);
      }, 400);
    },
    [siteData, saveToServer]
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    lastLocalEditTimestampRef.current = Date.now();
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, siteData]);
    setSiteDataState(previous);
    saveToServer(previous);
  }, [undoStack, siteData, saveToServer]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    lastLocalEditTimestampRef.current = Date.now();
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, siteData]);
    setSiteDataState(next);
    saveToServer(next);
  }, [redoStack, siteData, saveToServer]);

  // Authorization helper
  const authorize = useCallback((passcode: string) => {
    const valid = passcode.trim().toLowerCase() === 'sgs2026' || passcode.trim() === 'sgs';
    if (valid) {
      setIsAuthorized(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const deauthorize = useCallback(() => {
    setIsAuthorized(false);
    setIsEditorOpen(false);
    setIsClickToEditActive(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  // Keyboard shortcut: Ctrl + Shift + E or Cmd + Shift + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        if (!isAuthorized) {
          const pass = window.prompt('SGS Studio CMS Access Code (default: sgs2026):');
          if (pass && authorize(pass)) {
            setIsEditorOpen(true);
          }
        } else {
          setIsEditorOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthorized, authorize]);

  // Updaters
  const updateConfig = useCallback(
    (patch: Partial<SiteConfig>) => {
      pushState({ ...siteData, config: { ...siteData.config, ...patch } });
    },
    [siteData, pushState]
  );

  const updateHero = useCallback(
    (patch: Partial<HeroContent>) => {
      pushState({ ...siteData, hero: { ...siteData.hero, ...patch } });
    },
    [siteData, pushState]
  );

  const updateWhoWeAre = useCallback(
    (patch: Partial<WhoWeAreContent>) => {
      pushState({ ...siteData, whoWeAre: { ...siteData.whoWeAre, ...patch } });
    },
    [siteData, pushState]
  );

  const updateIndustries = useCallback(
    (patch: Partial<IndustriesContent>) => {
      pushState({ ...siteData, industries: { ...siteData.industries, ...patch } });
    },
    [siteData, pushState]
  );

  const updateExpertise = useCallback(
    (patch: Partial<ExpertiseContent>) => {
      pushState({ ...siteData, expertise: { ...siteData.expertise, ...patch } });
    },
    [siteData, pushState]
  );

  const updateWorkCategories = useCallback(
    (categories: WorkCategory[]) => {
      pushState({ ...siteData, workCategories: categories });
    },
    [siteData, pushState]
  );

  const updateCaseStudies = useCallback(
    (studies: CaseStudy[]) => {
      pushState({ ...siteData, caseStudies: studies });
    },
    [siteData, pushState]
  );

  const updateSingleCaseStudy = useCallback(
    (id: string, patch: Partial<CaseStudy>) => {
      const updated = siteData.caseStudies.map((cs) => (cs.id === id ? { ...cs, ...patch } : cs));
      pushState({ ...siteData, caseStudies: updated });
    },
    [siteData, pushState]
  );

  const addCaseStudy = useCallback(
    (study: CaseStudy) => {
      pushState({ ...siteData, caseStudies: [study, ...siteData.caseStudies] });
    },
    [siteData, pushState]
  );

  const deleteCaseStudy = useCallback(
    (id: string) => {
      const updated = siteData.caseStudies.filter((cs) => cs.id !== id);
      pushState({ ...siteData, caseStudies: updated });
    },
    [siteData, pushState]
  );

  const duplicateCaseStudy = useCallback(
    (id: string) => {
      const target = siteData.caseStudies.find((cs) => cs.id === id);
      if (!target) return;
      const clone: CaseStudy = {
        ...target,
        id: `${target.id}-copy-${Date.now().toString().slice(-4)}`,
        title: `${target.title} (Copy)`,
      };
      pushState({ ...siteData, caseStudies: [...siteData.caseStudies, clone] });
    },
    [siteData, pushState]
  );

  const updateContact = useCallback(
    (patch: Partial<ContactContent>) => {
      pushState({ ...siteData, contact: { ...siteData.contact, ...patch } });
    },
    [siteData, pushState]
  );

  const saveDraft = useCallback(() => {
    saveToServer(siteData);
  }, [siteData, saveToServer]);

  const resetToDefaults = useCallback(() => {
    removeFromIndexedDB(DRAFT_STORAGE_KEY);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setUndoStack((prev) => [...prev, siteData]);
    setRedoStack([]);
    setSiteDataState(DEFAULT_SITE_DATA);
    saveToServer(DEFAULT_SITE_DATA);
  }, [siteData, saveToServer]);

  const syncWithCodebase = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const fresh = {
            ...DEFAULT_SITE_DATA,
            ...json.data,
            caseStudies: sanitizeCaseStudies(json.data.caseStudies || DEFAULT_SITE_DATA.caseStudies),
          };
          setUndoStack([]);
          setRedoStack([]);
          setSiteDataState(fresh);
          setSaveStatus('saved');
          return;
        }
      }
    } catch {}

    setUndoStack([]);
    setRedoStack([]);
    setSiteDataState(DEFAULT_SITE_DATA);
  }, []);

  const discardDraft = useCallback(() => {
    syncWithCodebase();
  }, [syncWithCodebase]);

  const exportTypeScriptCode = useCallback(() => {
    return generateSiteContentTs(siteData);
  }, [siteData]);

  const exportJsonCode = useCallback(() => {
    return JSON.stringify(siteData, null, 2);
  }, [siteData]);

  const importJsonCode = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed.hero || !parsed.whoWeAre || !parsed.caseStudies) {
          return { success: false, error: 'Invalid configuration format' };
        }
        pushState({
          ...DEFAULT_SITE_DATA,
          ...parsed,
          config: { ...DEFAULT_SITE_DATA.config, ...(parsed.config || {}) },
          hero: { ...DEFAULT_SITE_DATA.hero, ...(parsed.hero || {}) },
          whoWeAre: { ...DEFAULT_SITE_DATA.whoWeAre, ...(parsed.whoWeAre || {}) },
          industries: { ...DEFAULT_SITE_DATA.industries, ...(parsed.industries || {}) },
          expertise: { ...DEFAULT_SITE_DATA.expertise, ...(parsed.expertise || {}) },
          contact: { ...DEFAULT_SITE_DATA.contact, ...(parsed.contact || {}) },
        });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'JSON parsing failed' };
      }
    },
    [pushState]
  );

  const publishToCodebase = useCallback(async () => {
    const tsCode = generateSiteContentTs(siteData);
    try {
      // 1. Commit to persistent server JSON
      await saveToServer(siteData);

      // 2. Commit to static src/data/siteContent.ts
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        success: true,
        message: 'Saved 24/7 Live to Server',
      };
    } catch {
      return {
        success: false,
        message: 'Direct API writing not reachable in static mode.',
      };
    }
  }, [siteData, saveToServer]);

  const openEditor = useCallback((tab?: EditorTab, projectId?: string | null) => {
    setIsAuthorized(true);
    setIsEditorOpen(true);
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
      const liveUrl = URL.createObjectURL(blob);
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
        toggleClickToEdit,
        setActiveTab,
        setPreviewDevice,
        setEditingProjectId,
        authorize,
        deauthorize,
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
        saveToServer: () => saveToServer(siteData),
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
