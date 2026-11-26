import React from 'react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import {
  getAspectRatioClass,
  getFocalClass,
  getSectionPaddingClass,
  resolveMediaForDevice,
  resolveSectionLayoutForDevice,
} from '../utils/responsiveMedia.ts';

export const WhoWeAre: React.FC = () => {
  const { siteData } = useSiteContent();
  const device = useEffectiveDevice();
  const whoWeAre = siteData.whoWeAre;

  const layout = resolveSectionLayoutForDevice(device, whoWeAre.responsiveLayout, {
    mobile: { paddingY: 'compact', mobileLayout: 'carousel' },
    tablet: { paddingY: 'standard', columnsTablet: 2 },
    laptop: { paddingY: 'standard' },
  });

  const paddingClass = getSectionPaddingClass(device, layout.paddingY);
  const horizontalPad = device === 'mobile' ? 'px-5' : 'px-6 lg:px-8';

  const cardsContainerClass =
    device === 'laptop'
      ? 'col-span-7 grid gap-4 grid-cols-3'
      : device === 'tablet'
      ? `grid gap-4 ${layout.columnsTablet === 3 ? 'grid-cols-3' : 'grid-cols-2'}`
      : layout.mobileLayout === 'stack'
      ? 'grid grid-cols-1 gap-4'
      : layout.mobileLayout === 'grid-2'
      ? 'grid grid-cols-2 gap-3'
      : 'flex gap-3.5 overflow-x-auto pb-2 -mx-5 px-5 no-scrollbar snap-x snap-mandatory';

  return (
    <EditableBlock section="whoweare" label="Who We Are Section">
      <section id="about" className="bg-white text-[#101318] scroll-mt-20 border-b border-black/[0.06] overflow-hidden">
        <div className={`mx-auto max-w-7xl ${horizontalPad} ${paddingClass}`}>
          <div
            className={`grid ${
              device === 'laptop'
                ? 'gap-12 grid-cols-12 items-center'
                : device === 'tablet'
                ? 'gap-10 grid-cols-1'
                : 'gap-8 grid-cols-1'
            }`}
          >
            {/* Left Column: Editorial Statement */}
            <div className={`${device === 'laptop' ? 'col-span-5' : ''} reveal`}>
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {whoWeAre.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{whoWeAre.eyebrow}</span>
              </div>

              <h2
                className={`mt-6 sm:mt-8 font-display ${
                  device === 'mobile'
                    ? 'text-3xl leading-[1.08]'
                    : device === 'tablet'
                    ? 'text-4xl leading-[1.06]'
                    : 'text-5xl leading-[1.06]'
                } font-extrabold tracking-[-0.03em] text-[#101318]`}
              >
                {whoWeAre.headlineMain}{' '}
                <span className="text-[#2563EB] block">
                  {whoWeAre.headlineAccent}
                </span>
              </h2>

              <p
                className={`mt-4 sm:mt-6 ${
                  device === 'mobile' ? 'text-sm leading-relaxed' : 'text-base md:text-lg leading-relaxed'
                } text-[#64748B]`}
              >
                {whoWeAre.description}
              </p>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-black/[0.08]">
                <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#101318]">
                  {whoWeAre.baseline}
                </p>
              </div>
            </div>

            {/* Right Column: 3 Discipline Photo Cards adapted per device */}
            <div className={`${cardsContainerClass} reveal`}>
              {whoWeAre.cards.map((card, idx) => {
                const isTabletThirdFull =
                  device === 'tablet' && layout.columnsTablet === 2 && idx === 2 && whoWeAre.cards.length === 3;

                const resolvedMedia = resolveMediaForDevice(
                  device,
                  {
                    aspectRatio: '4:5',
                    fit: 'cover',
                    focalPoint: card.focalPoint || 'center',
                  },
                  card.responsiveMedia,
                  {
                    mobile: {
                      aspectRatio: layout.mobileLayout === 'grid-2' ? '3:4' : '4:3',
                    },
                    tablet: {
                      aspectRatio: isTabletThirdFull ? '16:9' : '4:5',
                    },
                    laptop: {
                      aspectRatio: '4:5',
                    },
                  }
                );

                const mobileCardWidthClass =
                  device === 'mobile' && layout.mobileLayout === 'carousel'
                    ? 'flex-none w-[78vw] max-w-[300px] snap-start'
                    : isTabletThirdFull
                    ? 'col-span-2'
                    : '';

                return (
                  <div
                    key={card.title || idx}
                    className={`group relative overflow-hidden rounded-md bg-[#101318] border border-black/[0.08] shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${mobileCardWidthClass}`}
                  >
                    <div className={`${getAspectRatioClass(resolvedMedia.aspectRatio)} w-full overflow-hidden relative`}>
                      <img
                        src={card.image}
                        alt={card.imageAlt || card.title}
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={750}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/nira-official.webp';
                        }}
                        className={`h-full w-full ${
                          resolvedMedia.fit === 'contain' ? 'object-contain bg-black' : 'object-cover'
                        } transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100 will-change-transform ${getFocalClass(
                          resolvedMedia.focalPoint
                        )}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101318] via-[#101318]/55 to-transparent pointer-events-none" />
                    </div>

                    <div className={`absolute inset-x-0 bottom-0 ${device === 'mobile' ? 'p-4' : 'p-5'} text-white`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="size-1 rounded-full bg-[#2563EB]" aria-hidden="true" />
                        <span className="text-[10px] font-mono tracking-wider text-[#38BDF8] uppercase">
                          Discipline
                        </span>
                      </div>
                      <h3 className={`font-display ${device === 'mobile' ? 'text-lg' : 'text-xl'} font-black uppercase tracking-wider text-white`}>
                        {card.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#CBD5E1] leading-relaxed [text-wrap:pretty]">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
