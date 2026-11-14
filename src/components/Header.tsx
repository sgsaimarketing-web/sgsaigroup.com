import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';

export const Header: React.FC = () => {
  const { siteData, isAuthorized, isEditorOpen, previewDevice } = useSiteContent();
  const device = useEffectiveDevice();
  const config = siteData.config;
  const navLinks = siteData.navLinks;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [scrolled, setScrolled] = useState(false);

  const isSimulatedDevice =
    isAuthorized && isEditorOpen && (previewDevice === 'tablet' || previewDevice === 'mobile');

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
    if (device !== 'mobile' && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [device, mobileMenuOpen]);

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

  const topOffsetStyle = isSimulatedDevice
    ? undefined
    : isAuthorized && isEditorOpen
    ? { top: '3.5rem' }
    : { top: '0' };

  const containerHeight =
    device === 'mobile' ? 'h-16 px-5' : device === 'tablet' ? 'h-[72px] px-6' : 'h-20 px-6 lg:px-8';

  return (
    <header
      style={topOffsetStyle}
      className={`${
        isSimulatedDevice ? 'sticky top-0' : 'fixed inset-x-0'
      } z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#101318]/95 border-white/[0.08] shadow-2xl backdrop-blur-md'
          : 'bg-[#101318]/90 border-white/[0.06] backdrop-blur-sm'
      }`}
    >
      <div className={`mx-auto flex ${containerHeight} max-w-7xl items-center justify-between`}>
        {/* SGS Master Brand Wordmark / Original Logo */}
        <a
          href="#home"
          className="inline-flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-sm group shrink-0"
          aria-label="SGS AI Group home"
          onClick={handleNavClick}
        >
          <img
            src={config.logoWhite}
            alt="SGS AI Group"
            width={120}
            height={32}
            className={`${device === 'mobile' ? 'h-7' : device === 'tablet' ? 'h-7' : 'h-8'} w-auto object-contain shrink-0`}
          />
        </a>

        {/* Navigation Links for Tablet & Laptop */}
        {device !== 'mobile' && (
          <nav
            className={`flex items-center ${device === 'tablet' ? 'gap-5' : 'gap-8'}`}
            aria-label="Main Navigation"
          >
            {navLinks.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 ${
                    device === 'tablet' ? 'text-[13px]' : 'text-sm'
                  } font-medium transition-colors whitespace-nowrap shrink-0 ${
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
        )}

        {/* Header Right Action: "Let's Talk →" Button (Tablet & Laptop) */}
        {device !== 'mobile' && (
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="#contact"
              className={`group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] ${
                device === 'tablet' ? 'px-4 py-2 text-[11px]' : 'px-5 py-2.5 text-xs'
              } font-bold uppercase tracking-wider text-white shadow-lg shadow-[#2563EB]/25 transition-all duration-300 hover:bg-[#1D4ED8] hover:shadow-[0_0_24px_rgba(37,99,235,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] whitespace-nowrap`}
            >
              <span>Let's Talk</span>
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        )}

        {/* Mobile Hamburger Toggle */}
        {device === 'mobile' && (
          <div className="flex">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2.5 text-[#94A3B8] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer min-h-[44px] min-w-[44px]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {device === 'mobile' && mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#101318]/98 px-5 pt-2 pb-8 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="pb-4 border-b border-white/10 mb-4">
            <p className="font-display font-bold text-xs uppercase tracking-wider text-[#2563EB]">
              SGS AI Group
            </p>
            <p className="text-sm text-[#94A3B8] mt-1 font-normal">
              Creative Intelligence × AI Engineering
            </p>
          </div>
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`text-base font-medium py-3 px-3 rounded-lg transition-colors flex items-center justify-between min-h-[48px] ${
                    isActive ? 'text-[#2563EB] bg-white/[0.04]' : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="size-2 rounded-full bg-[#2563EB]" />}
                </a>
              );
            })}
            <div className="pt-6 border-t border-white/10 mt-3">
              <a
                href="#contact"
                onClick={handleNavClick}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 py-3.5 min-h-[46px] text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1D4ED8] transition-colors shadow-lg shadow-[#2563EB]/25"
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
