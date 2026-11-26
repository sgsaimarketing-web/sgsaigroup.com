import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { Lock, Sliders } from 'lucide-react';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';

export const Footer: React.FC = () => {
  const {
    siteData,
    storageBackend,
    serverAuthMode,
    isAuthorized,
    isPasscodeModalOpen,
    openPasscodeModal,
    closePasscodeModal,
    toggleEditor,
    openEditor,
    signInWithSupabase,
    authorizePasscode,
    setupAdminPasscode,
  } = useSiteContent();
  const device = useEffectiveDevice();
  const config = siteData.config;
  const navLinks = siteData.navLinks;
  const contact = siteData.contact;

  const [email, setEmail] = useState('sgsaimarketing@gmail.com');
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isPasscodeModalOpen) {
      setPasscode('');
      setErrorMsg(null);
      setIsSubmitting(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePasscodeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPasscodeModalOpen, closePasscodeModal]);

  const handleAdminClick = () => {
    if (isAuthorized) {
      toggleEditor();
    } else {
      openPasscodeModal();
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const result =
        storageBackend === 'supabase'
          ? await signInWithSupabase(email, passcode)
          : serverAuthMode === 'setup_required'
          ? await setupAdminPasscode(passcode)
          : await authorizePasscode(passcode);

      if (result.success) {
        closePasscodeModal();
        openEditor('hero');
        setPasscode('');
        setErrorMsg(null);
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const gridClass =
    device === 'laptop'
      ? 'grid-cols-12 gap-12 py-16 px-6 lg:px-8'
      : device === 'tablet'
      ? 'grid-cols-2 gap-10 py-14 px-6'
      : 'grid-cols-1 gap-8 py-12 px-5';

  return (
    <footer className="relative bg-[#101318] text-white border-t border-white/[0.08]">
      <div className={`mx-auto grid max-w-7xl ${gridClass}`}>
        {/* Brand Architecture Column */}
        <div
          className={`${
            device === 'laptop' ? 'col-span-5' : device === 'tablet' ? 'col-span-2' : ''
          } flex flex-col justify-between`}
        >
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

            <p className="mt-4 sm:mt-5 max-w-sm text-sm leading-relaxed text-[#94A3B8]">
              {contact.footerTagline}
            </p>
          </div>

          <div className="mt-6 sm:mt-8 pt-5 border-t border-white/[0.06]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#2563EB] font-bold">
              {config.philosophy}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {config.brandName} · {config.marketingBrandName}
            </p>
          </div>
        </div>

        {/* Footer Navigation matching Mockup */}
        <nav
          className={`grid grid-cols-2 gap-2.5 sm:gap-3 text-sm ${
            device === 'laptop' ? 'col-span-4' : ''
          }`}
          aria-label="Footer Navigation"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Contact Quick Information */}
        <div
          className={`text-sm text-[#94A3B8] ${
            device === 'laptop' ? 'col-span-3' : ''
          } space-y-2`}
        >
          <p className="text-xs uppercase tracking-wider text-white font-bold mb-3">
            Regional Presence
          </p>
          <a
            href={`mailto:${config.email}`}
            className="text-white hover:text-[#2563EB] transition-colors block font-semibold break-all"
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
      <div className="border-t border-white/[0.06] bg-[#0C0E12] py-5 sm:py-6 text-xs text-[#94A3B8]">
        <div
          className={`mx-auto max-w-7xl ${
            device === 'mobile' ? 'px-5 flex-col items-start' : 'px-6 lg:px-8 flex-row items-center justify-between'
          } flex gap-3`}
        >
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
              className="p-2 rounded text-[#475569] hover:text-[#94A3B8] transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
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

      {/* Unified Accessible Admin Sign-In Modal (Supabase Auth or Local Server Setup/Login) */}
      {isPasscodeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cms-passcode-title"
          onClick={closePasscodeModal}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-white/10 bg-[#161B22] p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 id="cms-passcode-title" className="font-display font-bold text-base">
                SGS Studio Access
              </h3>
              <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/30">
                {storageBackend === 'supabase' ? 'Supabase Auth' : 'Local Server'}
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] mb-4">
              {storageBackend === 'supabase'
                ? 'Sign in with your authorized Supabase Admin email & password to edit and publish live.'
                : serverAuthMode === 'setup_required'
                ? 'First-run studio setup: choose an administrator passcode (minimum 6 characters).'
                : 'Enter your administrator passcode to open the visual CMS editor.'}
            </p>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              {storageBackend === 'supabase' && (
                <div>
                  <label htmlFor="cms-admin-email" className="sr-only">
                    Admin Email
                  </label>
                  <input
                    id="cms-admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Admin email"
                    aria-label="Administrator email"
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 min-h-[44px] text-base sm:text-sm text-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label htmlFor="cms-admin-password" className="sr-only">
                  {storageBackend === 'supabase' ? 'Password' : 'Passcode'}
                </label>
                <input
                  id="cms-admin-password"
                  type="password"
                  required
                  autoFocus={storageBackend !== 'supabase'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder={
                    storageBackend === 'supabase'
                      ? 'Enter Supabase admin password'
                      : serverAuthMode === 'setup_required'
                      ? 'Create studio passcode (6+ chars)'
                      : 'Enter studio passcode'
                  }
                  aria-label="Administrator password or passcode"
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 min-h-[44px] text-base sm:text-sm text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <p role="alert" className="text-xs text-red-400 leading-relaxed">
                  {errorMsg}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closePasscodeModal}
                  className="rounded-lg px-3 py-2 min-h-[40px] text-xs text-white/60 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 min-h-[40px] text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Verifying...'
                    : storageBackend === 'supabase'
                    ? 'Sign In & Unlock'
                    : serverAuthMode === 'setup_required'
                    ? 'Save & Unlock'
                    : 'Unlock CMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};
