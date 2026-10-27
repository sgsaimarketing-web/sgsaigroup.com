import React from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import { MediaControl } from './MediaControl.tsx';
import { Sparkles, Type, Film } from 'lucide-react';

export const HeroEditor: React.FC = () => {
  const { siteData, updateHero } = useSiteContent();
  const hero = siteData.hero;

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2 mb-4">
          <Type className="size-4 text-[#2563EB]" />
          Section 01 · Hero Copy & Messaging
        </h3>

        {/* Eyebrow */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Eyebrow Philosophy Line
          </label>
          <input
            type="text"
            value={hero.eyebrow}
            onChange={(e) => updateHero({ eyebrow: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        {/* 3 Headline Lines */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Master Headline (3 Lines)
          </label>
          <div className="grid gap-2">
            <input
              type="text"
              value={hero.headlineLines[0] || ''}
              onChange={(e) => {
                const lines = [...hero.headlineLines];
                lines[0] = e.target.value;
                updateHero({ headlineLines: lines });
              }}
              placeholder="Line 1 (e.g. WE BUILD WHAT)"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
            <input
              type="text"
              value={hero.headlineLines[1] || ''}
              onChange={(e) => {
                const lines = [...hero.headlineLines];
                lines[1] = e.target.value;
                updateHero({ headlineLines: lines });
              }}
              placeholder="Line 2 (e.g. MOVES BUSINESS)"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
            <input
              type="text"
              value={hero.headlineLines[2] || ''}
              onChange={(e) => {
                const lines = [...hero.headlineLines];
                lines[2] = e.target.value;
                updateHero({ headlineLines: lines });
              }}
              placeholder="Line 3 (e.g. FORWARD.)"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        {/* Support Paragraph */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Support Paragraph
          </label>
          <textarea
            rows={3}
            value={hero.supportParagraph}
            onChange={(e) => updateHero({ supportParagraph: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none leading-relaxed"
          />
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Primary CTA Label
            </label>
            <input
              type="text"
              value={hero.primaryCta.label}
              onChange={(e) =>
                updateHero({ primaryCta: { ...hero.primaryCta, label: e.target.value } })
              }
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Secondary CTA Label
            </label>
            <input
              type="text"
              value={hero.secondaryCta.label}
              onChange={(e) =>
                updateHero({ secondaryCta: { ...hero.secondaryCta, label: e.target.value } })
              }
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        {/* NIRA Badge */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              NIRA Badge Title
            </label>
            <input
              type="text"
              value={hero.niraBadge.title}
              onChange={(e) =>
                updateHero({ niraBadge: { ...hero.niraBadge, title: e.target.value } })
              }
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              NIRA Subtitle Stamp
            </label>
            <input
              type="text"
              value={hero.niraBadge.subtitle}
              onChange={(e) =>
                updateHero({ niraBadge: { ...hero.niraBadge, subtitle: e.target.value } })
              }
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hero Media & Visual Atmosphere */}
      <MediaControl
        label="NIRA Hero Visual or Video"
        url={hero.backgroundImage || siteData.config.heroImage}
        mediaType={hero.backgroundVideo ? 'video' : 'image'}
        fit={hero.backgroundFit || 'cover'}
        focalPoint={hero.backgroundFocalPoint || 'center'}
        aspectRatio="16:9"
        onChange={(patch) => {
          updateHero({
            backgroundImage: patch.url,
            backgroundVideo: patch.type === 'video' ? patch.url : undefined,
            backgroundFit: patch.fit,
            backgroundFocalPoint: patch.focalPoint,
          });
        }}
      />

      {/* Animation Dynamics */}
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <h4 className="font-semibold text-white flex items-center gap-2 mb-2 text-xs">
          <Sparkles className="size-4 text-[#2563EB]" />
          Cinematic Animation & Speed Controls
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {(['subtle', 'standard', 'dynamic'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => updateHero({ animationSpeed: mode })}
              className={`rounded-lg py-2 px-3 text-xs font-semibold capitalize transition ${
                (hero.animationSpeed || 'standard') === mode
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-black/40 text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
