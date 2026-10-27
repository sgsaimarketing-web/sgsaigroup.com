/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SGS AI Group - Official Single-Page Experience
 * Recreating Approved Visual Master Mockup:
 * /public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png
 * With Private Visual Website Content & Design Editor (CMS)
 */

import React, { useState, useEffect } from 'react';
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
import { EditorToolbar } from './components/editor/EditorToolbar.tsx';
import { EditorDrawer } from './components/editor/EditorDrawer.tsx';
import { CaseStudy } from './data/siteContent.ts';

function WebsiteContent() {
  const { siteData, isAuthorized, isEditorOpen, previewDevice } = useSiteContent();
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const [showShowreel, setShowShowreel] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  useEffect(() => {
    // Subtle IntersectionObserver for restrained editorial reveals
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-6');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-6');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [siteData]);

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

      {/* Private Visual CMS Top Command Toolbar */}
      {isAuthorized && isEditorOpen && (
        <EditorToolbar
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          isDrawerOpen={isDrawerOpen}
        />
      )}

      {/* Slide-out CMS Drawer */}
      {isAuthorized && isEditorOpen && (
        <EditorDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      )}

      {/* Simulated Device Frame Container for Tablet & Mobile Previews */}
      <div
        className={
          isSimulatedDevice
            ? previewDevice === 'tablet'
              ? 'max-w-[768px] mx-auto my-8 border-12 border-[#1E2430] rounded-[36px] shadow-2xl overflow-hidden bg-white ring-1 ring-white/10'
              : 'max-w-[390px] mx-auto my-8 border-12 border-[#1E2430] rounded-[44px] shadow-2xl overflow-hidden bg-white ring-1 ring-white/10'
            : 'w-full'
        }
      >
        {/* Device Notch / Camera Indicator */}
        {isSimulatedDevice && (
          <div className="bg-[#1E2430] py-1.5 flex justify-center items-center">
            <div className="h-3.5 w-24 bg-black/60 rounded-full flex items-center justify-center">
              <div className="size-2 rounded-full bg-[#2563EB]/40 mr-2" />
              <div className="size-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        )}

        {/* Global Header */}
        <Header />

        {/* Main Content Area matching Approved Mockup Layout */}
        <main id="main-content">
          {/* 01 — Hero: Cinematic NIRA AI World & Animated Headlines */}
          <Hero onOpenShowreel={() => setShowShowreel(true)} />

          {/* 02 — Who We Are: Master Company & Marketing Arm, 3 Disciplines (Create, Connect, Engineer) */}
          <WhoWeAre />

          {/* 03 — Industries: Five Essential Sector Tracks with Horizontal Slider */}
          <Industries />

          {/* 04 — Our Expertise: All Six Core Categories in Clean Bento Grid */}
          <Expertise />

          {/* 05 — Selected Work: Four Interactive Categories & Case Study Showcase */}
          <SelectedWork onSelectProject={(project) => setSelectedProject(project)} />

          {/* 06 — Contact: Verified Business Details & Direct Action Enquiry Form */}
          <Contact />
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
      />
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
