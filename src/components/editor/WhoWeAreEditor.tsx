import React from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import { MediaControl } from './MediaControl.tsx';
import { Layers } from 'lucide-react';

export const WhoWeAreEditor: React.FC = () => {
  const { siteData, updateWhoWeAre } = useSiteContent();
  const whoWeAre = siteData.whoWeAre;

  const updateCard = (index: number, patch: any) => {
    const cards = [...whoWeAre.cards];
    cards[index] = { ...cards[index], ...patch };
    updateWhoWeAre({ cards });
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2 mb-4">
          <Layers className="size-4 text-[#2563EB]" />
          Section 02 · Who We Are Editorial Statement
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Index Number
            </label>
            <input
              type="text"
              value={whoWeAre.num}
              onChange={(e) => updateWhoWeAre({ num: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={whoWeAre.eyebrow}
              onChange={(e) => updateWhoWeAre({ eyebrow: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Headline Main
            </label>
            <input
              type="text"
              value={whoWeAre.headlineMain}
              onChange={(e) => updateWhoWeAre({ headlineMain: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Headline Accent (Electric Blue)
            </label>
            <input
              type="text"
              value={whoWeAre.headlineAccent}
              onChange={(e) => updateWhoWeAre({ headlineAccent: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Narrative Statement
          </label>
          <textarea
            rows={3}
            value={whoWeAre.description}
            onChange={(e) => updateWhoWeAre({ description: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Brand Baseline Motto
          </label>
          <input
            type="text"
            value={whoWeAre.baseline}
            onChange={(e) => updateWhoWeAre({ baseline: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      {/* 3 Discipline Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
          Core Discipline Cards (Create · Connect · Engineer)
        </h4>

        {whoWeAre.cards.map((card, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-white text-sm">
                0{idx + 1} · {card.title}
              </span>
              <span className="text-[10px] text-[#2563EB] font-mono">Discipline Card</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Title</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(idx, { title: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={card.subtitle}
                  onChange={(e) => updateCard(idx, { subtitle: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <MediaControl
              label={`${card.title} Card Visual`}
              url={card.image}
              focalPoint={card.focalPoint || 'center'}
              aspectRatio="4:5"
              fit="cover"
              allowVideo={false}
              onChange={(patch) => {
                updateCard(idx, {
                  image: patch.url || card.image,
                  focalPoint: patch.focalPoint,
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
