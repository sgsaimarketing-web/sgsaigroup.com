import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { CaseStudy } from '../data/siteContent.ts';
import { EditableBlock } from './editor/EditableBlock.tsx';

interface SelectedWorkProps {
  onSelectProject: (project: CaseStudy) => void;
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({ onSelectProject }) => {
  const { siteData } = useSiteContent();
  const workCategories = siteData.workCategories;
  const caseStudies = siteData.caseStudies;

  const [activeCategory, setActiveCategory] = useState<string>(
    workCategories[0]?.id || 'brand-campaigns'
  );
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const filteredProjects = caseStudies.filter((p) => p.categoryId === activeCategory);

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filteredProjects.length - 1)));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev < filteredProjects.length - 1 ? prev + 1 : 0));
  };

  const getFocalClass = (f?: string) => {
    switch (f) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      case 'left':
        return 'object-left';
      case 'right':
        return 'object-right';
      default:
        return 'object-center';
    }
  };

  return (
    <EditableBlock section="work" label="Selected Work Section">
      <section id="our-work" className="bg-white text-[#101318] scroll-mt-20 py-24 md:py-32 border-b border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 reveal">
          {/* Header Block matching Mockup Section 05 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-black/[0.08]">
            <div>
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">05</span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">SELECTED WORK</span>
              </div>

              <h2 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.04] tracking-[-0.03em] text-[#101318]">
                Ideas that create <span className="block">real-world impact.</span>
              </h2>
            </div>

            {/* 4 Interactive Category Filters matching Mockup */}
            <div className="flex flex-wrap items-center gap-2">
              {workCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setCarouselIndex(0);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#101318]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel Header & Arrow Controls */}
          <div className="flex items-center justify-between pt-8 pb-4">
            <p className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">
              {workCategories.find((c) => c.id === activeCategory)?.label} ({filteredProjects.length} Verified Deployments)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous case studies"
                className="flex size-9 items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next case studies"
                className="flex size-9 items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Project Cards Grid matching Mockup Section 05 */}
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-sm bg-white border border-black/[0.08] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Media with Play Button Overlay */}
                  <div
                    className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => onSelectProject(project)}
                  >
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      width={640}
                      height={400}
                      className={`h-full w-full ${
                        project.coverFit === 'contain' ? 'object-contain' : 'object-cover'
                      } ${getFocalClass(project.coverFocalPoint)} transition-transform duration-700 ease-out group-hover:scale-105`}
                    />
                    {project.hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex size-10 items-center justify-center rounded-full bg-black/60 border border-white/30 backdrop-blur-sm text-white group-hover:bg-[#2563EB] group-hover:border-[#2563EB] transition-colors">
                          <Play className="size-4 fill-white ml-0.5" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="font-display text-base font-bold text-[#101318] group-hover:text-[#2563EB] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {project.categoryLabel} · {project.sector}
                    </p>
                  </div>
                </div>

                {/* View Project Button with Arrow matching Mockup */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer group-hover:underline"
                  >
                    <span>View Project</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
