/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SGS AI Group - Official Single-Page Experience
 * Recreating Approved Visual Master Mockup:
 * /public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png
 * With Private Visual Website Content & Design Editor (CMS)
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { WhoWeAre } from './components/WhoWeAre.tsx';
import { Industries } from './components/Industries.tsx';
import { Expertise } from './components/Expertise.tsx';
import { SelectedWork } from './components/SelectedWork.tsx';
import { Contact } from './components/Contact.tsx';
import { Footer } from './components/Footer.tsx';
import { ProjectModal } from './components/ProjectModal.tsx';
import { ShowreelModal } from './components/ShowreelModal.tsx';
import { ContentProvider, useSiteContent } from './context/ContentContext.tsx';
import { CaseStudy } from './data/siteContent.ts';

const EditorToolbar = lazy(() =>
  import('./components/editor/EditorToolbar.tsx').then((m) => ({ default: m.EditorToolbar }))
);
const EditorDrawer = lazy(() =>
  import('./components/editor/EditorDrawer.tsx').then((m) => ({ default: m.EditorDrawer }))
);

function WebsiteContent() {
  const {
    siteData,
    isAuthorized,
    isEditorOpen,
    previewDevice,
    isDraft,
    syncWithCodebase,
    openEditor,
  } = useSiteContent();
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const [showShowreel, setShowShowreel] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [activeWorkCategory, setActiveWorkCategory] = useState<string>('brand-campaigns');
  const [preselectedObjective, setPreselectedObjective] = useState<string>('Brand Strategy & Creative');

  const handleNavigateToWork = (categoryId?: string) => {
    if (categoryId) {
      setActiveWorkCategory(categoryId);
    }
    const target = document.getElementById('our-work');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigateToContact = (objective?: string) => {
    if (objective) {
      setPreselectedObjective(objective);
    }
    const target = document.getElementById('contact');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll('.reveal')) as HTMLElement[];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || isEditorOpen) {
      revealElements.forEach((el) => {
        el.dataset.revealed = 'true';
        el.classList.add('opacity-100', 'translate-y-0');
        el.classList.remove('opacity-0', 'translate-y-6');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetEl = entry.target as HTMLElement;
            targetEl.dataset.revealed = 'true';
            targetEl.classList.add('opacity-100', 'translate-y-0');
            targetEl.classList.remove('opacity-0', 'translate-y-6');
            observer.unobserve(targetEl);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => {
      if (el.dataset.revealed === 'true') {
        el.classList.add('opacity-100', 'translate-y-0');
        el.classList.remove('opacity-0', 'translate-y-6');
        return;
      }
      el.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-6');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isEditorOpen]);

  const isSimulatedDevice =
    isAuthorized && isEditorOpen && (previewDevice === 'tablet' || previewDevice === 'mobile');

  return (
    <div
      className={`min-h-screen bg-white text-[#101318] antialiased selection:bg-[#2563EB]/20 selection:text-[#2563EB] ${
        isAuthorized && isEditorOpen ? 'pt-14' : ''
      }`}
    >
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[120] rounded-full bg-[#2563EB] px-4 py-2 text-sm font-bold text-white shadow-xl focus:outline-none"
      >
        Skip to content
      </a>

      {/* Private Visual CMS Top Command Toolbar & Slide-out Drawer (Lazy-loaded for admins only) */}
      {isAuthorized && isEditorOpen && (
        <Suspense fallback={null}>
          <EditorToolbar
            onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
            isDrawerOpen={isDrawerOpen}
          />
          <EditorDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </Suspense>
      )}

      {/* Simulated Device Frame Container for Tablet & Mobile Previews */}
      <div
        className={
          isSimulatedDevice
            ? previewDevice === 'tablet'
              ? 'w-full max-w-[768px] mx-auto my-8 border-[10px] border-[#1E2430] rounded-[32px] shadow-2xl overflow-hidden bg-white ring-1 ring-white/10 transition-all duration-300'
              : 'w-full max-w-[390px] mx-auto my-8 border-[10px] border-[#1E2430] rounded-[40px] shadow-2xl overflow-hidden bg-white ring-1 ring-white/10 transition-all duration-300'
            : 'w-full'
        }
      >
        {/* Device Notch / Camera Indicator */}
        {isSimulatedDevice && (
          <div className="bg-[#1E2430] px-4 py-1.5 flex justify-between items-center text-[10px] font-mono text-white/50">
            <span>{previewDevice === 'tablet' ? 'Tablet Preview' : 'Mobile Preview'}</span>
            <div className="h-3 w-20 bg-black/60 rounded-full flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-[#2563EB]/60 mr-1.5" />
              <div className="size-1 rounded-full bg-white/20" />
            </div>
            <span>{previewDevice === 'tablet' ? '768px' : '390px'}</span>
          </div>
        )}

        {/* Global Header */}
        <Header />

        {/* Main Content Area matching Approved Mockup Layout */}
        <main id="main-content">
          {/* 01 — Hero: Cinematic NIRA AI World Widescreen Teaser & Headlines */}
          <Hero
            onOpenShowreel={() => setShowShowreel(true)}
            shouldPauseBackground={Boolean(showShowreel || selectedProject)}
          />

          {/* 02 — Who We Are: Master Company & Marketing Arm, 3 Disciplines (Create, Connect, Engineer) */}
          <WhoWeAre />

          {/* 03 — Industries: Five Essential Sector Tracks with Horizontal Slider */}
          <Industries onSelectCategory={handleNavigateToWork} />

          {/* 04 — Our Expertise: All Six Core Categories in Clean Bento Grid */}
          <Expertise
            onExploreCategory={handleNavigateToWork}
            onScopeObjective={handleNavigateToContact}
          />

          {/* 05 — Selected Work: Four Interactive Categories & Case Study Showcase */}
          <SelectedWork
            activeCategory={activeWorkCategory}
            onCategoryChange={setActiveWorkCategory}
            onSelectProject={(project) => setSelectedProject(project)}
            shouldPauseVideos={Boolean(selectedProject || showShowreel)}
          />

          {/* 06 — Contact: Verified Business Details & Direct Action Enquiry Form */}
          <Contact preselectedObjective={preselectedObjective} />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Case Study Modal Popup matching Mockup Bottom Showcase Overlay */}
      <ProjectModal
        project={selectedProject}
        allProjects={siteData.caseStudies}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(project) => setSelectedProject(project)}
      />

      {/* AI Showreel Teaser Modal */}
      <ShowreelModal
        isOpen={showShowreel}
        onClose={() => setShowShowreel(false)}
        onExploreWork={() => handleNavigateToWork()}
        onStartProject={() => handleNavigateToContact()}
      />

      {/* Floating Draft Indicator & 1-Click Sync to Live Site (Authorized Admins Only) */}
      {isAuthorized && isDraft && !isEditorOpen && (
        <aside
          aria-label="Draft mode notification"
          className="fixed bottom-5 right-5 z-[100] flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-[#0F1218]/95 px-3.5 py-2.5 text-xs text-white shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">Unpublished Draft Active</span>
          </div>
          <button
            type="button"
            onClick={syncWithCodebase}
            className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-200 transition cursor-pointer"
            title="Discard local draft and reload official live site"
          >
            Sync to Live Site
          </button>
          <button
            type="button"
            onClick={() => openEditor('work')}
            className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer"
          >
            Open CMS
          </button>
        </aside>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <WebsiteContent />
    </ContentProvider>
  );
}
