import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';

export const Header: React.FC = () => {
  const { siteData, isAuthorized, isEditorOpen } = useSiteContent();
  const config = siteData.config;
  const navLinks = siteData.navLinks;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);

      const sectionIds = ['home', 'about', 'industries', 'expertise', 'our-work', 'contact'];
      const scrollPos = window.scrollY + 140;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const topOffsetClass = isAuthorized && isEditorOpen ? 'top-14' : 'top-0';

  return (
    <header
      className={`fixed inset-x-0 ${topOffsetClass} z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#101318]/95 border-white/[0.08] shadow-2xl backdrop-blur-md'
          : 'bg-[#101318]/90 border-white/[0.06] backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* SGS Master Brand Wordmark / Original Logo */}
        <a
          href="#home"
          className="inline-flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-sm group"
          aria-label="SGS AI Group home"
          onClick={handleNavClick}
        >
          <img
            src={config.logoWhite}
            alt="SGS AI Group"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
          />
        </a>

        {/* Desktop Navigation Links matching Mockup Header */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main Navigation"
        >
          {navLinks.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#2563EB] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Header Right Action: Mockup "Let's Talk →" Button */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#2563EB]/25 transition-all duration-300 hover:bg-[#1D4ED8] hover:shadow-[0_0_24px_rgba(37,99,235,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <span>Let's Talk</span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2.5 text-[#94A3B8] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#101318]/98 px-6 pt-2 pb-8 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="pb-4 border-b border-white/10 mb-4">
            <p className="font-display font-bold text-xs uppercase tracking-wider text-[#2563EB]">
              SGS AI Group
            </p>
            <p className="text-sm text-[#94A3B8] mt-1">
              Human Thinking. Intelligent Execution.
            </p>
          </div>
          <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
            {navLinks.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`text-base font-medium py-2 transition-colors flex items-center justify-between ${
                    isActive ? 'text-[#2563EB]' : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="size-1.5 rounded-full bg-[#2563EB]" />}
                </a>
              );
            })}
            <div className="pt-6 border-t border-white/10">
              <a
                href="#contact"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#1D4ED8] transition-colors"
              >
                <span>Let's Talk</span>
                <ArrowRight className="size-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
