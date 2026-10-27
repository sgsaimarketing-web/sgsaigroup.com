import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AI_SOLUTIONS_CONTENT, SITE_CONFIG } from '../data/siteContent.ts';

export const AiEngineering: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="ai-solutions"
      className="relative scroll-mt-20 overflow-hidden bg-[#101318] py-32 md:py-44 text-white border-t border-white/[0.08]"
    >
      {/* Background Image: Connected Earth Centered on Southeast Asia */}
      {!imageError && (
        <img
          src={SITE_CONFIG.earthImage}
          alt="Connected Earth centered on Southeast Asia with illuminated links across the region"
          width={1280}
          height={795}
          loading="lazy"
          decoding="async"
          className="nira-earth absolute inset-0 h-full w-full object-cover select-none pointer-events-none opacity-80"
          onError={() => setImageError(true)}
        />
      )}

      {/* Earth Gradient Shade into Deep Charcoal #101318 */}
      <div className="nira-earth-shade absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Concentric Signal Rings in Restrained Electric Blue */}
      <div className="nira-signal pointer-events-none" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Main Content Grid: Asymmetric Architectural Pacing */}
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:px-8 md:grid-cols-12 reveal z-10">
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#3B82F6]" aria-hidden="true" />
              <p className="eyebrow text-[#3B82F6] font-bold">{AI_SOLUTIONS_CONTENT.eyebrow}</p>
            </div>

            <h2 className="mt-8 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-[-0.03em] text-white">
              {AI_SOLUTIONS_CONTENT.headline}
            </h2>

            <p className="mt-8 text-base md:text-lg leading-relaxed text-[#94A3B8]">
              {AI_SOLUTIONS_CONTENT.description}
            </p>
          </div>

          <div className="mt-12">
            <a
              href={AI_SOLUTIONS_CONTENT.cta.href}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#2563EB] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-2xl transition-all duration-300 hover:bg-[#1D4ED8] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <span>{AI_SOLUTIONS_CONTENT.cta.label}</span>
              <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* 4 Core Enterprise AI Modules */}
        <div className="md:col-span-6 md:col-start-7 self-end">
          <div className="mb-4 pb-2 border-b border-white/10 flex items-center justify-between text-xs uppercase tracking-wider text-[#94A3B8]">
            <span>Modular Enterprise Deployments</span>
            <span className="text-[#3B82F6]">Live Architecture</span>
          </div>

          <ul className="divide-y divide-white/[0.08]" aria-label="AI capability modules">
            {AI_SOLUTIONS_CONTENT.capabilitiesList.map((item) => (
              <li
                key={item.num}
                className="group flex items-center justify-between py-6 transition-colors duration-200 hover:bg-white/[0.02] px-3 -mx-3 rounded-sm"
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-display text-sm font-bold text-[#3B82F6]">
                    {item.num}
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-white transition-colors group-hover:text-white">
                    {item.title}
                  </span>
                </div>
                <span className="size-2 rounded-full border border-white/30 group-hover:border-[#3B82F6] group-hover:bg-[#3B82F6] transition-colors" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
