import React, { useState } from 'react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { Lock, Unlock, Sliders } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    siteData,
    isAuthorized,
    isEditorOpen,
    toggleEditor,
    authorize,
  } = useSiteContent();
  const config = siteData.config;
  const navLinks = siteData.navLinks;
  const contact = siteData.contact;

  const [promptOpen, setPromptOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  const handleAdminClick = () => {
    if (isAuthorized) {
      toggleEditor();
    } else {
      setPromptOpen(true);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorize(passcode)) {
      setPromptOpen(false);
      toggleEditor();
      setErrorMsg(false);
    } else {
      setErrorMsg(true);
    }
  };

  return (
    <footer className="relative bg-[#101318] text-white border-t border-white/[0.08]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:px-8 py-16 md:grid-cols-12">
        {/* Brand Architecture Column */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <a
              href="#home"
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-sm"
              aria-label="SGS AI Group home"
            >
              <img
                src={config.logoWhite}
                alt={config.brandName}
                className="h-8 w-auto object-contain"
                width={120}
                height={32}
              />
            </a>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#94A3B8]">
              {contact.footerTagline}
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-white/[0.06]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#2563EB] font-bold">
              {config.philosophy}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {config.brandName} · {config.marketingBrandName}
            </p>
          </div>
        </div>

        {/* Footer Navigation matching Mockup */}
        <nav className="grid grid-cols-2 gap-3 text-sm md:col-span-4" aria-label="Footer Navigation">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[#94A3B8] hover:text-white transition-colors py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Contact Quick Information */}
        <div className="text-sm text-[#94A3B8] md:col-span-3 space-y-2">
          <p className="text-xs uppercase tracking-wider text-white font-bold mb-3">
            Regional Presence
          </p>
          <a
            href={`mailto:${config.email}`}
            className="text-white hover:text-[#2563EB] transition-colors block font-semibold"
          >
            {config.email}
          </a>
          <p className="text-xs text-[#94A3B8]">
            {config.regions}
          </p>
          <p className="text-xs text-[#94A3B8] pt-2">
            TK: {config.phoneTK}
          </p>
        </div>
      </div>

      {/* Copyright Bar & Discreet Private CMS Trigger */}
      <div className="border-t border-white/[0.06] bg-[#0C0E12] py-6 text-xs text-[#94A3B8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{config.copyright}</p>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#64748B]">
              Human Thinking. Intelligent Execution.
            </span>

            {/* Discreet Admin Lock Button */}
            <button
              type="button"
              onClick={handleAdminClick}
              title="Private Website Content & Design Editor (Ctrl+Shift+E)"
              aria-label="Private Website Content & Design Editor"
              className="p-1 rounded text-[#475569] hover:text-[#94A3B8] transition cursor-pointer"
            >
              {isAuthorized ? (
                <Sliders className="size-3.5 text-[#2563EB]" />
              ) : (
                <Lock className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Discreet Passcode Modal */}
      {promptOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#161B22] p-6 text-white shadow-2xl">
            <h3 className="font-display font-bold text-base mb-1">SGS Studio Access</h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Enter authorized administrator passcode to open visual editor.
            </p>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (default: sgs2026)"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-[#2563EB] focus:outline-none"
              />

              {errorMsg && (
                <p className="text-xs text-red-400">Invalid passcode. Please try again.</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPromptOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Unlock CMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};
