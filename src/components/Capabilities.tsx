import React, { useState } from 'react';
import { CAPABILITIES_CONTENT } from '../data/siteContent.ts';

export const Capabilities: React.FC = () => {
  const [activeHover, setActiveHover] = useState<string | null>(null);

  return (
    <section id="capabilities" className="bg-white text-[#101318] scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-28 md:py-40">
        {/* Section Kicker */}
        <div className="flex items-center gap-4 text-[#64748B] reveal">
          <span className="eyebrow text-[#2563EB] font-bold">{CAPABILITIES_CONTENT.kickerNum}</span>
          <span className="h-px w-10 bg-black/10" aria-hidden="true" />
          <span className="eyebrow tracking-[0.2em]">{CAPABILITIES_CONTENT.kickerLabel}</span>
        </div>

        {/* Headline */}
        <div className="mt-12 max-w-4xl reveal">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] tracking-[-0.03em] text-[#101318]">
            {CAPABILITIES_CONTENT.headlineMain}{' '}
            <span className="text-[#64748B] font-semibold">{CAPABILITIES_CONTENT.headlineSub}</span>
          </h2>
        </div>

        {/* All 6 SGS Services - Luminous Directory Architecture */}
        <ol className="mt-16 border-t border-black/[0.1] divide-y divide-black/[0.08]" aria-label="Capabilities and Services">
          {CAPABILITIES_CONTENT.services.map((service) => {
            const isHovered = activeHover === service.num;
            return (
              <li
                key={service.num}
                onMouseEnter={() => setActiveHover(service.num)}
                onMouseLeave={() => setActiveHover(null)}
                className="group relative py-9 lg:py-11 px-4 -mx-4 transition-all duration-300 rounded-sm hover:bg-[#F4F6F8]"
              >
                <div className="grid gap-4 md:grid-cols-12 md:items-baseline md:gap-8">
                  {/* Index Number */}
                  <div className="md:col-span-1 flex items-baseline gap-3">
                    <span className={`font-display text-sm font-bold tracking-wider transition-colors duration-200 ${
                      isHovered ? 'text-[#2563EB]' : 'text-[#64748B]'
                    }`}>
                      {service.num}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full transition-opacity duration-200 ${
                      isHovered ? 'bg-[#2563EB] opacity-100' : 'opacity-0'
                    }`} />
                  </div>

                  {/* Service Title & Scope */}
                  <div className="md:col-span-5 transition-transform duration-300 group-hover:translate-x-1">
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101318]">
                      {service.title}
                    </h3>
                    {service.scope && (
                      <p className="mt-2 text-xs uppercase tracking-wider text-[#64748B] font-medium">
                        {service.scope}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-6 md:col-start-7">
                    <p className="text-base md:text-lg leading-relaxed text-[#64748B] group-hover:text-[#101318] transition-colors">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Electric Blue Accent Hairline */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[#2563EB] transition-all duration-300 ${
                    isHovered ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                  }`}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
