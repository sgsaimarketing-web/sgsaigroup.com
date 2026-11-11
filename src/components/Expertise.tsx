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

            {/* Right Column: Capabilities in an Asymmetric Bento Grid */}
            <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
              {expertise.capabilities.map((item, idx) => {
                const Icon = iconMap[item.iconName] || Lightbulb;
                // Marquee items (idx 0 and idx 3) get asymmetric emphasis
                const isMarquee = idx === 0 || idx === 3;
                return (
                  <div
                    key={item.num || idx}
                    className={`group relative p-6 rounded-md border border-white/[0.08] bg-[#151922]/70 hover:border-[#2563EB]/50 hover:bg-[#151922] transition-all duration-300 hover:shadow-[0_0_24px_rgba(37,99,235,0.12)] hover:-translate-y-0.5 flex flex-col justify-between ${
                      isMarquee ? 'sm:col-span-2 sm:p-7 bg-gradient-to-br from-[#151922] to-[#12161E]' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/25 group-hover:bg-[#2563EB]/20 transition-colors">
                            <Icon className="size-5 text-[#38BDF8] transition-transform duration-300 group-hover:scale-110" />
                          </span>
                          {isMarquee && (
                            <span className="text-[10px] font-mono tracking-wider text-[#38BDF8] uppercase px-2 py-0.5 rounded bg-[#2563EB]/15 border border-[#2563EB]/30">
                              Core Pillar
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-[#2563EB] tabular-nums">
                          {item.num}
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-lg sm:text-xl font-bold text-white transition-colors group-hover:text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs md:text-sm text-[#94A3B8] leading-relaxed [text-wrap:pretty]">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#64748B] group-hover:text-[#94A3B8] transition-colors">
                        Enterprise Deliverable
                      </span>
                      <span className="text-[#38BDF8] text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                        Explore →
                      </span>
                    </div>
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
