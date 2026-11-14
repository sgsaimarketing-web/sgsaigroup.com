import React, { useState } from 'react';
import { ArrowRight, Play, ImageOff } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import {
  getFocalClass,
  resolveMediaForDevice,
  resolveSectionLayoutForDevice,
} from '../utils/responsiveMedia.ts';

interface HeroProps {
  onOpenShowreel: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenShowreel }) => {
  const { siteData, isAuthorized, isEditorOpen, previewDevice } = useSiteContent();
  const device = useEffectiveDevice();
  const hero = siteData.hero;
  const config = siteData.config;
  const [imageError, setImageError] = useState(false);

  const isSimulatedDevice =
    isAuthorized && isEditorOpen && (previewDevice === 'tablet' || previewDevice === 'mobile');

  const heroImage = hero.backgroundImage || config.heroImage;
  const isVideo = !!hero.backgroundVideo;

  const resolvedMedia = resolveMediaForDevice(
    device,
    {
      aspectRatio: 'auto',
      fit: hero.backgroundFit || 'cover',
      focalPoint: hero.backgroundFocalPoint || 'center',
      heightScale: 'standard',
    },
    hero.responsiveMedia,
    {
      mobile: { focalPoint: 'top', heightScale: 'standard', fit: 'cover' },
      tablet: { focalPoint: 'center', heightScale: 'standard', fit: 'cover' },
      laptop: { focalPoint: 'center', heightScale: 'standard', fit: 'cover' },
    }
  );

  const resolvedLayout = resolveSectionLayoutForDevice(device, hero.responsiveLayout, {
    mobile: { paddingY: 'compact' },
    tablet: { paddingY: 'standard' },
    laptop: { paddingY: 'standard' },
  });

  const fitClass = resolvedMedia.fit === 'contain' ? 'object-contain' : 'object-cover';
  const focalClass = getFocalClass(resolvedMedia.focalPoint);

  // Device-specific Hero stage geometry & spacing
  const sectionMinHeight =
    device === 'mobile'
      ? 'min-h-[auto]'
      : device === 'tablet'
      ? resolvedMedia.heightScale === 'compact'
        ? 'min-h-[580px]'
        : resolvedMedia.heightScale === 'tall'
        ? 'min-h-[780px]'
        : 'min-h-[680px]'
      : resolvedMedia.heightScale === 'compact'
      ? 'min-h-[680px]'
      : resolvedMedia.heightScale === 'tall'
      ? 'min-h-screen'
      : 'min-h-[90svh]';

  const mobileStageHeight =
    resolvedMedia.heightScale === 'compact'
      ? 'h-[310px]'
      : resolvedMedia.heightScale === 'tall'
      ? 'h-[470px]'
      : 'h-[390px]';

  const mediaStageClass =
    device === 'mobile'
      ? `absolute top-0 inset-x-0 w-full ${mobileStageHeight}`
      : device === 'tablet'
      ? 'absolute inset-y-0 right-0 left-auto w-[68%] h-full'
      : 'absolute inset-y-0 right-0 left-auto w-[58%] h-full';

  const shadeClass =
    device === 'mobile'
      ? 'hero-shade-mobile'
      : device === 'tablet'
      ? 'hero-shade-tablet'
      : 'hero-shade';

  const contentPaddingTop =
    device === 'mobile'
      ? resolvedMedia.heightScale === 'compact'
        ? 'pt-[190px]'
        : resolvedMedia.heightScale === 'tall'
        ? 'pt-[320px]'
        : 'pt-[250px]'
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
      : 'pb-10';

  const titleClass =
    device === 'mobile'
      ? 'text-[2.35rem] leading-[0.95] tracking-[-0.03em]'
      : device === 'tablet'
      ? 'text-[3.4rem] leading-[0.93] tracking-[-0.035em]'
      : 'text-6xl xl:text-[5.25rem] leading-[0.92] tracking-[-0.035em]';

  return (
    <EditableBlock section="hero" label="Hero Section">
      <section
        id="home"
        className={`hero relative overflow-hidden bg-[#101318] ${
          isSimulatedDevice ? 'pt-0' : device === 'mobile' ? 'pt-16' : device === 'tablet' ? 'pt-[72px]' : 'pt-20'
        } text-white ${sectionMinHeight} flex flex-col justify-between`}
      >
        {/* NIRA Cinematic World Background / Video sized per active device */}
        <div className={`${mediaStageClass} overflow-hidden pointer-events-none select-none`}>
          {isVideo ? (
            <video
              src={hero.backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              className={`h-full w-full ${fitClass} ${focalClass}`}
            />
          ) : !imageError ? (
            <img
              src={heroImage}
              alt="NIRA overlooking connected futuristic city at sunset"
              width={941}
              height={1672}
              fetchPriority="high"
              decoding="async"
              className={`h-full w-full ${fitClass} ${focalClass}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center bg-[#151922] p-8 text-center text-[#94A3B8] border-l border-white/10"
              aria-label="NIRA visual placeholder"
            >
              <ImageOff className="size-12 text-[#2563EB]/50 mb-3" />
              <p className="text-sm font-semibold text-white">NIRA Hero Character</p>
            </div>
          )}
        </div>

        {/* Device-Tailored Cinematic Gradient Shade */}
        <div className={`${shadeClass} absolute inset-0 pointer-events-none`} aria-hidden="true" />

        {/* Hero Content Grid matching Mockup Section 01 */}
        <div
          className={`relative mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] ${
            device === 'mobile' ? 'px-5' : 'px-6 lg:px-8'
          } z-10 flex-1`}
        >
          <div
            className={`flex flex-col justify-center ${contentPaddingTop} ${contentPaddingBottom} ${
              device === 'tablet' ? 'max-w-xl' : 'max-w-3xl'
            }`}
          >
            {/* Index 01 & Eyebrow */}
            <div className="animate-rise flex items-center gap-2.5 sm:gap-3">
              <span className="font-display text-xs font-bold text-[#2563EB]">01</span>
              <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
              <p
                className={`hero-eyebrow eyebrow text-[#94A3B8] ${
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
              className={`mt-4 sm:mt-6 font-display font-black uppercase ${titleClass} text-white [text-wrap:balance]`}
            >
              <span className="block hero-line">{hero.headlineLines[0] || 'WE BUILD WHAT'}</span>
              <span className="block hero-line text-white/95">{hero.headlineLines[1] || 'MOVES BUSINESS'}</span>
              <span className="block hero-line text-[#38BDF8]">
                {hero.headlineLines[2] || 'FORWARD.'}
              </span>
            </h1>

            {/* Subtitle Paragraph */}
            <div className="hero-support animate-rise mt-4 sm:mt-6 max-w-xl">
              <p
                className={`${
                  device === 'mobile'
                    ? 'text-sm leading-relaxed'
                    : device === 'tablet'
                    ? 'text-base leading-relaxed'
                    : 'text-base md:text-lg leading-relaxed'
                } text-[#CBD5E1] font-normal [text-wrap:pretty]`}
              >
                {hero.supportParagraph}
              </p>

              {/* Mockup Dual Actions with Accessible Mobile Touch Targets */}
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
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/[0.05] px-5 sm:px-6 py-3.5 min-h-[46px] text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer whitespace-nowrap"
                >
                  <span>{hero.secondaryCta.label}</span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/10 group-hover:bg-[#2563EB] transition-colors shrink-0">
                    <Play className="size-2.5 fill-white text-white ml-0.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* NIRA Bottom-Right Signature Badge from Mockup */}
          <div
            className={`${
              device === 'mobile' ? 'mt-4 pt-4 pb-5 flex-col items-start gap-2' : 'mt-8 pt-5 pb-4 items-end justify-between'
            } flex border-t border-white/[0.08]`}
          >
            <div className="flex items-center gap-2.5 text-[10px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#94A3B8]">
              <span className="size-1.5 rounded-full bg-[#2563EB] shrink-0" aria-hidden="true" />
              <span>{config.positioning || 'Creative Intelligence × AI Engineering'}</span>
            </div>

            <div className={device === 'mobile' ? 'text-left' : 'text-right'}>
              <p className="font-display font-extrabold text-xs sm:text-sm tracking-wider text-white">
                {hero.niraBadge.title}
              </p>
              <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#94A3B8] font-medium uppercase">
                {hero.niraBadge.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
