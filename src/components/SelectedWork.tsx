import React, { useState, useRef, useEffect } from 'react';
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
  const trackRef = useRef<HTMLDivElement | null>(null);

  const filteredProjects = caseStudies.filter((p) => p.categoryId === activeCategory);

  // Reset scroll and index when category changes
  useEffect(() => {
    setCarouselIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const scrollToCard = (index: number) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  };

  const handlePrev = () => {
    const nextIdx = carouselIndex > 0 ? carouselIndex - 1 : Math.max(0, filteredProjects.length - 1);
    setCarouselIndex(nextIdx);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = carouselIndex < filteredProjects.length - 1 ? carouselIndex + 1 : 0;
    setCarouselIndex(nextIdx);
    scrollToCard(nextIdx);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = '/assets/work/luxury-fragrance.jpg';
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

  const isVideoUrl = (u?: string): boolean => {
    if (!u) return false;
    return (
      u.startsWith('data:video/') ||
      u.startsWith('blob:') ||
      u.endsWith('.mp4') ||
      u.endsWith('.webm')
    );
  };

  const getCardPoster = (project: CaseStudy): string => {
    if (project.posterUrl && !isVideoUrl(project.posterUrl)) {
      return project.posterUrl;
    }
    if (project.coverImage && !isVideoUrl(project.coverImage)) {
      return project.coverImage;
    }
    return '/assets/work/luxury-fragrance.jpg';
  };

  return (
    <EditableBlock section="work" label="Selected Work Section">
      <section id="our-work" className="bg-white text-[#101318] scroll-mt-20 py-24 md:py-32 border-b border-black/[0.06] overflow-hidden">
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
                className="flex size-9 items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next case studies"
                className="flex size-9 items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Responsive Sliding 9:16 Vertical Cards Track */}
          <div
            ref={trackRef}
            className="mt-4 flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start rounded-xl bg-[#0F1218] border border-black/[0.08] shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-end aspect-[9/16]"
              >
                {/* 9:16 Full-bleed Vertical Poster / Cover */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-900">
                  <img
                    src={getCardPoster(project)}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    width={540}
                    height={960}
                    onError={handleImageError}
                    className={`h-full w-full ${
                      project.coverFit === 'contain' ? 'object-contain bg-black' : 'object-cover'
                    } ${getFocalClass(project.coverFocalPoint)} transition-transform duration-700 ease-out group-hover:scale-105`}
                  />
                </div>

                {/* Top Overlay Meta: Index & Video Badge */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-sm border border-white/10">
                    {project.index || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`)}
                  </span>
                  {project.hasVideo && (
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#2563EB]/85 text-white backdrop-blur-sm border border-white/20 shadow">
                      <Play className="size-2.5 fill-white" /> Video Reel
                    </span>
                  )}
                </div>

                {/* Center Play Icon for Video Projects */}
                {project.hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="flex size-14 items-center justify-center rounded-full bg-black/60 border border-white/40 backdrop-blur-md text-white group-hover:bg-[#2563EB] group-hover:border-[#2563EB] group-hover:scale-110 transition-all duration-300 shadow-xl">
                      <Play className="size-6 fill-white ml-0.5" />
                    </span>
                  </div>
                )}

                {/* Bottom Scrim & Content Info Overlay */}
                <div className="relative z-10 p-5 bg-gradient-to-t from-black via-black/75 via-50% to-transparent pt-20 flex flex-col justify-end pointer-events-none">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8]">
                    <span>{project.categoryLabel}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/70">{project.sector}</span>
                  </div>

                  <h3 className="mt-1.5 font-display text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors leading-snug line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="mt-1 text-xs text-white/70 line-clamp-2 leading-relaxed">
                    {project.subtitle}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] group-hover:text-white transition-colors">
                    <span>View Project Dossier</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
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

