import React, { useState } from 'react';
import { ArrowRight, Play, ImageOff } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';

interface HeroProps {
  onOpenShowreel: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenShowreel }) => {
  const { siteData } = useSiteContent();
  const hero = siteData.hero;
  const config = siteData.config;
  const [imageError, setImageError] = useState(false);

  const heroImage = hero.backgroundImage || config.heroImage;
  const isVideo = !!hero.backgroundVideo;

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
    <EditableBlock section="hero" label="Hero Section">
      <section
        id="home"
        className="hero relative overflow-hidden bg-[#101318] pt-20 text-white min-h-[92svh] lg:min-h-screen flex flex-col justify-between"
      >
        {/* NIRA Cinematic World Background / Video */}
        {isVideo ? (
          <video
            src={hero.backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            className={`hero-image absolute inset-0 h-full w-full ${
              hero.backgroundFit === 'contain' ? 'object-contain' : 'object-cover'
            } ${getFocalClass(hero.backgroundFocalPoint)} select-none pointer-events-none`}
          />
        ) : !imageError ? (
          <img
            src={heroImage}
            alt="NIRA overlooking connected futuristic city at sunset"
            width={941}
            height={1672}
            fetchPriority="high"
            decoding="async"
            className={`hero-image absolute inset-0 h-full w-full ${
              hero.backgroundFit === 'contain' ? 'object-contain' : 'object-cover'
            } ${getFocalClass(hero.backgroundFocalPoint)} select-none pointer-events-none`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="hero-image absolute inset-0 flex flex-col items-center justify-center bg-[#151922] p-8 text-center text-[#94A3B8] border-l border-white/10"
            aria-label="NIRA visual placeholder"
          >
            <ImageOff className="size-12 text-[#2563EB]/50 mb-3" />
            <p className="text-sm font-semibold text-white">NIRA Hero Character</p>
          </div>
        )}

        {/* Cinematic Gradient Shade */}
        <div className="hero-shade absolute inset-0 pointer-events-none" aria-hidden="true" />

        {/* Hero Content Grid matching Mockup Section 01 */}
        <div className="hero-content relative mx-auto grid w-full max-w-7xl grid-rows-[1fr_auto] px-6 lg:px-8 z-10">
          <div className="flex flex-col justify-center pt-8 md:pt-14 pb-8 max-w-3xl">
            {/* Index 01 & Eyebrow */}
            <div className="animate-rise flex items-center gap-3">
              <span className="font-display text-xs font-bold text-[#2563EB]">01</span>
              <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
              <p className="hero-eyebrow eyebrow text-[#94A3B8] text-[11px] font-semibold tracking-[0.2em]">
                {hero.eyebrow}
              </p>
            </div>

            {/* Master Headline */}
            <h1 className="hero-title mt-6 font-display font-extrabold uppercase leading-[0.94] tracking-[-0.035em] text-white">
              <span className="hero-line">{hero.headlineLines[0] || 'WE BUILD WHAT'}</span>
              <span className="hero-line">{hero.headlineLines[1] || 'MOVES BUSINESS'}</span>
              <span className="hero-line text-white">
                {hero.headlineLines[2] || 'FORWARD.'}
              </span>
            </h1>

            {/* Subtitle Paragraph */}
            <div className="hero-support animate-rise mt-6 max-w-xl">
              <p className="text-base md:text-lg leading-relaxed text-[#CBD5E1] font-normal">
                {hero.supportParagraph}
              </p>

              {/* Mockup Dual Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={hero.primaryCta.href || '#our-work'}
                  className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#2563EB] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#1D4ED8] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <span>{hero.primaryCta.label}</span>
                  <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={onOpenShowreel}
                  className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.04] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
                >
                  <span>{hero.secondaryCta.label}</span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/10 group-hover:bg-[#2563EB] transition-colors">
                    <Play className="size-2.5 fill-white text-white ml-0.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* NIRA Bottom-Right Signature Badge from Mockup */}
          <div className="mt-8 flex items-end justify-between border-t border-white/[0.08] pt-6 pb-2">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-[#94A3B8]">
              <span className="size-1.5 rounded-full bg-[#2563EB]" aria-hidden="true" />
              <span>{config.positioning || 'Creative Intelligence × AI Engineering'}</span>
            </div>

            <div className="text-right">
              <p className="font-display font-extrabold text-sm tracking-wider text-white">
                {hero.niraBadge.title}
              </p>
              <p className="text-[10px] tracking-[0.2em] text-[#94A3B8] font-medium">
                {hero.niraBadge.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
