import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { CaseStudy } from '../data/siteContent.ts';
import { EditableBlock } from './editor/EditableBlock.tsx';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import {
  getAspectRatioClass,
  getFocalClass,
  getSectionPaddingClass,
  isVideoAssetUrl,
  resolveMediaForDevice,
  resolveSectionLayoutForDevice,
} from '../utils/responsiveMedia.ts';

interface SelectedWorkProps {
  onSelectProject: (project: CaseStudy) => void;
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  shouldPauseVideos?: boolean;
}

export const SelectedWork: React.FC<SelectedWorkProps> = ({
  onSelectProject,
  activeCategory: controlledCategory,
  onCategoryChange,
  shouldPauseVideos = false,
}) => {
  const { siteData } = useSiteContent();
  const device = useEffectiveDevice();
  const workCategories = siteData.workCategories;
  const caseStudies = siteData.caseStudies;

  const [internalCategory, setInternalCategory] = useState<string>(
    workCategories[0]?.id || 'brand-campaigns'
  );
  const activeCategory = controlledCategory || internalCategory;

  const setCategory = (categoryId: string) => {
    setInternalCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [mutedCards, setMutedCards] = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement | null>(null);

  const filteredProjects = caseStudies.filter((p) => p.categoryId === activeCategory);

  const layout = resolveSectionLayoutForDevice(device, siteData.config.selectedWorkLayout, {
    mobile: { paddingY: 'compact', mobileLayout: 'carousel' },
    tablet: { paddingY: 'standard', columnsTablet: 2 },
    laptop: { paddingY: 'standard', columnsLaptop: 4 },
  });

  const paddingClass = getSectionPaddingClass(device, layout.paddingY);
  const horizontalPad = device === 'mobile' ? 'px-5' : 'px-6 lg:px-8';

  // Reset scroll, index, and active video playback when category changes
  useEffect(() => {
    setCarouselIndex(0);
    setPlayingCardId(null);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Pause any inline playing card video when a theater modal opens
  useEffect(() => {
    if (shouldPauseVideos) {
      setPlayingCardId(null);
    }
  }, [shouldPauseVideos]);

  const scrollToCard = (index: number) => {
    const container = trackRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement | undefined;
    if (card) {
      container.scrollTo({
        left: Math.max(0, card.offsetLeft - container.offsetLeft),
        behavior: 'smooth',
      });
    }
  };

  const handleTrackScroll = (e: React.UIEvent<HTMLDivElement>) => {
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

    if (closestIdx !== carouselIndex) {
      setCarouselIndex(closestIdx);
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

  const getVideoSrc = (project: CaseStudy): string => {
    if (project.videoUrl && isVideoAssetUrl(project.videoUrl)) {
      return project.videoUrl;
    }
    return '/assets/nira-loop.mp4';
  };

  const getCardPoster = (project: CaseStudy): string => {
    if (project.posterUrl && !isVideoAssetUrl(project.posterUrl)) {
      return project.posterUrl;
    }
    if (project.coverImage && !isVideoAssetUrl(project.coverImage)) {
      return project.coverImage;
    }
    return '/assets/work/nelson-trading.png';
  };

  const handleToggleCardPlay = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    setPlayingCardId((prev) => (prev === projId ? null : projId));
  };

  const isMobileCarousel = device === 'mobile' && layout.mobileLayout === 'carousel';
  const showCarouselTrack = device !== 'mobile' || isMobileCarousel;

  const trackLayoutClass =
    device === 'mobile'
      ? isMobileCarousel
        ? 'mt-4 flex gap-4 overflow-x-auto pb-5 pt-2 -mx-5 px-5 no-scrollbar scroll-smooth snap-x snap-mandatory'
        : layout.mobileLayout === 'grid-2'
        ? 'mt-4 grid grid-cols-2 gap-3 pb-4 pt-2'
        : 'mt-4 grid grid-cols-1 gap-4 pb-4 pt-2'
      : 'mt-4 flex gap-5 lg:gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory';

  const cardWidthClass =
    device === 'mobile'
      ? isMobileCarousel
        ? 'flex-none w-[78vw] max-w-[300px] snap-start'
        : 'w-full'
      : device === 'tablet'
      ? layout.columnsTablet === 3
        ? 'flex-none w-[calc(33.333%-14px)] snap-start'
        : 'flex-none w-[calc(50%-10px)] snap-start'
      : layout.columnsLaptop === 2
      ? 'flex-none w-[calc(50%-12px)] snap-start'
      : layout.columnsLaptop === 3
      ? 'flex-none w-[calc(33.333%-16px)] snap-start'
      : 'flex-none w-[calc(25%-18px)] snap-start';

  return (
    <EditableBlock section="work" label="Selected Work Section">
      <section
        id="our-work"
        className={`bg-white text-[#101318] scroll-mt-20 ${paddingClass} border-b border-black/[0.06] overflow-hidden`}
      >
        <div className={`mx-auto max-w-7xl ${horizontalPad} reveal`}>
          {/* Header Block matching Mockup Section 05 */}
          <div
            className={`flex ${
              device === 'laptop' ? 'flex-row items-end justify-between' : 'flex-col'
            } gap-6 pb-8 sm:pb-10 border-b border-black/[0.08]`}
          >
            <div>
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="font-display text-xs font-bold text-[#2563EB]">05</span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">SELECTED WORK</span>
              </div>

              <h2
                className={`mt-5 sm:mt-6 font-display ${
                  device === 'mobile'
                    ? 'text-3xl leading-[1.06]'
                    : device === 'tablet'
                    ? 'text-4xl leading-[1.05]'
                    : 'text-5xl leading-[1.04]'
                } font-extrabold tracking-[-0.03em] text-[#101318]`}
              >
                Ideas that create <span className="block">real-world impact.</span>
              </h2>
            </div>

            {/* Category Filters: Single-row horizontal scroll on mobile, wrapped row on tablet/laptop */}
            <div
              className={
                device === 'mobile'
                  ? 'flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1 snap-x'
                  : 'flex flex-wrap items-center gap-2'
              }
            >
              {workCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setCarouselIndex(0);
                    }}
                    className={`px-4 py-2.5 min-h-[40px] text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 snap-start ${
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
          <div className="flex items-center justify-between pt-6 sm:pt-8 pb-3 sm:pb-4 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-2 rounded-full bg-[#2563EB] shrink-0" aria-hidden="true" />
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#64748B] font-semibold truncate">
                {workCategories.find((c) => c.id === activeCategory)?.label} ({filteredProjects.length} Verified Deployments)
              </p>
            </div>

            {showCarouselTrack && (
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <span className="font-mono text-xs font-semibold text-[#64748B] tabular-nums">
                  {carouselIndex + 1 < 10 ? `0${carouselIndex + 1}` : carouselIndex + 1} /{' '}
                  {filteredProjects.length < 10
                    ? `0${Math.max(1, filteredProjects.length)}`
                    : filteredProjects.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous case studies"
                    className={`flex ${
                      device === 'laptop' ? 'size-9' : 'size-11'
                    } items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95`}
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next case studies"
                    className={`flex ${
                      device === 'laptop' ? 'size-9' : 'size-11'
                    } items-center justify-center rounded-full border border-black/15 bg-white text-[#101318] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer shadow-sm active:scale-95`}
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Device-Adapted Showcase Cards Track */}
          <div
            ref={trackRef}
            onScroll={showCarouselTrack ? handleTrackScroll : undefined}
            className={trackLayoutClass}
          >
            {filteredProjects.map((project, idx) => {
              const isCardPlaying = playingCardId === project.id;
              const isCardMuted = mutedCards[project.id] !== false;

              const resolvedMedia = resolveMediaForDevice(
                device,
                {
                  aspectRatio: '9:16',
                  fit: project.coverFit || 'cover',
                  focalPoint: project.coverFocalPoint || 'center',
                },
                project.responsiveMedia,
                {
                  mobile: {
                    aspectRatio: layout.mobileLayout === 'grid-2' ? '4:5' : '3:4',
                  },
                  tablet: {
                    aspectRatio: '4:5',
                  },
                  laptop: {
                    aspectRatio: '9:16',
                  },
                }
              );

              const aspectClass = getAspectRatioClass(resolvedMedia.aspectRatio);
              const fitClass = resolvedMedia.fit === 'contain' ? 'object-contain bg-black' : 'object-cover';
              const focalClass = getFocalClass(resolvedMedia.focalPoint);
              const compactMobileCard = device === 'mobile' && layout.mobileLayout === 'grid-2';

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`group relative ${cardWidthClass} rounded-xl bg-[#0F1218] border border-black/[0.08] shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-end ${aspectClass}`}
                >
                  {/* Full-bleed Media / Video Poster / Cover */}
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
                        onError={() => setPlayingCardId(null)}
                        className={`h-full w-full ${fitClass} ${focalClass}`}
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
                        className={`h-full w-full ${fitClass} ${focalClass} transition-transform duration-700 ease-out group-hover:scale-105`}
                      />
                    )}
                  </div>

                  {/* Top Overlay Meta: Index & Video Badge / Sound Control */}
                  <div className={`absolute ${compactMobileCard ? 'top-2.5 inset-x-2.5' : 'top-4 inset-x-4'} flex items-center justify-between z-20 gap-1`}>
                    <span className="font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-sm border border-white/10 pointer-events-none">
                      {project.index || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`)}
                    </span>

                    {project.hasVideo && (
                      <div className="flex items-center gap-1">
                        {isCardPlaying && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMutedCards((prev) => ({ ...prev, [project.id]: !prev[project.id] }));
                            }}
                            aria-label={isCardMuted ? 'Unmute video audio' : 'Mute video audio'}
                            className="flex items-center gap-1 px-2 py-1 min-h-[28px] rounded bg-black/75 hover:bg-black text-white backdrop-blur-sm border border-white/20 shadow text-[10px] font-mono cursor-pointer transition"
                          >
                            {isCardMuted ? (
                              <>
                                <VolumeX className="size-3 text-white/70" />
                                {!compactMobileCard && <span>Muted</span>}
                              </>
                            ) : (
                              <>
                                <Volume2 className="size-3 text-emerald-400" />
                                {!compactMobileCard && <span>Sound On</span>}
                              </>
                            )}
                          </button>
                        )}

                        {!compactMobileCard && (
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
                        )}
                      </div>
                    )}
                  </div>

                  {/* Interactive Center Play / Pause Button for Video Projects */}
                  {project.hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => handleToggleCardPlay(e, project.id)}
                        aria-label={isCardPlaying ? 'Pause video reel' : 'Play video reel'}
                        className={`pointer-events-auto flex ${
                          compactMobileCard ? 'size-11' : 'size-14'
                        } items-center justify-center rounded-full border border-white/40 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
                          isCardPlaying
                            ? device === 'laptop'
                              ? 'bg-black/60 hover:bg-[#2563EB] opacity-0 group-hover:opacity-100 hover:scale-110'
                              : 'bg-black/55 hover:bg-[#2563EB] opacity-85'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-110 text-white'
                        }`}
                      >
                        {isCardPlaying ? (
                          <Pause className={`${compactMobileCard ? 'size-4' : 'size-6'} fill-white text-white`} />
                        ) : (
                          <Play className={`${compactMobileCard ? 'size-4' : 'size-6'} fill-white ml-0.5 text-white`} />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bottom Scrim & Content Info Overlay */}
                  <div
                    className={`relative z-10 ${
                      compactMobileCard ? 'p-3 pt-12' : 'p-5 pt-20'
                    } bg-gradient-to-t from-black via-black/75 via-50% to-transparent flex flex-col justify-end`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8] pointer-events-none truncate">
                      <span className="truncate">{project.categoryLabel}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/70 shrink-0">{project.sector}</span>
                    </div>

                    <h3
                      className={`mt-1 font-display ${
                        compactMobileCard ? 'text-sm' : 'text-lg'
                      } font-bold text-white group-hover:text-[#38BDF8] transition-colors leading-snug line-clamp-2 pointer-events-none`}
                    >
                      {project.title}
                    </h3>

                    {!compactMobileCard && (
                      <p className="mt-1 text-xs text-white/70 line-clamp-2 leading-relaxed pointer-events-none">
                        {project.subtitle}
                      </p>
                    )}

                    <div className={`${compactMobileCard ? 'mt-2' : 'mt-3'} flex items-center justify-between`}>
                      <div className={`flex items-center gap-1.5 ${compactMobileCard ? 'text-[11px]' : 'text-xs'} font-bold text-[#38BDF8] group-hover:text-white transition-colors`}>
                        <span>{compactMobileCard ? 'View Dossier' : 'View Project Dossier'}</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </div>

                      {!compactMobileCard && project.hasVideo && isCardPlaying && (
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
