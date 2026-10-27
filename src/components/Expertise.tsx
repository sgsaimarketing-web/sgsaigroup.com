import React from 'react';
import {
  Lightbulb,
  BarChart3,
  Video,
  Cpu,
  Settings,
  Monitor,
  Layers,
  Shield,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useSiteContent } from '../context/ContentContext.tsx';
import { EditableBlock } from './editor/EditableBlock.tsx';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  chart: BarChart3,
  video: Video,
  cpu: Cpu,
  settings: Settings,
  monitor: Monitor,
  layers: Layers,
  shield: Shield,
  sparkles: Sparkles,
  globe: Globe,
};

export const Expertise: React.FC = () => {
  const { siteData } = useSiteContent();
  const expertise = siteData.expertise;

  return (
    <EditableBlock section="expertise" label="Our Expertise Section">
      <section id="expertise" className="bg-[#101318] text-white scroll-mt-20 py-24 md:py-32 border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 reveal">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left Column: Heading */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 text-[#94A3B8]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {expertise.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{expertise.eyebrow}</span>
              </div>

              <h2 className="mt-8 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
                <span className="block">{expertise.headlineLines[0] || 'Good ideas'}</span>
                <span className="block">{expertise.headlineLines[1] || 'need great'}</span>
                <span className="block">{expertise.headlineLines[2] || 'execution.'}</span>
              </h2>
            </div>

            {/* Right Column: Capabilities in a 2x3 Grid */}
            <div className="lg:col-span-7 grid gap-8 sm:grid-cols-2">
              {expertise.capabilities.map((item, idx) => {
                const Icon = iconMap[item.iconName] || Lightbulb;
                return (
                  <div
                    key={item.num || idx}
                    className="group relative p-6 rounded-sm border border-white/[0.08] bg-[#151922]/70 hover:border-[#2563EB]/40 hover:bg-[#151922] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                      <Icon className="size-6 text-[#2563EB] transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-display text-xs font-bold text-[#2563EB]">
                        {item.num}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold text-white transition-colors group-hover:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs md:text-sm text-[#94A3B8] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </EditableBlock>
  );
};
