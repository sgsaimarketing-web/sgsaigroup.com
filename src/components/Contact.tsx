import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, Mail, CheckCircle2, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import { getSectionPaddingClass, resolveSectionLayoutForDevice } from '../utils/responsiveMedia.ts';

interface ContactProps {
  preselectedObjective?: string;
}

export const Contact: React.FC<ContactProps> = ({ preselectedObjective }) => {
  const { siteData } = useSiteContent();
  const device = useEffectiveDevice();
  const contact = siteData.contact;

  const serviceOptions = useMemo(() => {
    const baseOptions = siteData.expertise.capabilities.map((cap) =>
      cap.title === 'Digital Marketing' ? 'Digital Marketing & Performance' : cap.title
    );
    if (preselectedObjective && !baseOptions.includes(preselectedObjective)) {
      baseOptions.unshift(preselectedObjective);
    }
    return baseOptions;
  }, [siteData.expertise.capabilities, preselectedObjective]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: preselectedObjective || serviceOptions[0] || 'Brand Strategy & Creative',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (preselectedObjective) {
      setFormData((prev) => ({ ...prev, service: preselectedObjective }));
      setSubmitted(false);
    }
  }, [preselectedObjective]);

  const layout = resolveSectionLayoutForDevice(device, contact.responsiveLayout, {
    mobile: { paddingY: 'compact' },
    tablet: { paddingY: 'standard' },
    laptop: { paddingY: 'standard' },
  });

  const paddingClass = getSectionPaddingClass(device, layout.paddingY);
  const horizontalPad = device === 'mobile' ? 'px-5' : 'px-6 lg:px-8';

  const WHATSAPP_DISPLAY = siteData.config.phoneTK || '+60 11-3944 0907';
  const WHATSAPP_NUMBER = WHATSAPP_DISPLAY.replace(/\D/g, '') || '601139440907';
  const TARGET_EMAIL = contact.recipientEmail || siteData.config.email || 'sgsaimarketing@gmail.com';

  const generateWhatsAppMessage = () => {
    return (
      `*New SGS AI Group Project Inquiry*\n\n` +
      `*Client Name:* ${formData.name}\n` +
      `*Business Email:* ${formData.email}\n` +
      `*Strategic Objective:* ${formData.service}\n\n` +
      `*Project Overview & Brief:*\n${formData.message.trim() || 'Ready to discuss strategic collaboration and marketing/AI objectives.'}`
    );
  };

  const generateWhatsAppUrl = () => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(generateWhatsAppMessage())}`;
  };

  const generateMailtoUrl = () => {
    const subject = `SGS AI Group Inquiry — ${formData.service} (${formData.name})`;
    const body =
      `Dear SGS AI Group Team,\n\n` +
      `I would like to initiate a strategic discussion regarding our marketing and AI engineering objectives.\n\n` +
      `• Client Name: ${formData.name}\n` +
      `• Business Email: ${formData.email}\n` +
      `• Strategic Objective: ${formData.service}\n\n` +
      `Project Brief & Requirements:\n` +
      `${formData.message.trim() || 'Ready to discuss strategic collaboration and marketing/AI objectives.'}\n\n` +
      `Best regards,\n${formData.name}`;
    return `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    if (!formData.name.trim()) {
      setNameError('Please enter your name or company contact.');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!isValidEmail(formData.email)) {
      setEmailError('Please enter a valid business email address.');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (hasError) return;

    setLoading(true);
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 220);
  };

  const handleCopyBrief = async () => {
    const text = generateWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable in restricted iframe
    }
  };

  const gridClass =
    device === 'laptop'
      ? 'grid gap-14 grid-cols-12'
      : 'grid gap-10 grid-cols-1';

  return (
    <EditableBlock section="contact" label="Contact Section">
      <section
        id="contact"
        className={`relative isolate scroll-mt-20 overflow-hidden bg-[#F8FAFC] text-[#101318] ${paddingClass} border-b border-black/[0.06]`}
      >
        <div className={`relative mx-auto max-w-7xl ${horizontalPad} ${gridClass} reveal z-10`}>
          {/* Left Column: Verified Directory & Executive Channel */}
          <div className={`${device === 'laptop' ? 'col-span-5' : ''} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {contact.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{contact.eyebrow}</span>
              </div>

              <h2
                className={`mt-6 sm:mt-8 font-display ${
                  device === 'mobile'
                    ? 'text-3xl leading-[1.06]'
                    : device === 'tablet'
                    ? 'text-4xl leading-[1.05]'
                    : 'text-5xl leading-[1.04]'
                } font-extrabold tracking-[-0.03em] text-[#101318]`}
              >
                {contact.headline}
              </h2>

              <p className={`mt-4 sm:mt-6 ${device === 'mobile' ? 'text-sm' : 'text-base md:text-lg'} leading-relaxed text-[#64748B]`}>
                {contact.intro}
              </p>
            </div>

            <dl
              className={`${
                device === 'tablet'
                  ? 'mt-8 grid grid-cols-2 gap-6 border-t border-black/[0.08] pt-6'
                  : 'mt-8 sm:mt-12 space-y-5 sm:space-y-6 divide-y divide-black/[0.08]'
              } text-sm`}
            >
              {contact.details.map((item) => (
                <div key={item.label} className={device === 'tablet' ? '' : 'pt-5 sm:pt-6 first:pt-0'}>
                  <dt className="eyebrow text-[#64748B] text-[11px] font-semibold tracking-wider">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 sm:mt-2">
                    {item.href ? (
                      <a
                        href={item.href}
                        className={`font-display ${
                          device === 'mobile' ? 'text-lg' : 'text-xl'
                        } font-bold text-[#101318] hover:text-[#2563EB] transition-colors inline-block py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-sm break-all`}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className={`font-display ${device === 'mobile' ? 'text-lg' : 'text-xl'} font-bold text-[#101318]`}>
                        {item.value}
                      </span>
                    )}
                  </dd>
                  {item.subtext && (
                    <dd className="mt-1 text-xs text-[#64748B] font-normal leading-relaxed">
                      {item.subtext}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>

          {/* Right Column: Direct Conversation & Verified Form */}
          <div className={device === 'laptop' ? 'col-span-6 col-start-7' : ''}>
            <div
              className={`relative rounded-sm border border-black/[0.08] bg-white ${
                device === 'mobile' ? 'p-5' : device === 'tablet' ? 'p-8' : 'p-10 lg:p-12'
              } shadow-xl`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 sm:pb-6 border-b border-black/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
                  <h3 className={`font-display ${device === 'mobile' ? 'text-xl' : 'text-2xl'} font-extrabold text-[#101318]`}>
                    {contact.cardTitle}
                  </h3>
                </div>
                {device !== 'mobile' && (
                  <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium">
                    Direct Channels
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
                {contact.cardIntro}
              </p>

              {submitted ? (
                <div className="mt-6 sm:mt-8 p-5 sm:p-8 rounded-sm bg-[#F0FDF4] border border-emerald-300 text-emerald-950 animate-in fade-in space-y-5">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="size-7 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-extrabold text-lg text-emerald-950">
                        Project Brief Prepared
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                        Thank you, <strong className="font-semibold text-emerald-950">{formData.name}</strong>.{' '}
                        {contact.successMessage ||
                          `Your brief for ${formData.service} is ready to send via WhatsApp (${WHATSAPP_DISPLAY}) or direct email (${TARGET_EMAIL}).`}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="pt-2 space-y-2.5">
                    <a
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] px-5 py-3 min-h-[46px] text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
                    >
                      <MessageSquare className="size-4" />
                      <span>Open WhatsApp Chat ({WHATSAPP_DISPLAY})</span>
                      <ExternalLink className="size-3.5 opacity-80" />
                    </a>

                    <a
                      href={generateMailtoUrl()}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-white hover:bg-emerald-50 border border-emerald-300 px-5 py-3 min-h-[46px] text-xs font-bold uppercase tracking-wider text-emerald-900 shadow-sm transition-all cursor-pointer"
                    >
                      <Mail className="size-4 text-emerald-700" />
                      <span>Send Direct Email ({TARGET_EMAIL})</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyBrief}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-black/5 hover:bg-black/10 px-4 py-2.5 min-h-[44px] text-xs font-medium text-emerald-900 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="size-3.5 text-emerald-700" /> : <Copy className="size-3.5" />}
                      <span>{copied ? 'Brief Copied to Clipboard!' : 'Copy Formatted Brief Text'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-emerald-800">
                      Response timeline: within 2–4 business hours
                    </span>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="font-bold text-emerald-900 underline hover:text-emerald-700 cursor-pointer"
                    >
                      Send another inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      aria-invalid={Boolean(nameError)}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (nameError) setNameError(null);
                      }}
                      placeholder="e.g. Sarah Tan"
                      className={`mt-1.5 w-full rounded-sm border px-4 py-3 min-h-[46px] text-base sm:text-sm text-[#101318] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-1 ${
                        nameError
                          ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500'
                          : 'border-black/[0.12] bg-[#F8FAFC] focus:border-[#2563EB] focus:ring-[#2563EB]'
                      }`}
                    />
                    {nameError && (
                      <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Business Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      aria-invalid={Boolean(emailError)}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="e.g. sarah@enterprise.com"
                      className={`mt-1.5 w-full rounded-sm border px-4 py-3 min-h-[46px] text-base sm:text-sm text-[#101318] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-1 ${
                        emailError
                          ? 'border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500'
                          : 'border-black/[0.12] bg-[#F8FAFC] focus:border-[#2563EB] focus:ring-[#2563EB]'
                      }`}
                    />
                    {emailError && (
                      <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Strategic Objective
                    </label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="mt-1.5 w-full rounded-sm border border-black/[0.12] bg-[#F8FAFC] px-4 py-3 min-h-[46px] text-base sm:text-sm text-[#101318] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Project Overview
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your goals, timeline, or current marketing & AI challenges..."
                      className="mt-1.5 w-full rounded-sm border border-black/[0.12] bg-[#F8FAFC] px-4 py-3 text-base sm:text-sm text-[#101318] placeholder-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-3.5 min-h-[48px] text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-[#2563EB]/25 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer disabled:opacity-60"
                  >
                    <span>{loading ? 'Submitting...' : 'Send Direct Inquiry'}</span>
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              )}

              {/* Verified Privacy Note */}
              <div className="mt-6 pt-4 border-t border-black/[0.06] text-center">
                <p className="text-[11px] text-[#94A3B8]">
                  {contact.footerPrivacy}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
