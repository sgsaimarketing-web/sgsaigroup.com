import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';

export const Industries: React.FC = () => {
  const { siteData } = useSiteContent();
  const industries = siteData.industries;
  const [startIndex, setStartIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const items = industries.items;

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
    const target = e.currentTarget;
    const cardWidth = 320;
    const index = Math.round(target.scrollLeft / cardWidth);
    if (index !== startIndex && index >= 0 && index < items.length) {
      setStartIndex(index);
    }
  };

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
    <EditableBlock section="industries" label="Industries Section">
      <section id="industries" className="bg-[#F8FAFC] text-[#101318] scroll-mt-20 py-24 md:py-32 overflow-hidden border-b border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 reveal">
          {/* Header Block matching Mockup Section 03 */}
          <div className="grid gap-8 lg:grid-cols-12 items-end justify-between">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {industries.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{industries.eyebrow}</span>
              </div>

              <h2 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-[-0.03em] text-[#101318] [text-wrap:balance]">
                {industries.headlineMain}{' '}
                <span className="text-[#2563EB] block sm:inline">
                  {industries.headlineAccent}
                </span>
              </h2>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <p className="max-w-md text-sm md:text-base leading-relaxed text-[#64748B] [text-wrap:pretty]">
                {industries.description}
              </p>

              {/* Slider Navigation Buttons with Numeral Indicator */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs font-semibold text-[#64748B] tabular-nums">
                  0{startIndex + 1} / 0{items.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous industry"
                    className="flex size-10 items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next industry"
                    className="flex size-10 items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95"
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
            className="mt-12 flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 -mx-6 px-6 no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group relative flex-none w-[270px] sm:w-[300px] md:w-[320px] overflow-hidden rounded-md bg-white border border-black/[0.08] shadow-sm hover:shadow-xl transition-all duration-300 snap-start flex flex-col justify-between"
              >
                {/* Photo Container */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-black/5 relative">
                  <img
                    src={item.image}
                    alt={item.imageAlt || item.title}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={300}
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform ${getFocalClass(
                      item.focalPoint
                    )}`}
                  />
                  <div className="absolute top-2.5 right-2.5 rounded bg-black/60 px-2 py-0.5 font-mono text-[9px] text-white/90 backdrop-blur-sm">
                    0{idx + 1}
                  </div>
                </div>

                {/* Card Content with Arrow Link matching Mockup */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#101318] group-hover:text-[#2563EB] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed [text-wrap:pretty]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider">
                      Strategic Vertical
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-full border border-black/15 text-[#101318] group-hover:border-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
