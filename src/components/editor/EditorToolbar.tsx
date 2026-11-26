import React, { useState, useRef, useEffect } from 'react';
import { useSiteContent, EditorTab } from '../../context/ContentContext.tsx';
import {
  Monitor,
  Tablet,
  Smartphone,
  MousePointerClick,
  Undo2,
  Redo2,
  Save,
  Download,
  X,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Check,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { ExportModal } from './ExportModal.tsx';

interface EditorToolbarProps {
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onToggleDrawer,
  isDrawerOpen,
}) => {
  const {
    storageBackend,
    adminEmail,
    isAuthorized,
    isEditorOpen,
    isClickToEditActive,
    toggleClickToEdit,
    closeEditor,
    deauthorize,
    activeTab,
    setActiveTab,
    previewDevice,
    setPreviewDevice,
    isDraft,
    canUndo,
    canRedo,
    undo,
    redo,
    saveDraft,
    saveStatus,
    saveErrorMessage,
    publishToCodebase,
    syncWithCodebase,
  } = useSiteContent();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isPublishingLive, setIsPublishingLive] = useState(false);
  const [publishLiveToast, setPublishLiveToast] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const publishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    };
  }, []);

  if (!isAuthorized || !isEditorOpen) return null;

  const handleManualSave = () => {
    setSaveToast(true);
    saveDraft();
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveToast(false), 2000);
  };

  const handleDirectPublishLive = async () => {
    setIsPublishingLive(true);
    setPublishLiveToast(null);
    if (publishTimerRef.current) clearTimeout(publishTimerRef.current);

    try {
      const res = await publishToCodebase();
      setIsPublishingLive(false);
      if (res.success) {
        setPublishLiveToast(storageBackend === 'supabase' ? 'Published to Supabase!' : 'Live 24/7 on Site!');
      } else {
        setPublishLiveToast('Publish Error');
      }
      publishTimerRef.current = setTimeout(() => setPublishLiveToast(null), 3000);
    } catch {
      setIsPublishingLive(false);
      setPublishLiveToast('Failed');
      publishTimerRef.current = setTimeout(() => setPublishLiveToast(null), 2500);
    }
  };

  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'hero', label: '01 Hero' },
    { id: 'whoweare', label: '02 Who We Are' },
    { id: 'industries', label: '03 Industries' },
    { id: 'expertise', label: '04 Expertise' },
    { id: 'work', label: '05 Work' },
    { id: 'contact', label: '06 Contact' },
  ];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[150] h-14 bg-[#0F1218]/95 backdrop-blur-md border-b border-white/10 text-white flex items-center justify-between px-4 select-none shadow-2xl">
        {/* Left: Brand & Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold tracking-tight text-xs uppercase bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">
              SGS Studio
            </span>
            <span className="text-xs font-semibold text-white/80 hidden sm:inline">
              Visual CMS
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Persistent Storage Status Indicator */}
          <div
            className="flex items-center gap-1.5 text-[11px] font-mono"
            title={saveErrorMessage || (adminEmail ? `Signed in as ${adminEmail}` : undefined)}
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="size-3 text-sky-400 animate-spin" />
                <span className="text-sky-300 hidden md:inline">
                  {storageBackend === 'supabase' ? 'Syncing Supabase...' : 'Syncing Server...'}
                </span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-300 hidden md:inline">Save Error</span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-emerald-300 hidden md:inline">
                  {storageBackend === 'supabase' ? 'Supabase Live' : 'Local Server Saved'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Device Preview Switcher & Section Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Device Switcher */}
          <div className="flex items-center rounded-lg bg-black/50 p-0.5 border border-white/10" role="group" aria-label="Device preview">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              title="Laptop Preview (100%)"
              aria-label="Laptop preview"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                previewDevice === 'desktop'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Monitor className="size-3.5" />
              <span className="hidden md:inline">Laptop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              title="Tablet Preview (768px)"
              aria-label="Tablet preview"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                previewDevice === 'tablet'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Tablet className="size-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              title="Mobile Preview (390px)"
              aria-label="Mobile preview"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                previewDevice === 'mobile'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Smartphone className="size-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Click to Edit Toggle */}
          <button
            type="button"
            onClick={toggleClickToEdit}
            title="Toggle Visual Click-to-Edit outlines"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              isClickToEditActive
                ? 'bg-[#2563EB] text-white shadow'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <MousePointerClick className="size-3.5" />
            <span className="hidden lg:inline">
              {isClickToEditActive ? 'Click-to-Edit ON' : 'Click-to-Edit'}
            </span>
          </button>

          {/* Section Fast Jumper */}
          <div className="hidden xl:flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  if (!isDrawerOpen) onToggleDrawer();
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  activeTab === t.id && isDrawerOpen
                    ? 'bg-white/20 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: History, Save & Publish */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-20 transition"
            >
              <Undo2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-20 transition"
            >
              <Redo2 className="size-3.5" />
            </button>
          </div>

          {/* Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleDrawer}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              isDrawerOpen
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">{isDrawerOpen ? 'Hide Editor' : 'Edit Section'}</span>
          </button>

          {/* Sync to Codebase Default if Draft is Active */}
          {isDraft && (
            <button
              type="button"
              onClick={syncWithCodebase}
              title="Reset local draft back to published codebase"
              className="hidden lg:flex items-center gap-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2 py-1 text-[11px] font-semibold text-amber-300 transition cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Sync Live Site</span>
            </button>
          )}

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleManualSave}
            title="Save draft to local storage"
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
          >
            <Save className="size-3.5" />
            <span className="hidden sm:inline">{saveToast ? 'Saved!' : 'Save'}</span>
          </button>

          {/* Direct 1-Click Publish Live to Codebase */}
          <button
            type="button"
            onClick={handleDirectPublishLive}
            disabled={isPublishingLive}
            title="Publish all active edits live to server file (all visitors & devices will see it immediately)"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-lg transition cursor-pointer ${
              publishLiveToast
                ? 'bg-emerald-600 shadow-emerald-500/25'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[#2563EB]/25'
            }`}
          >
            {isPublishingLive ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : publishLiveToast ? (
              <Check className="size-3.5 text-white" />
            ) : (
              <Sparkles className="size-3.5 text-sky-200" />
            )}
            <span>
              {isPublishingLive ? 'Publishing...' : publishLiveToast || 'Publish Live'}
            </span>
          </button>

          {/* More Export Options */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            title="More export & backup options (.ts / .json)"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <Download className="size-3.5" />
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => {
              void deauthorize();
            }}
            title={adminEmail ? `Sign out (${adminEmail})` : 'Lock & Sign Out'}
            aria-label="Sign out of CMS"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>

          {/* Exit / Close */}
          <button
            type="button"
            onClick={closeEditor}
            title="Close Visual Editor"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {/* Export / Publish Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </>
  );
};
