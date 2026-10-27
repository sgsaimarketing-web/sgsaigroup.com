import React, { useState } from 'react';
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
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
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
    isAuthorized,
    isEditorOpen,
    isClickToEditActive,
    toggleClickToEdit,
    closeEditor,
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
    resetToDefaults,
  } = useSiteContent();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  if (!isAuthorized || !isEditorOpen) return null;

  const handleManualSave = () => {
    saveDraft();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
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
              Visual CMS Editor
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Draft indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span
              className={`size-2 rounded-full ${
                isDraft ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-white/60 hidden md:inline">
              {isDraft ? 'Draft Edits Active' : 'Clean / Synced'}
            </span>
          </div>
        </div>

        {/* Center: Device Preview Switcher & Section Tabs */}
        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center rounded-lg bg-black/50 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              title="Desktop Preview (100%)"
              className={`p-1.5 rounded-md transition ${
                previewDevice === 'desktop'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('tablet')}
              title="Tablet Preview (768px)"
              className={`p-1.5 rounded-md transition ${
                previewDevice === 'tablet'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Tablet className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              title="Mobile Preview (375px)"
              className={`p-1.5 rounded-md transition ${
                previewDevice === 'mobile'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Smartphone className="size-3.5" />
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

          {/* Publish / Export */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#2563EB]/25 transition cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Publish</span>
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
