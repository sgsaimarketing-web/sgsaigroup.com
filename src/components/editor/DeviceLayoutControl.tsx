import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw, Sliders } from 'lucide-react';
import type {
  DeviceBreakpoint,
  ResponsiveSectionOverrides,
  SectionLayoutOverride,
} from '../../data/siteContent.ts';
import { useSiteContent } from '../../context/ContentContext.tsx';
import { mapPreviewDeviceToBreakpoint } from '../../utils/responsiveMedia.ts';

interface DeviceLayoutControlProps {
  title?: string;
  value?: ResponsiveSectionOverrides;
  onChange: (next: ResponsiveSectionOverrides) => void;
  showMobileLayout?: boolean;
  showTabletColumns?: boolean;
  showLaptopColumns?: boolean;
}

const DEVICES: { id: DeviceBreakpoint; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'laptop', label: 'Laptop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

export const DeviceLayoutControl: React.FC<DeviceLayoutControlProps> = ({
  title = 'Device Layout & Spacing',
  value,
  onChange,
  showMobileLayout = false,
  showTabletColumns = false,
  showLaptopColumns = false,
}) => {
  const { previewDevice, setPreviewDevice } = useSiteContent();
  const [selectedDevice, setSelectedDevice] = useState<DeviceBreakpoint>(() =>
    mapPreviewDeviceToBreakpoint(previewDevice)
  );

  useEffect(() => {
    setSelectedDevice(mapPreviewDeviceToBreakpoint(previewDevice));
  }, [previewDevice]);

  const currentOverride: SectionLayoutOverride = value?.[selectedDevice] || {};
  const hasCustom = Object.values(currentOverride).some((v) => v !== undefined);

  const handleSelectDevice = (dev: DeviceBreakpoint) => {
    setSelectedDevice(dev);
    setPreviewDevice(dev === 'laptop' ? 'desktop' : dev);
  };

  const updateDeviceOverride = (patch: Partial<SectionLayoutOverride>) => {
    const next: ResponsiveSectionOverrides = {
      ...(value || {}),
      [selectedDevice]: {
        ...(value?.[selectedDevice] || {}),
        ...patch,
      },
    };
    onChange(next);
  };

  const resetCurrentDevice = () => {
    if (!value) return;
    const next: ResponsiveSectionOverrides = { ...value };
    delete next[selectedDevice];
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Sliders className="size-3.5 text-[#38BDF8]" />
          <span>{title}</span>
        </div>

        <span
          className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
            hasCustom
              ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]/40'
              : 'bg-white/5 text-[#94A3B8] border-white/10'
          }`}
        >
          {hasCustom ? 'Custom' : 'Auto Default'}
        </span>
      </div>

      {/* Device Tabs */}
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-black/50 p-1 border border-white/10">
        {DEVICES.map((dev) => {
          const Icon = dev.icon;
          const isSelected = selectedDevice === dev.id;
          const devCustom = Object.values(value?.[dev.id] || {}).some((v) => v !== undefined);
          return (
            <button
              key={dev.id}
              type="button"
              onClick={() => handleSelectDevice(dev.id)}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 px-2 text-[11px] font-semibold transition cursor-pointer ${
                isSelected
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{dev.label}</span>
              {devCustom && (
                <span className="size-1.5 rounded-full bg-[#38BDF8]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Section Padding Density */}
      <div>
        <label className="block text-[11px] text-[#94A3B8] mb-1.5">
          Vertical Section Spacing ({selectedDevice})
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['compact', 'standard', 'spacious'] as const).map((density) => {
            const active =
              (currentOverride.paddingY ||
                (selectedDevice === 'mobile' ? 'compact' : 'standard')) === density;
            return (
              <button
                key={density}
                type="button"
                onClick={() => updateDeviceOverride({ paddingY: density })}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold capitalize border transition cursor-pointer ${
                  active
                    ? 'bg-[#2563EB]/25 border-[#2563EB] text-white'
                    : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {density}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Layout Selector */}
      {showMobileLayout && selectedDevice === 'mobile' && (
        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1.5">
            Mobile Arrangement Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'carousel', label: 'Swipe Rail' },
                { id: 'stack', label: 'Full Stack' },
                { id: 'grid-2', label: '2-Up Grid' },
              ] as const
            ).map((opt) => {
              const active = (currentOverride.mobileLayout || 'carousel') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateDeviceOverride({ mobileLayout: opt.id })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    active
                      ? 'bg-[#2563EB]/25 border-[#2563EB] text-white'
                      : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tablet Columns Selector */}
      {showTabletColumns && selectedDevice === 'tablet' && (
        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1.5">
            Tablet Card Columns
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {([2, 3] as const).map((cols) => {
              const active = (currentOverride.columnsTablet || 2) === cols;
              return (
                <button
                  key={cols}
                  type="button"
                  onClick={() => updateDeviceOverride({ columnsTablet: cols })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    active
                      ? 'bg-[#2563EB]/25 border-[#2563EB] text-white'
                      : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cols} Columns
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Laptop Columns Selector */}
      {showLaptopColumns && selectedDevice === 'laptop' && (
        <div>
          <label className="block text-[11px] text-[#94A3B8] mb-1.5">
            Laptop Showcase Columns
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {([2, 3, 4] as const).map((cols) => {
              const active = (currentOverride.columnsLaptop || 4) === cols;
              return (
                <button
                  key={cols}
                  type="button"
                  onClick={() => updateDeviceOverride({ columnsLaptop: cols })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    active
                      ? 'bg-[#2563EB]/25 border-[#2563EB] text-white'
                      : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cols} Cols
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset device overrides */}
      {hasCustom && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={resetCurrentDevice}
            className="inline-flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset {selectedDevice} layout</span>
          </button>
        </div>
      )}
    </div>
  );
};
