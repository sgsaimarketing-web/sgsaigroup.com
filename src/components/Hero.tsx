import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play, Pause, Volume2, VolumeX, ImageOff } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import {
  getAspectRatioClass,
  getFocalClass,
  resolveMediaForDevice,
  resolveSectionLayoutForDevice,
} from '../utils/responsiveMedia.ts';

interface HeroProps {
  onOpenShowreel: () => void;
  shouldPauseBackground?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenShowreel,
  shouldPauseBackground = false,
}) => {
  const { siteData, isAuthorized, isEditorOpen, previewDevice } = useSiteContent();
  const device = useEffectiveDevice();
  const hero = siteData.hero;
  const config = siteData.config;

  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userPausedRef = useRef(false);

  const isSimulatedDevice =
    isAuthorized && isEditorOpen && (previewDevice === 'tablet' || previewDevice === 'mobile');

  const heroImage = hero.backgroundImage || config.heroImage || '/assets/nira-official.webp';
  const activeVideoSrc = hero.backgroundVideo;
  const isVideo = Boolean(activeVideoSrc) && !videoError;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mq.matches);
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [heroImage]);

  useEffect(() => {
    setVideoError(false);
  }, [activeVideoSrc]);

  // Manage muted autoplay, reduced-motion respect, and automatic modal audio handoff
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    if (shouldPauseBackground) {
      video.pause();
      if (!video.muted) {
        video.muted = true;
        setIsMuted(true);
      }
      setIsPlaying(false);
      return;
    }

    if (prefersReducedMotion || userPausedRef.current) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    video.muted = isMuted;
    video
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        video.muted = true;
        setIsMuted(true);
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });
  }, [isVideo, shouldPauseBackground, prefersReducedMotion, activeVideoSrc, isMuted]);

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setVideoError(true));
        });
    } else {
      userPausedRef.current = true;
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    if (video) {
      video.muted = nextMuted;
      if (!nextMuted && video.paused) {
        userPausedRef.current = false;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            setIsMuted(true);
          });
      }
    }
    setIsMuted(nextMuted);
  }, [isMuted]);

  const resolvedMedia = resolveMediaForDevice(
    device,
    {
      aspectRatio: '16:9',
      fit: hero.backgroundFit || 'cover',
      focalPoint: hero.backgroundFocalPoint || 'center',
      heightScale: 'standard',
    },
    hero.responsiveMedia,
    {
      mobile: { aspectRatio: '16:9', focalPoint: 'center', heightScale: 'standard', fit: 'cover' },
      tablet: { aspectRatio: '16:9', focalPoint: 'center', heightScale: 'standard', fit: 'cover' },
      laptop: { aspectRatio: '16:9', focalPoint: 'center', heightScale: 'standard', fit: 'cover' },
    }
  );

  const resolvedLayout = resolveSectionLayoutForDevice(device, hero.responsiveLayout, {
    mobile: { paddingY: 'compact' },
    tablet: { paddingY: 'standard' },
    laptop: { paddingY: 'standard' },
  });

  const fitClass = resolvedMedia.fit === 'contain' ? 'object-contain bg-black' : 'object-cover';
  const focalClass = getFocalClass(resolvedMedia.focalPoint);

  const sectionMinHeight =
    device === 'mobile'
      ? 'min-h-[auto]'
      : device === 'tablet'
      ? resolvedMedia.heightScale === 'compact'
        ? 'min-h-[560px]'
        : resolvedMedia.heightScale === 'tall'
        ? 'min-h-[760px]'
        : 'min-h-[650px]'
      : resolvedMedia.heightScale === 'compact'
      ? 'min-h-[640px]'
      : resolvedMedia.heightScale === 'tall'
      ? 'min-h-screen'
      : 'min-h-[88svh]';

  const mobileAspectClass =
    resolvedMedia.heightScale === 'tall'
      ? 'aspect-[4/3]'
      : resolvedMedia.aspectRatio && resolvedMedia.aspectRatio !== 'auto'
      ? getAspectRatioClass(resolvedMedia.aspectRatio)
      : 'aspect-video';

  const contentPaddingTop =
    device === 'mobile'
      ? 'pt-3'
      : device === 'tablet'
      ? resolvedLayout.paddingY === 'compact'
        ? 'pt-10'
        : resolvedLayout.paddingY === 'spacious'
        ? 'pt-20'
        : 'pt-14'
      : resolvedLayout.paddingY === 'compact'
      ? 'pt-10'
      : resolvedLayout.paddingY === 'spacious'
      ? 'pt-24'
      : 'pt-16';

  const contentPaddingBottom =
    device === 'mobile'
      ? resolvedLayout.paddingY === 'spacious'
        ? 'pb-12'
        : 'pb-8'
      : 'pb-8';

  const titleClass =
    device === 'mobile'
      ? 'text-[2.25rem] leading-[0.95] tracking-[-0.03em]'
      : device === 'tablet'
      ? 'text-[3.25rem] leading-[0.94] tracking-[-0.035em]'
      : 'text-6xl xl:text-[5rem] leading-[0.92] tracking-[-0.035em]';

  const motionTimingClass =
    hero.animationSpeed === 'subtle'
      ? 'transition-all duration-1000 ease-out'
      : hero.animationSpeed === 'dynamic'
      ? 'transition-all duration-200 ease-out'
      : 'transition-all duration-500 ease-out';

  const renderTeaserMedia = () => {
    if (isVideo) {
      return (
        <video
          ref={videoRef}
          src={activeVideoSrc}
          poster={heroImage}
          autoPlay={!prefersReducedMotion}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoError(true)}
          className={`h-full w-full ${fitClass} ${focalClass}`}
        />
      );
    }

    if (!imageError) {
      return (
        <img
          src={heroImage}
          alt="NIRA AI world representing SGS AI Marketing creative and automation capabilities"
          referrerPolicy="no-referrer"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className={`h-full w-full ${fitClass} ${focalClass}`}
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center bg-[#151922] p-8 text-center text-[#94A3B8]"
        aria-label="NIRA visual fallback"
      >
        <ImageOff className="size-12 text-[#2563EB]/50 mb-3" />
        <p className="text-sm font-semibold text-white">NIRA Showcase Reel</p>
      </div>
    );
  };

  const renderVideoControls = (compactMobile = false) => {
    if (!isVideo) return null;
    return (
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Hero teaser video controls"
      >
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause teaser video' : 'Play teaser video'}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-[#101318]/80 px-3 ${
            compactMobile ? 'min-h-[44px] px-3.5 text-[11px]' : 'min-h-[40px] px-3.5 text-xs'
          } font-semibold text-white backdrop-blur-md transition-colors hover:border-[#38BDF8] hover:bg-[#101318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer whitespace-nowrap shrink-0`}
        >
          {isPlaying ? (
            <>
              <Pause className="size-3.5 shrink-0" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="size-3.5 fill-white shrink-0" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleMute}
          aria-pressed={!isMuted}
          aria-label={isMuted ? 'Unmute teaser video audio' : 'Mute teaser video audio'}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 ${
            compactMobile ? 'min-h-[44px] px-3.5 text-[11px]' : 'min-h-[40px] px-3.5 text-xs'
          } font-semibold backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer whitespace-nowrap shrink-0 ${
            isMuted
              ? 'border-white/25 bg-[#101318]/80 text-white hover:border-[#38BDF8] hover:bg-[#101318]'
              : 'border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="size-3.5 text-[#CBD5E1] shrink-0" />
              <span>Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="size-3.5 text-white shrink-0" />
              <span>Sound On</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <EditableBlock section="hero" label="Hero Section">
      <section
        id="home"
        className={`hero relative overflow-hidden bg-[#101318] ${
          isSimulatedDevice
            ? 'pt-0'
            : device === 'mobile'
            ? 'pt-16'
            : device === 'tablet'
            ? 'pt-[72px]'
            : 'pt-20'
        } text-white ${sectionMinHeight} flex flex-col justify-between`}
      >
        {/* Mobile: Dedicated clean 16:9 widescreen teaser stage above editorial copy */}
        {device === 'mobile' ? (
          <div className={`relative w-full ${mobileAspectClass} overflow-hidden bg-black`}>
            <div className="absolute inset-0 pointer-events-none select-none">
              {renderTeaserMedia()}
            </div>
            <div className="hero-shade-mobile absolute inset-0 pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-3 right-4 z-20">{renderVideoControls(true)}</div>
          </div>
        ) : (
          /* Laptop & Tablet: Full-bleed widescreen cinema backdrop + directional contrast scrim */
          <>
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
              {renderTeaserMedia()}
            </div>
            <div
              className={`${device === 'tablet' ? 'hero-shade-tablet' : 'hero-shade'} absolute inset-0 pointer-events-none`}
              aria-hidden="true"
            />
          </>
        )}

        {/* Hero Content Grid matching Section 01 */}
        <div
          className={`relative mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] ${
            device === 'mobile' ? 'px-5 -mt-3' : 'px-6 lg:px-8'
          } z-10 flex-1`}
        >
          <div
            className={`flex flex-col justify-center ${contentPaddingTop} ${contentPaddingBottom} ${
              device === 'tablet' ? 'max-w-xl' : 'max-w-2xl'
            }`}
          >
            {/* Index 01 & Eyebrow */}
            <div className={`animate-rise flex items-center gap-2.5 sm:gap-3 ${motionTimingClass}`}>
              <span className="font-display text-xs font-bold text-[#2563EB]">01</span>
              <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
              <p
                className={`hero-eyebrow eyebrow text-[#CBD5E1] ${
                  device === 'mobile'
                    ? 'text-[10px] tracking-[0.14em]'
                    : 'text-[11px] tracking-[0.2em]'
                } font-semibold uppercase`}
              >
                {hero.eyebrow}
              </p>
            </div>

            {/* Master Headline with Device-Tailored Scale */}
            <h1
              className={`mt-4 sm:mt-6 font-display font-black uppercase ${titleClass} ${motionTimingClass} text-white [text-wrap:balance]`}
            >
              {(hero.headlineLines && hero.headlineLines.length > 0
                ? hero.headlineLines
                : ['WE BUILD WHAT', 'MOVES BUSINESS', 'FORWARD.']
              ).map((line, idx, arr) => (
                <span
                  key={`${idx}-${line}`}
                  className={`block hero-line ${motionTimingClass} ${
                    idx === arr.length - 1
                      ? 'text-[#38BDF8]'
                      : idx === 1
                      ? 'text-white/95'
                      : ''
                  }`}
                >
                  {line}
                </span>
              ))}
            </h1>

            {/* Subtitle Paragraph & Primary CTAs */}
            <div className={`hero-support animate-rise mt-4 sm:mt-6 max-w-xl ${motionTimingClass}`}>
              <p
                className={`${
                  device === 'mobile'
                    ? 'text-sm leading-relaxed'
                    : device === 'tablet'
                    ? 'text-base leading-relaxed'
                    : 'text-base md:text-lg leading-relaxed'
                } text-[#E2E8F0] font-normal [text-wrap:pretty]`}
              >
                {hero.supportParagraph}
              </p>

              <div
                className={`mt-6 sm:mt-8 flex ${
                  device === 'mobile' ? 'flex-col items-stretch gap-3' : 'flex-wrap items-center gap-4'
                }`}
              >
                <a
                  href={hero.primaryCta.href || '#our-work'}
                  className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#2563EB] px-6 sm:px-7 py-3.5 min-h-[46px] text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#1D4ED8] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] whitespace-nowrap"
                >
                  <span>{hero.primaryCta.label}</span>
                  <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={onOpenShowreel}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/25 bg-[#101318]/65 px-5 sm:px-6 py-3.5 min-h-[46px] text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer whitespace-nowrap"
                >
                  <span>{hero.secondaryCta.label}</span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#2563EB] transition-colors shrink-0">
                    <Play className="size-2.5 fill-white text-white ml-0.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Signature Row + Widescreen Video Controls on Laptop/Tablet */}
          <div
            className={`${
              device === 'mobile'
                ? 'mt-4 pt-4 pb-5 flex-col items-start gap-2'
                : 'mt-6 pt-5 pb-5 items-center justify-between gap-4'
            } flex border-t border-white/[0.1]`}
          >
            <div className="flex items-center gap-2.5 text-[10px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#CBD5E1]">
              <span>{config.positioning || 'Creative Intelligence × AI Engineering'}</span>
            </div>

            <div className="flex items-center gap-5">
              {device !== 'mobile' && renderVideoControls(false)}

              <div className={device === 'mobile' ? 'text-left' : 'text-right'}>
                <p className="font-display font-extrabold text-xs sm:text-sm tracking-wider text-white">
                  {hero.niraBadge.title}
                </p>
                <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#CBD5E1] font-medium uppercase">
                  {hero.niraBadge.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
