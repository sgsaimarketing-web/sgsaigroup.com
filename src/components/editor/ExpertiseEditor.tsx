import React from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import {
  Cpu,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  BarChart3,
  Video,
  Settings,
  Monitor,
  Layers,
  Shield,
  Sparkles,
  Globe,
} from 'lucide-react';
import { CapabilityItem } from '../../data/siteContent.ts';

const ICON_OPTIONS = [
  { id: 'lightbulb', label: 'Lightbulb (Strategy & Creative)', icon: Lightbulb },
  { id: 'chart', label: 'Chart (Digital Marketing)', icon: BarChart3 },
  { id: 'video', label: 'Video (Media Production)', icon: Video },
  { id: 'cpu', label: 'CPU (AI Applications)', icon: Cpu },
  { id: 'settings', label: 'Settings (Business Automation)', icon: Settings },
  { id: 'monitor', label: 'Monitor (Websites & Experiences)', icon: Monitor },
  { id: 'layers', label: 'Layers (Systems & Stacks)', icon: Layers },
  { id: 'shield', label: 'Shield (Governance & Security)', icon: Shield },
  { id: 'sparkles', label: 'Sparkles (Innovation & GenAI)', icon: Sparkles },
  { id: 'globe', label: 'Globe (Regional Scale)', icon: Globe },
];

export const ExpertiseEditor: React.FC = () => {
  const { siteData, updateExpertise } = useSiteContent();
  const expertise = siteData.expertise;

  const updateCap = (index: number, patch: Partial<CapabilityItem>) => {
    const caps = [...expertise.capabilities];
    caps[index] = { ...caps[index], ...patch };
    updateExpertise({ capabilities: caps });
  };

  const moveCap = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= expertise.capabilities.length) return;
    const caps = [...expertise.capabilities];
    const temp = caps[index];
    caps[index] = caps[targetIdx];
    caps[targetIdx] = temp;
    updateExpertise({ capabilities: caps });
  };

  const removeCap = (index: number) => {
    if (expertise.capabilities.length <= 1) return;
    const caps = expertise.capabilities.filter((_, i) => i !== index);
    updateExpertise({ capabilities: caps });
  };

  const addCap = () => {
    const nextIdx = expertise.capabilities.length + 1;
    const newCap: CapabilityItem = {
      num: nextIdx < 10 ? `0${nextIdx}` : `${nextIdx}`,
      title: 'New Strategic Capability',
      description: 'End-to-end execution combining strategic insights and scalable AI technology.',
      iconName: 'sparkles',
    };
    updateExpertise({ capabilities: [...expertise.capabilities, newCap] });
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2 mb-4">
          <Cpu className="size-4 text-[#2563EB]" />
          Section 04 · Our Expertise Header & Bento Copy
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Index Number
            </label>
            <input
              type="text"
              value={expertise.num}
              onChange={(e) => updateExpertise({ num: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={expertise.eyebrow}
              onChange={(e) => updateExpertise({ eyebrow: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
            Section Headline Lines (3 Lines)
          </label>
          <div className="grid gap-2">
            <input
              type="text"
              value={expertise.headlineLines[0] || ''}
              onChange={(e) => {
                const lines = [...expertise.headlineLines];
                lines[0] = e.target.value;
                updateExpertise({ headlineLines: lines });
              }}
              placeholder="Line 1 (e.g. Good ideas)"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
            <input
              type="text"
              value={expertise.headlineLines[1] || ''}
              onChange={(e) => {
                const lines = [...expertise.headlineLines];
                lines[1] = e.target.value;
                updateExpertise({ headlineLines: lines });
              }}
              placeholder="Line 2 (e.g. need great)"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
            <input
              type="text"
              value={expertise.headlineLines[2] || ''}
              onChange={(e) => {
                const lines = [...expertise.headlineLines];
                lines[2] = e.target.value;
                updateExpertise({ headlineLines: lines });
              }}
              placeholder="Line 3 (e.g. execution.)"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6 Core Capability Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Core Disciplines ({expertise.capabilities.length})
          </h4>
          <button
            type="button"
            onClick={addCap}
            className="flex items-center gap-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="size-3.5" />
            Add Capability
          </button>
        </div>

        {expertise.capabilities.map((cap, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#2563EB] font-bold">
                  {cap.num || `0${idx + 1}`}
                </span>
                <span className="font-display font-bold text-white text-sm">
                  {cap.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => moveCap(idx, 'up')}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === expertise.capabilities.length - 1}
                  onClick={() => moveCap(idx, 'down')}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete Capability"
                  disabled={expertise.capabilities.length <= 1}
                  onClick={() => removeCap(idx)}
                  className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 ml-1 disabled:opacity-20 disabled:pointer-events-none"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Discipline Title</label>
                <input
                  type="text"
                  value={cap.title}
                  onChange={(e) => updateCap(idx, { title: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Index Number</label>
                <input
                  type="text"
                  value={cap.num}
                  onChange={(e) => updateCap(idx, { num: e.target.value })}
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Icon Representation</label>
              <select
                value={cap.iconName}
                onChange={(e) => updateCap(idx, { iconName: e.target.value as any })}
                className="w-full rounded bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Capability Description</label>
              <textarea
                rows={2}
                value={cap.description}
                onChange={(e) => updateCap(idx, { description: e.target.value })}
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
