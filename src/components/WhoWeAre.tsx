import React from 'react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';

export const WhoWeAre: React.FC = () => {
  const { siteData } = useSiteContent();
  const whoWeAre = siteData.whoWeAre;

  const getFocalClass = (f?: string) => {
    switch (f) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      default:
        return 'object-center';
    }
  };

  return (
    <EditableBlock section="whoweare" label="Who We Are Section">
      <section id="about" className="bg-white text-[#101318] scroll-mt-20 border-b border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Column: Editorial Statement */}
            <div className="lg:col-span-5 reveal">
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {whoWeAre.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{whoWeAre.eyebrow}</span>
              </div>

              <h2 className="mt-8 font-display text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-[-0.03em] text-[#101318]">
                {whoWeAre.headlineMain}{' '}
                <span className="text-[#2563EB] block">
                  {whoWeAre.headlineAccent}
                </span>
              </h2>

              <p className="mt-6 text-base md:text-lg leading-relaxed text-[#64748B]">
                {whoWeAre.description}
              </p>

              <div className="mt-8 pt-6 border-t border-black/[0.08]">
                <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#101318]">
                  {whoWeAre.baseline}
                </p>
              </div>
            </div>

            {/* Right Column: 3 Discipline Photo Cards matching Mockup */}
            <div className="lg:col-span-7 grid gap-4 sm:grid-cols-3 reveal">
              {whoWeAre.cards.map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-sm bg-[#101318] border border-black/[0.08] shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.imageAlt || card.title}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={750}
                      className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100 ${getFocalClass(
                        card.focalPoint
                      )}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101318] via-[#101318]/50 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-display text-xl font-black uppercase tracking-wider text-white">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#CBD5E1] leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
