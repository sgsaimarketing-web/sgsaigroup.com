import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
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
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [mutedCards, setMutedCards] = useState<Record<string, boolean>>({});
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
    target.src = '/assets/work/nelson-diamond.png';
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

  const getVideoSrc = (project: CaseStudy): string => {
    if (
      project.videoUrl &&
      (project.videoUrl.endsWith('.mp4') ||
        project.videoUrl.endsWith('.webm') ||
        project.videoUrl.startsWith('blob:') ||
        project.videoUrl.startsWith('/assets/'))
    ) {
      return project.videoUrl;
    }
    return '/assets/nira-loop.mp4';
  };

  const getCardPoster = (project: CaseStudy): string => {
    if (project.posterUrl && !isVideoUrl(project.posterUrl)) {
      return project.posterUrl;
    }
    if (project.coverImage && !isVideoUrl(project.coverImage)) {
      return project.coverImage;
    }
    return '/assets/work/nelson-trading.png';
  };

  const handleToggleCardPlay = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    setPlayingCardId((prev) => (prev === projId ? null : projId));
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
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
              <p className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">
                {workCategories.find((c) => c.id === activeCategory)?.label} ({filteredProjects.length} Verified Deployments)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[#64748B] tabular-nums">
                0{carouselIndex + 1} / 0{Math.max(1, filteredProjects.length)}
              </span>
              <div className="flex items-center gap-1.5">
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
          </div>

          {/* Responsive Sliding 9:16 Vertical Cards Track */}
          <div
            ref={trackRef}
            className="mt-4 flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {filteredProjects.map((project, idx) => {
              const isCardPlaying = playingCardId === project.id;
              const isCardMuted = mutedCards[project.id] !== false;

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group relative flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start rounded-xl bg-[#0F1218] border border-black/[0.08] shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-end aspect-[9/16]"
                >
                  {/* 9:16 Full-bleed Vertical Video / Poster / Cover */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-900">
                    {project.hasVideo && isCardPlaying ? (
                      <video
                        key={`vid-${project.id}`}
                        src={getVideoSrc(project)}
                        poster={getCardPoster(project)}
                        autoPlay
                        playsInline
                        loop
                        muted={isCardMuted}
                        className={`h-full w-full ${
                          project.coverFit === 'contain' ? 'object-contain bg-black' : 'object-cover'
                        } ${getFocalClass(project.coverFocalPoint)}`}
                      />
                    ) : (
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
                    )}
                  </div>

                  {/* Top Overlay Meta: Index & Video Badge / Sound Control */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-sm border border-white/10 pointer-events-none">
                      {project.index || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`)}
                    </span>

                    {project.hasVideo && (
                      <div className="flex items-center gap-1.5">
                        {isCardPlaying && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMutedCards((prev) => ({ ...prev, [project.id]: !prev[project.id] }));
                            }}
                            aria-label={isCardMuted ? 'Unmute video audio' : 'Mute video audio'}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 hover:bg-black text-white backdrop-blur-sm border border-white/20 shadow text-[10px] font-mono cursor-pointer transition"
                          >
                            {isCardMuted ? (
                              <>
                                <VolumeX className="size-3 text-white/70" />
                                <span>Muted</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="size-3 text-emerald-400" />
                                <span>Sound On</span>
                              </>
                            )}
                          </button>
                        )}

                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#2563EB]/85 text-white backdrop-blur-sm border border-white/20 shadow pointer-events-none">
                          {isCardPlaying ? (
                            <span className="flex items-center gap-1 text-emerald-300">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Playing
                            </span>
                          ) : (
                            <>
                              <Play className="size-2.5 fill-white" /> Video Reel
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Center Play / Pause Button for Video Projects */}
                  {project.hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <button
                        type="button"
                        onClick={(e) => handleToggleCardPlay(e, project.id)}
                        aria-label={isCardPlaying ? 'Pause video reel' : 'Play video reel'}
                        className={`flex size-14 items-center justify-center rounded-full border border-white/40 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
                          isCardPlaying
                            ? 'bg-black/60 hover:bg-[#2563EB] opacity-0 group-hover:opacity-100 hover:scale-110'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-110 text-white'
                        }`}
                      >
                        {isCardPlaying ? (
                          <Pause className="size-6 fill-white text-white" />
                        ) : (
                          <Play className="size-6 fill-white ml-0.5 text-white" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bottom Scrim & Content Info Overlay */}
                  <div className="relative z-10 p-5 bg-gradient-to-t from-black via-black/75 via-50% to-transparent pt-20 flex flex-col justify-end">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8] pointer-events-none">
                      <span>{project.categoryLabel}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/70">{project.sector}</span>
                    </div>

                    <h3 className="mt-1.5 font-display text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors leading-snug line-clamp-2 pointer-events-none">
                      {project.title}
                    </h3>

                    <p className="mt-1 text-xs text-white/70 line-clamp-2 leading-relaxed pointer-events-none">
                      {project.subtitle}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] group-hover:text-white transition-colors">
                        <span>View Project Dossier</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </div>

                      {project.hasVideo && isCardPlaying && (
                        <span className="text-[10px] text-white/60 font-mono">
                          Tap card for dossier
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};

