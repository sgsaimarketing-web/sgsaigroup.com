import React, { useState } from 'react';
import { ArrowRight, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';

export const Contact: React.FC = () => {
  const { siteData } = useSiteContent();
  const contact = siteData.contact;
  const config = siteData.config;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Brand Strategy & Creative',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <EditableBlock section="contact" label="Contact Section">
      <section
        id="contact"
        className="relative isolate scroll-mt-20 overflow-hidden bg-[#F8FAFC] text-[#101318] py-24 md:py-32 border-b border-black/[0.06]"
      >
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:px-8 md:grid-cols-12 reveal z-10">
          {/* Left Column: Verified Directory & Executive Channel */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {contact.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{contact.eyebrow}</span>
              </div>

              <h2 className="mt-8 font-display text-4xl sm:text-5xl font-extrabold leading-[1.04] tracking-[-0.03em] text-[#101318]">
                {contact.headline}
              </h2>

              <p className="mt-6 text-base md:text-lg leading-relaxed text-[#64748B]">
                {contact.intro}
              </p>
            </div>

            <dl className="mt-12 space-y-6 text-sm divide-y divide-black/[0.08]">
              {contact.details.map((item) => (
                <div key={item.label} className="pt-6 first:pt-0">
                  <dt className="eyebrow text-[#64748B] text-[11px] font-semibold tracking-wider">
                    {item.label}
                  </dt>
                  <dd className="mt-2">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="font-display text-xl font-bold text-[#101318] hover:text-[#2563EB] transition-colors inline-block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-sm"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="font-display text-xl font-bold text-[#101318]">
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
          <div className="md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
            <div className="relative rounded-sm border border-black/[0.08] bg-white p-8 sm:p-12 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-black/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
                  <h3 className="font-display text-2xl font-extrabold text-[#101318]">
                    {contact.cardTitle}
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[#64748B] font-medium hidden sm:inline">
                  Direct Channels
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
                {contact.cardIntro}
              </p>

              {submitted ? (
                <div className="mt-8 p-6 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
                    <p className="font-display font-bold text-base">
                      Enquiry Received
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-700">
                    Thank you, {formData.name}. Executive Director TK and our client solutions team will review your project brief and get in touch shortly via {formData.email}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Tan"
                      className="mt-1.5 w-full rounded-sm border border-black/[0.12] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#101318] placeholder-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Business Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. sarah@enterprise.com"
                      className="mt-1.5 w-full rounded-sm border border-black/[0.12] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#101318] placeholder-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-xs font-bold uppercase tracking-wider text-[#101318]">
                      Strategic Objective
                    </label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="mt-1.5 w-full rounded-sm border border-black/[0.12] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#101318] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="Brand Strategy & Creative">Brand Strategy & Creative</option>
                      <option value="Digital Marketing & Performance">Digital Marketing & Performance</option>
                      <option value="Content & Media Production">Content & Media Production</option>
                      <option value="AI Applications & Engineering">AI Applications & Custom Engineering</option>
                      <option value="Business Process Automation">Business Process Automation</option>
                      <option value="Websites & Digital Experiences">Websites & Digital Platforms</option>
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
                      className="mt-1.5 w-full rounded-sm border border-black/[0.12] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#101318] placeholder-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-[#2563EB]/25 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer disabled:opacity-60"
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
