import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';

export const Industries: React.FC = () => {
  const { siteData } = useSiteContent();
  const industries = siteData.industries;
  const [startIndex, setStartIndex] = useState(0);

  const items = industries.items;

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, items.length - 1)));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
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

              <h2 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-[-0.03em] text-[#101318]">
                {industries.headlineMain}{' '}
                <span className="text-[#2563EB] block sm:inline">
                  {industries.headlineAccent}
                </span>
              </h2>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <p className="max-w-md text-sm md:text-base leading-relaxed text-[#64748B]">
                {industries.description}
              </p>

              {/* Slider Navigation Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous industry"
                  className="flex size-10 items-center justify-center rounded-full border border-black/20 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next industry"
                  className="flex size-10 items-center justify-center rounded-full border border-black/20 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Slider Tracks matching Mockup */}
          <div className="mt-12 overflow-x-auto pb-4 pt-2 -mx-6 px-6 no-scrollbar">
            <div
              className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${startIndex * 280}px)`,
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="group relative flex-none w-[270px] sm:w-[300px] md:w-[320px] overflow-hidden rounded-sm bg-white border border-black/[0.08] shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Photo Container */}
                  <div className="aspect-[16/10] w-full overflow-hidden bg-black/5">
                    <img
                      src={item.image}
                      alt={item.imageAlt || item.title}
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={300}
                      className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${getFocalClass(
                        item.focalPoint
                      )}`}
                    />
                  </div>

                  {/* Card Content with Arrow Link matching Mockup */}
                  <div className="p-5 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#101318] group-hover:text-[#2563EB] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <span className="flex size-7 items-center justify-center rounded-full border border-black/15 text-[#101318] group-hover:border-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
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
