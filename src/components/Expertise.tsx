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
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import { getSectionPaddingClass, resolveSectionLayoutForDevice } from '../utils/responsiveMedia.ts';

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

interface ExpertiseProps {
  onExploreCategory?: (categoryId: string) => void;
  onScopeObjective?: (objective: string) => void;
}

const CAPABILITY_ROUTING: Record<string, { categoryId: string; objective: string }> = {
  'Brand Strategy & Creative': {
    categoryId: 'brand-campaigns',
    objective: 'Brand Strategy & Creative',
  },
  'Digital Marketing': {
    categoryId: 'brand-campaigns',
    objective: 'Digital Marketing & Performance',
  },
  'Content & Media Production': {
    categoryId: 'packaging-experience',
    objective: 'Content & Media Production',
  },
  'AI Applications & Engineering': {
    categoryId: 'ai-systems',
    objective: 'AI Applications & Engineering',
  },
  'Business Process Automation': {
    categoryId: 'ai-systems',
    objective: 'Business Process Automation',
  },
  'Websites & Digital Experiences': {
    categoryId: 'corporate-solutions',
    objective: 'Websites & Digital Experiences',
  },
};

export const Expertise: React.FC<ExpertiseProps> = ({
  onExploreCategory,
  onScopeObjective,
}) => {
  const { siteData } = useSiteContent();
  const device = useEffectiveDevice();
  const expertise = siteData.expertise;

  const layout = resolveSectionLayoutForDevice(device, expertise.responsiveLayout, {
    mobile: { paddingY: 'compact' },
    tablet: { paddingY: 'standard', columnsTablet: 2 },
    laptop: { paddingY: 'standard' },
  });

  const paddingClass = getSectionPaddingClass(device, layout.paddingY);
  const horizontalPad = device === 'mobile' ? 'px-5' : 'px-6 lg:px-8';

  const gridColsClass =
    device === 'laptop'
      ? 'col-span-7 grid gap-4 grid-cols-2'
      : device === 'tablet'
      ? `grid gap-4 ${layout.columnsTablet === 3 ? 'grid-cols-3' : 'grid-cols-2'}`
      : 'grid gap-3.5 grid-cols-1';

  return (
    <EditableBlock section="expertise" label="Our Expertise Section">
      <section
        id="expertise"
        className={`bg-[#101318] text-white scroll-mt-20 ${paddingClass} border-b border-white/[0.08]`}
      >
        <div className={`mx-auto max-w-7xl ${horizontalPad} reveal`}>
          <div
            className={`grid ${
              device === 'laptop' ? 'gap-12 grid-cols-12 items-start' : 'gap-8 sm:gap-10 grid-cols-1'
            }`}
          >
            {/* Left Column: Heading */}
            <div className={device === 'laptop' ? 'col-span-5 sticky top-28' : ''}>
              <div className="flex items-center gap-3 text-[#94A3B8]">
                <span className="font-display text-xs font-bold text-[#2563EB]">
                  {expertise.num}
                </span>
                <span className="h-3 w-[2px] bg-[#2563EB]" aria-hidden="true" />
                <span className="eyebrow tracking-[0.2em]">{expertise.eyebrow}</span>
              </div>

              <h2
                className={`mt-6 sm:mt-8 font-display ${
                  device === 'mobile'
                    ? 'text-3xl leading-[1.05]'
                    : device === 'tablet'
                    ? 'text-4xl leading-[1.04]'
                    : 'text-5xl lg:text-6xl leading-[1.02]'
                } font-extrabold tracking-[-0.035em] text-white`}
              >
                <span className="block">{expertise.headlineLines[0] || 'Good ideas'}</span>
                <span className="block">{expertise.headlineLines[1] || 'need great'}</span>
                <span className="block">{expertise.headlineLines[2] || 'execution.'}</span>
              </h2>
            </div>

            {/* Right Column: Capabilities in a Device-Adaptive Bento Grid */}
            <div className={gridColsClass}>
              {expertise.capabilities.map((item, idx) => {
                const Icon = iconMap[item.iconName] || Lightbulb;
                const isMarquee = idx === 0 || idx === 3;
                const spanMarquee =
                  isMarquee && (device === 'laptop' || (device === 'tablet' && layout.columnsTablet === 2));
                const routing = CAPABILITY_ROUTING[item.title] || {
                  categoryId: idx >= 3 ? 'ai-systems' : 'brand-campaigns',
                  objective: item.title,
                };

                return (
                  <div
                    key={item.num || idx}
                    className={`group relative ${
                      device === 'mobile' ? 'p-5' : spanMarquee ? 'p-7' : 'p-6'
                    } rounded-md border border-white/[0.08] bg-[#151922]/70 hover:border-[#2563EB]/50 hover:bg-[#151922] transition-all duration-300 hover:shadow-[0_0_24px_rgba(37,99,235,0.12)] hover:-translate-y-0.5 flex flex-col justify-between ${
                      spanMarquee ? 'col-span-2 bg-gradient-to-br from-[#151922] to-[#12161E]' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onExploreCategory?.(routing.categoryId)}
                      className="text-left w-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563EB] rounded-sm"
                    >
                      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-white/[0.06]">
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

                      <h3 className={`mt-4 font-display ${device === 'mobile' ? 'text-lg' : 'text-lg sm:text-xl'} font-bold text-white transition-colors group-hover:text-[#38BDF8]`}>
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs md:text-sm text-[#94A3B8] leading-relaxed [text-wrap:pretty]">
                        {item.description}
                      </p>
                    </button>

                    <div className="mt-4 sm:mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onExploreCategory?.(routing.categoryId)}
                        className="text-[11px] font-mono text-[#94A3B8] hover:text-white transition-colors cursor-pointer py-1"
                      >
                        View Work →
                      </button>
                      <button
                        type="button"
                        onClick={() => onScopeObjective?.(routing.objective)}
                        className="text-[#38BDF8] hover:text-white text-xs font-semibold transition-colors cursor-pointer py-1"
                      >
                        Scope Project →
                      </button>
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
