import React from 'react';
import { useSiteContent, EditorTab } from '../../context/ContentContext.tsx';
import { HeroEditor } from './HeroEditor.tsx';
import { WhoWeAreEditor } from './WhoWeAreEditor.tsx';
import { IndustriesEditor } from './IndustriesEditor.tsx';
import { ExpertiseEditor } from './ExpertiseEditor.tsx';
import { SelectedWorkEditor } from './SelectedWorkEditor.tsx';
import { ContactEditor } from './ContactEditor.tsx';
import { X, ChevronRight, Sliders, Sparkles } from 'lucide-react';

interface EditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditorDrawer: React.FC<EditorDrawerProps> = ({ isOpen, onClose }) => {
  const { isAuthorized, isEditorOpen, activeTab, setActiveTab } = useSiteContent();

  if (!isAuthorized || !isEditorOpen || !isOpen) return null;

  const tabs: { id: EditorTab; label: string; num: string }[] = [
    { id: 'hero', label: 'Hero', num: '01' },
    { id: 'whoweare', label: 'Who We Are', num: '02' },
    { id: 'industries', label: 'Industries', num: '03' },
    { id: 'expertise', label: 'Expertise', num: '04' },
    { id: 'work', label: 'Selected Work', num: '05' },
    { id: 'contact', label: 'Contact', num: '06' },
  ];

  return (
    <aside
      className="fixed top-14 right-0 bottom-0 z-[140] w-full max-w-[460px] bg-[#101318]/98 backdrop-blur-xl border-l border-white/10 text-white shadow-2xl flex flex-col transition-all duration-300"
      aria-label="Content & Design Editor Drawer"
    >
      {/* Drawer Top Header & Navigation Grid */}
      <div className="p-3 border-b border-white/10 shrink-0 bg-[#0F1218] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#2563EB]" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
              CMS Section Editor
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Collapse Editor Drawer"
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* 6 Sections Clean Grid (No Scrollbar, No Overflow) */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-semibold transition cursor-pointer text-center ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-400/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="font-mono text-[9px] opacity-75">{t.num}</span>
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Editor Container with Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'hero' && <HeroEditor />}
        {activeTab === 'whoweare' && <WhoWeAreEditor />}
        {activeTab === 'industries' && <IndustriesEditor />}
        {activeTab === 'expertise' && <ExpertiseEditor />}
        {activeTab === 'work' && <SelectedWorkEditor />}
        {activeTab === 'contact' && <ContactEditor />}
      </div>
    </aside>
  );
};
