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

const DRAFT_STORAGE_KEY = 'sgs_site_content_draft_v2';
const AUTH_STORAGE_KEY = 'sgs_editor_authorized_v2';

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
  resetToDefaults: () => void;
  discardDraft: () => void;
  exportTypeScriptCode: () => string;
  exportJsonCode: () => string;
  importJsonCode: (jsonStr: string) => { success: boolean; error?: string };
  publishToCodebase: () => Promise<{ success: boolean; message: string; bytes?: number }>;
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

  // Load draft from localStorage if present
  const [siteData, setSiteDataState] = useState<SiteData>(() => {
    if (typeof window === 'undefined') return DEFAULT_SITE_DATA;
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SITE_DATA,
          ...parsed,
          config: { ...DEFAULT_SITE_DATA.config, ...(parsed.config || {}) },
          hero: { ...DEFAULT_SITE_DATA.hero, ...(parsed.hero || {}) },
          whoWeAre: { ...DEFAULT_SITE_DATA.whoWeAre, ...(parsed.whoWeAre || {}) },
          industries: { ...DEFAULT_SITE_DATA.industries, ...(parsed.industries || {}) },
          expertise: { ...DEFAULT_SITE_DATA.expertise, ...(parsed.expertise || {}) },
          contact: { ...DEFAULT_SITE_DATA.contact, ...(parsed.contact || {}) },
          workCategories: parsed.workCategories || DEFAULT_SITE_DATA.workCategories,
          caseStudies: parsed.caseStudies || DEFAULT_SITE_DATA.caseStudies,
        };
      }
    } catch (e) {
      console.warn('Failed to parse draft content from storage:', e);
    }
    return DEFAULT_SITE_DATA;
  });

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

  // Check if draft has unsaved changes compared to code defaults
  const isDraft = useMemo(() => {
    try {
      return JSON.stringify(siteData) !== JSON.stringify(DEFAULT_SITE_DATA);
    } catch {
      return false;
    }
  }, [siteData]);

  // Keep state with history tracking
  const pushState = useCallback(
    (newState: SiteData) => {
      setUndoStack((prev) => [...prev.slice(-25), siteData]);
      setRedoStack([]);
      setSiteDataState(newState);
      // Auto-save draft locally for safety
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newState));
      } catch (err) {
        console.warn('Could not auto-save to localStorage:', err);
      }
    },
    [siteData]
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, siteData]);
    setSiteDataState(previous);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(previous));
    } catch {}
  }, [undoStack, siteData]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, siteData]);
    setSiteDataState(next);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, [redoStack, siteData]);

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
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(siteData));
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  }, [siteData]);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setUndoStack((prev) => [...prev, siteData]);
    setRedoStack([]);
    setSiteDataState(DEFAULT_SITE_DATA);
  }, [siteData]);

  const discardDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setSiteDataState(DEFAULT_SITE_DATA);
  }, []);

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
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tsContent: tsCode }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message || 'Published permanently to src/data/siteContent.ts',
          bytes: data.bytes,
        };
      }
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.error || 'Server publishing returned error. Please download file.',
      };
    } catch {
      return {
        success: false,
        message: 'Direct API writing not reachable in static mode. Use "Download siteContent.ts".',
      };
    }
  }, [siteData]);

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
        resetToDefaults,
        discardDraft,
        exportTypeScriptCode,
        exportJsonCode,
        importJsonCode,
        publishToCodebase,
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
