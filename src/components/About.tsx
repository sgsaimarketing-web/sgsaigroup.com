import React from 'react';
import { ABOUT_CONTENT, PHILOSOPHY_CONTENT } from '../data/siteContent.ts';

export const About: React.FC = () => {
  return (
    <section id="about" className="bg-white text-[#101318] scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-28 md:py-40">
        {/* Section Kicker */}
        <div className="flex items-center gap-4 text-[#64748B] reveal">
          <span className="eyebrow text-[#2563EB] font-bold">{ABOUT_CONTENT.kickerNum}</span>
          <span className="h-px w-10 bg-black/10" aria-hidden="true" />
          <span className="eyebrow tracking-[0.2em]">{ABOUT_CONTENT.kickerLabel}</span>
        </div>

        {/* Main Narrative Grid: Asymmetrical Layout */}
        <div className="mt-12 grid gap-12 md:grid-cols-12 reveal">
          <div className="md:col-span-7">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-[-0.03em] text-[#101318]">
              {ABOUT_CONTENT.headlineMain}{' '}
              <span className="text-[#64748B] font-semibold">{ABOUT_CONTENT.headlineSub}</span>
            </h2>
            <div className="mt-6 h-1 w-16 bg-[#2563EB] rounded-full" aria-hidden="true" />
          </div>

          <div className="space-y-6 text-lg leading-relaxed text-[#64748B] md:col-span-5 md:pt-2">
            <p className="text-[#101318] font-medium leading-relaxed">
              {ABOUT_CONTENT.paragraphs[0]}
            </p>
            <p className="leading-relaxed">
              {ABOUT_CONTENT.paragraphs[1]}
            </p>
          </div>
        </div>

        {/* Philosophy Manifesto Section */}
        <div
          id="philosophy"
          className="mt-24 scroll-mt-28 rounded-sm border border-black/[0.08] bg-[#F4F6F8] p-8 sm:p-12 lg:p-14 reveal"
        >
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
            <span className="eyebrow text-[#2563EB] font-bold">{PHILOSOPHY_CONTENT.kicker}</span>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-12 items-baseline">
            <div className="lg:col-span-6">
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101318] leading-tight">
                {PHILOSOPHY_CONTENT.headline}
              </h3>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-[#64748B]">
                {PHILOSOPHY_CONTENT.narrative}
              </p>
            </div>

            <div className="lg:col-span-6 grid gap-5 sm:grid-cols-2">
              {PHILOSOPHY_CONTENT.tenets.map((tenet, idx) => (
                <div
                  key={tenet.label}
                  className="p-6 rounded-sm border border-black/[0.06] bg-white shadow-sm hover:border-[#2563EB]/40 transition-colors"
                >
                  <span className="font-display text-xs font-bold text-[#2563EB]">
                    TENET 0{idx + 1}
                  </span>
                  <h4 className="mt-2.5 font-display text-lg font-bold text-[#101318]">
                    {tenet.label}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                    {tenet.statement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Core Pillars: Create · Connect · Engineer */}
        <div className="mt-24 grid gap-10 border-t border-black/[0.08] pt-12 md:grid-cols-3 reveal">
          {ABOUT_CONTENT.pillars.map((pillar, idx) => (
            <div key={pillar.title} className="group relative">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xs font-bold text-[#64748B] group-hover:text-[#2563EB] transition-colors">
                  0{idx + 1}
                </span>
                <span className="h-px w-8 bg-black/10 group-hover:bg-[#2563EB]/50 transition-colors" />
              </div>

              <h3 className="mt-5 font-display text-2xl lg:text-3xl font-extrabold uppercase tracking-wide text-[#101318]">
                {pillar.title}
              </h3>

              <p className="mt-2 text-base font-semibold text-[#101318] leading-snug">
                {pillar.description}
              </p>

              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
