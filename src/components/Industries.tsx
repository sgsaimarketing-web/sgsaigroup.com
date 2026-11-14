import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

interface IndustriesProps {
  onSelectCategory?: (categoryId: string) => void;
}

const INDUSTRY_TO_WORK_CATEGORY: Record<string, string> = {
  fmcg: 'brand-campaigns',
  industrial: 'corporate-solutions',
  retail: 'packaging-experience',
  sme: 'ai-systems',
  distribution: 'corporate-solutions',
};

export const Industries: React.FC<IndustriesProps> = ({ onSelectCategory }) => {
  const { siteData } = useSiteContent();
  const device = useEffectiveDevice();
  const industries = siteData.industries;
  const [startIndex, setStartIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const items = industries.items;

  const layout = resolveSectionLayoutForDevice(device, industries.responsiveLayout, {
    mobile: { paddingY: 'compact' },
    tablet: { paddingY: 'standard' },
    laptop: { paddingY: 'standard' },
  });

  const paddingClass = getSectionPaddingClass(device, layout.paddingY);
  const horizontalPad = device === 'mobile' ? 'px-5' : 'px-6 lg:px-8';

  const scrollToIndex = (idx: number) => {
    const nextIdx = Math.max(0, Math.min(idx, items.length - 1));
    setStartIndex(nextIdx);
    if (scrollContainerRef.current) {
      const card = scrollContainerRef.current.children[nextIdx] as HTMLElement;
      if (card) {
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }
  };

  const handlePrev = () => {
    scrollToIndex(startIndex > 0 ? startIndex - 1 : items.length - 1);
  };

  const handleNext = () => {
    scrollToIndex(startIndex < items.length - 1 ? startIndex + 1 : 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    const scrollLeft = container.scrollLeft;
    let closestIdx = 0;
    let minDistance = Infinity;

    children.forEach((child, idx) => {
      const dist = Math.abs(child.offsetLeft - container.offsetLeft - scrollLeft);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== startIndex) {
      setStartIndex(closestIdx);
    }
  };

  const cardWidthClass =
    device === 'mobile'
      ? 'w-[80vw] max-w-[310px]'
      : device === 'tablet'
      ? 'w-[46%] min-w-[280px]'
      : 'w-[31%] min-w-[300px] max-w-[360px]';

  return (
    <EditableBlock section="industries" label="Industries Section">
      <section
        id="industries"
        className={`bg-[#F8FAFC] text-[#101318] scroll-mt-20 ${paddingClass} overflow-hidden border-b border-black/[0.06]`}
      >
        <div className={`mx-auto max-w-7xl ${horizontalPad} reveal`}>
          {/* Header Block matching Mockup Section 03 */}
          <div className={`grid gap-6 sm:gap-8 ${device === 'laptop' ? 'grid-cols-12 items-end' : 'grid-cols-1'}`}>
            <div className={device === 'laptop' ? 'col-span-6' : ''}>
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {industries.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{industries.eyebrow}</span>
              </div>

              <h2
                className={`mt-5 sm:mt-6 font-display ${
                  device === 'mobile'
                    ? 'text-3xl leading-[1.08]'
                    : device === 'tablet'
                    ? 'text-4xl leading-[1.06]'
                    : 'text-5xl leading-[1.06]'
                } font-extrabold tracking-[-0.03em] text-[#101318] [text-wrap:balance]`}
              >
                {industries.headlineMain}{' '}
                <span className="text-[#2563EB] block sm:inline">
                  {industries.headlineAccent}
                </span>
              </h2>
            </div>

            <div
              className={`${
                device === 'laptop' ? 'col-span-6' : ''
              } flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 sm:gap-6`}
            >
              <p className="max-w-md text-sm md:text-base leading-relaxed text-[#64748B] [text-wrap:pretty]">
                {industries.description}
              </p>

              {/* Slider Navigation Buttons with Numeral Indicator */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs font-semibold text-[#64748B] tabular-nums">
                  {startIndex + 1 < 10 ? `0${startIndex + 1}` : startIndex + 1} / {items.length < 10 ? `0${items.length}` : items.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous industry"
                    className={`flex ${
                      device === 'laptop' ? 'size-10' : 'size-11'
                    } items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95`}
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next industry"
                    className={`flex ${
                      device === 'laptop' ? 'size-10' : 'size-11'
                    } items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95`}
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Slider Tracks with Native Touch Scroll-Snap */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`mt-8 sm:mt-12 flex ${
              device === 'mobile' ? 'gap-4 -mx-5 px-5' : 'gap-6 -mx-6 px-6'
            } overflow-x-auto pb-4 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth`}
          >
            {items.map((item, idx) => {
              const resolvedMedia = resolveMediaForDevice(
                device,
                {
                  aspectRatio: item.cropAspect && item.cropAspect !== 'auto' ? item.cropAspect : '16:10',
                  fit: 'cover',
                  focalPoint: item.focalPoint || 'center',
                },
                item.responsiveMedia,
                {
                  mobile: { aspectRatio: '4:3' },
                  tablet: { aspectRatio: '16:10' },
                  laptop: { aspectRatio: '16:10' },
                }
              );

              const targetCategory = INDUSTRY_TO_WORK_CATEGORY[item.id] || 'brand-campaigns';

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => onSelectCategory?.(targetCategory)}
                  aria-label={`Explore case studies for ${item.title}`}
                  className={`group relative flex-none ${cardWidthClass} overflow-hidden rounded-md bg-white border border-black/[0.08] shadow-sm hover:shadow-xl hover:border-[#2563EB]/40 transition-all duration-300 snap-start flex flex-col justify-between text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]`}
                >
                  {/* Photo Container */}
                  <div className={`${getAspectRatioClass(resolvedMedia.aspectRatio)} w-full overflow-hidden bg-black/5 relative`}>
                    <img
                      src={item.image}
                      alt={item.imageAlt || item.title}
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={300}
                      className={`h-full w-full ${
                        resolvedMedia.fit === 'contain' ? 'object-contain bg-black' : 'object-cover'
                      } transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform ${getFocalClass(
                        resolvedMedia.focalPoint
                      )}`}
                    />
                    <div className="absolute top-2.5 right-2.5 rounded bg-black/60 px-2 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-sm">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                  </div>

                  {/* Card Content with Action Link */}
                  <div className={`${device === 'mobile' ? 'p-4' : 'p-5'} flex flex-col justify-between flex-1 w-full`}>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#101318] group-hover:text-[#2563EB] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed [text-wrap:pretty]">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between w-full">
                      <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider">
                        Explore Sector Work
                      </span>
                      <span className="flex size-7 items-center justify-center rounded-full border border-black/15 text-[#101318] group-hover:border-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
