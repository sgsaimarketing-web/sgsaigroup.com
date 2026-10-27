import React from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import { MediaControl } from './MediaControl.tsx';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { IndustryItem } from '../../data/siteContent.ts';

export const IndustriesEditor: React.FC = () => {
  const { siteData, updateIndustries } = useSiteContent();
  const industries = siteData.industries;

  const updateItem = (index: number, patch: Partial<IndustryItem>) => {
    const items = [...industries.items];
    items[index] = { ...items[index], ...patch };
    updateIndustries({ items });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= industries.items.length) return;
    const items = [...industries.items];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    updateIndustries({ items });
  };

  const removeItem = (index: number) => {
    if (industries.items.length <= 1) {
      alert('You must have at least one industry sector.');
      return;
    }
    const items = industries.items.filter((_, i) => i !== index);
    updateIndustries({ items });
  };

  const addItem = () => {
    const newIdx = industries.items.length + 1;
    const newItem: IndustryItem = {
      id: `industry-${Date.now()}`,
      num: newIdx < 10 ? `0${newIdx}` : `${newIdx}`,
      title: 'New Industry Track',
      description: 'Accelerate digital transformation and market leadership.',
      image: '/assets/industry-retail.jpg',
      imageAlt: 'Industry visual placeholder',
      cropAspect: '16:9',
      focalPoint: 'center',
    };
    updateIndustries({ items: [...industries.items, newItem] });
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2 mb-4">
          <Briefcase className="size-4 text-[#2563EB]" />
          Section 03 · Industries Header & Overview
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Index Number
            </label>
            <input
              type="text"
              value={industries.num}
              onChange={(e) => updateIndustries({ num: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={industries.eyebrow}
              onChange={(e) => updateIndustries({ eyebrow: e.target.value })}
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
              value={industries.headlineMain}
              onChange={(e) => updateIndustries({ headlineMain: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Headline Accent (Electric Blue)
            </label>
            <input
              type="text"
              value={industries.headlineAccent}
              onChange={(e) => updateIndustries({ headlineAccent: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Section Overview Text
          </label>
          <textarea
            rows={3}
            value={industries.description}
            onChange={(e) => updateIndustries({ description: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-[#2563EB] focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Industry Sector Items with Reordering & Add */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Industry Tracks ({industries.items.length})
          </h4>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="size-3.5" />
            Add Track
          </button>
        </div>

        {industries.items.map((item, idx) => (
          <div key={item.id || idx} className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#2563EB] font-bold">
                  {item.num || `0${idx + 1}`}
                </span>
                <span className="font-display font-bold text-white text-sm">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, 'up')}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === industries.items.length - 1}
                  onClick={() => moveItem(idx, 'down')}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete Track"
                  onClick={() => removeItem(idx)}
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 ml-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Track Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Index Number</label>
                <input
                  type="text"
                  value={item.num}
                  onChange={(e) => updateItem(idx, { num: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Description / Tagline</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(idx, { description: e.target.value })}
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <MediaControl
              label="Track Photography"
              url={item.image}
              focalPoint={item.focalPoint || 'center'}
              aspectRatio="16:9"
              fit="cover"
              allowVideo={false}
              onChange={(patch) => {
                updateItem(idx, {
                  image: patch.url || item.image,
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
