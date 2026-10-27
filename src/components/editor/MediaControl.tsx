import React, { useState } from 'react';
import { Upload, Image, Video, Check, RefreshCw, Eye } from 'lucide-react';
import { GalleryMediaItem } from '../../data/siteContent.ts';

interface MediaControlProps {
  label: string;
  url: string;
  mediaType?: 'image' | 'video';
  fit?: 'cover' | 'contain';
  focalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  aspectRatio?: '16:9' | '9:16' | '4:5' | '1:1' | '3:2' | 'auto';
  caption?: string;
  onChange: (patch: {
    url?: string;
    type?: 'image' | 'video';
    fit?: 'cover' | 'contain';
    focalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    aspectRatio?: '16:9' | '9:16' | '4:5' | '1:1' | '3:2' | 'auto';
    caption?: string;
  }) => void;
  allowVideo?: boolean;
}

const PRESET_ASSETS = [
  { label: 'NIRA Official Hero', url: '/assets/nira-official.png', type: 'image' },
  { label: 'Connected Earth', url: '/assets/nira-connected-earth.png', type: 'image' },
  { label: 'Luxury Fragrance', url: '/assets/work/luxury-fragrance.jpg', type: 'image' },
  { label: 'Beauty Range', url: '/assets/work/beauty-range.jpg', type: 'image' },
  { label: 'City OOH Billboard', url: '/assets/work/city-ooh.jpg', type: 'image' },
  { label: 'Cinema Camera', url: '/assets/work/cinema-camera.jpg', type: 'image' },
  { label: 'Create Discipline', url: '/assets/who-we-are/create.jpg', type: 'image' },
  { label: 'Connect Discipline', url: '/assets/who-we-are/connect.jpg', type: 'image' },
  { label: 'Engineer Discipline', url: '/assets/who-we-are/engineer.jpg', type: 'image' },
  { label: 'FMCG Industry', url: '/assets/industry-fmcg.jpg', type: 'image' },
  { label: 'Industrial Processing', url: '/assets/industry-industrial.jpg', type: 'image' },
  { label: 'Retail Boutique', url: '/assets/industry-retail.jpg', type: 'image' },
  { label: 'SMEs & Professional', url: '/assets/industry-sme.jpg', type: 'image' },
  { label: 'Supply Chain Truck', url: '/assets/industry-logistics.jpg', type: 'image' },
];

export const MediaControl: React.FC<MediaControlProps> = ({
  label,
  url,
  mediaType = 'image',
  fit = 'cover',
  focalPoint = 'center',
  aspectRatio = 'auto',
  caption,
  onChange,
  allowVideo = true,
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewAspect, setPreviewAspect] = useState<'current' | 'portrait' | 'landscape'>('current');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        url: dataUrl,
        type: isVideo ? 'video' : 'image',
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read file. Please try another image or video format.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const getFocalClass = (f: string) => {
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

  const getAspectPreviewClass = () => {
    if (previewAspect === 'portrait') return 'aspect-[4/5] max-w-[200px]';
    if (previewAspect === 'landscape') return 'aspect-[16/9] w-full';
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[180px]';
      case '4:5':
        return 'aspect-[4/5] max-w-[200px]';
      case '1:1':
        return 'aspect-square max-w-[220px]';
      case '3:2':
        return 'aspect-[3/2] w-full';
      case '16:9':
        return 'aspect-[16/9] w-full';
      default:
        return 'aspect-[16/10] w-full';
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 text-xs text-white/90">
      <div className="flex items-center justify-between mb-3">
        <label className="font-semibold text-white tracking-wide flex items-center gap-2">
          {mediaType === 'video' ? (
            <Video className="size-4 text-[#2563EB]" />
          ) : (
            <Image className="size-4 text-[#2563EB]" />
          )}
          {label}
        </label>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-[#94A3B8]">
          {mediaType} · {aspectRatio}
        </span>
      </div>

      {uploadError && (
        <div className="mb-3 rounded bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-300">
          {uploadError}
        </div>
      )}

      {/* Visual Preview Box */}
      <div className="relative mb-3 flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black/40 p-2 overflow-hidden">
        <div className={`relative overflow-hidden rounded bg-black/60 shadow-inner ${getAspectPreviewClass()} transition-all duration-300`}>
          {url ? (
            mediaType === 'video' ? (
              <video
                src={url}
                className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${getFocalClass(
                  focalPoint
                )}`}
                controls
                muted
                playsInline
              />
            ) : (
              <img
                src={url}
                alt="Preview"
                className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${getFocalClass(
                  focalPoint
                )}`}
              />
            )
          ) : (
            <div className="flex h-32 w-full flex-col items-center justify-center text-white/40">
              <Upload className="size-6 mb-1 opacity-50" />
              <span>No media uploaded</span>
            </div>
          )}

          {/* Quick Fit Badge Overlay */}
          <div className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-white/80 backdrop-blur">
            {fit} · {focalPoint}
          </div>
        </div>

        {/* Aspect Ratio Test Toggles */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
          <span className="text-white/40">Test Ratio:</span>
          <button
            type="button"
            onClick={() => setPreviewAspect('current')}
            className={`px-1.5 py-0.5 rounded ${previewAspect === 'current' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Configured
          </button>
          <button
            type="button"
            onClick={() => setPreviewAspect('landscape')}
            className={`px-1.5 py-0.5 rounded ${previewAspect === 'landscape' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            16:9 Landscape
          </button>
          <button
            type="button"
            onClick={() => setPreviewAspect('portrait')}
            className={`px-1.5 py-0.5 rounded ${previewAspect === 'portrait' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            4:5 Portrait
          </button>
        </div>
      </div>

      {/* URL or Upload Input */}
      <div className="grid gap-2 mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="Asset path or URL (e.g. /assets/work/photo.jpg)"
            className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#2563EB] focus:outline-none"
          />
          <label className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition">
            <Upload className="size-3.5" />
            <span>{isUploading ? 'Loading...' : 'Upload'}</span>
            <input
              type="file"
              accept={allowVideo ? 'image/jpeg,image/png,image/webp,video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
        </div>

        {/* Preset Library Toggle */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[#38BDF8] hover:underline flex items-center gap-1"
          >
            <span>{showPresets ? 'Hide SGS Asset Library' : 'Choose from SGS Asset Library'}</span>
          </button>
          {allowVideo && (
            <div className="flex items-center gap-1">
              <span className="text-white/40">Type:</span>
              <button
                type="button"
                onClick={() => onChange({ type: 'image' })}
                className={`px-2 py-0.5 rounded ${mediaType === 'image' ? 'bg-white/20 text-white font-bold' : 'text-white/50'}`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => onChange({ type: 'video' })}
                className={`px-2 py-0.5 rounded ${mediaType === 'video' ? 'bg-[#2563EB] text-white font-bold' : 'text-white/50'}`}
              >
                Video
              </button>
            </div>
          )}
        </div>

        {/* Preset Asset Picker */}
        {showPresets && (
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-black/70 p-2">
            {PRESET_ASSETS.map((asset) => (
              <button
                key={asset.url}
                type="button"
                onClick={() => {
                  onChange({ url: asset.url, type: asset.type as any });
                  setShowPresets(false);
                }}
                className={`flex items-center gap-1.5 text-left p-1 rounded hover:bg-white/10 transition ${url === asset.url ? 'bg-[#2563EB]/30 border border-[#2563EB]/40' : ''}`}
              >
                <img src={asset.url} alt="" className="size-6 rounded object-cover" />
                <span className="truncate text-[10px] text-white/90">{asset.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Media Format & Cropping Controls */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-[11px]">
        {/* Aspect Ratio */}
        <div>
          <span className="text-white/50 block mb-1">Aspect Ratio</span>
          <select
            value={aspectRatio}
            onChange={(e) => onChange({ aspectRatio: e.target.value as any })}
            className="w-full rounded bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="auto">Auto / Original</option>
            <option value="16:9">16:9 Landscape</option>
            <option value="3:2">3:2 Photo</option>
            <option value="4:5">4:5 Portrait</option>
            <option value="9:16">9:16 Vertical</option>
            <option value="1:1">1:1 Square</option>
          </select>
        </div>

        {/* Fit Mode */}
        <div>
          <span className="text-white/50 block mb-1">Fit & Framing</span>
          <select
            value={fit}
            onChange={(e) => onChange({ fit: e.target.value as any })}
            className="w-full rounded bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="cover">Cover (Fill Frame)</option>
            <option value="contain">Contain (No Crop)</option>
          </select>
        </div>

        {/* Focal Point */}
        <div>
          <span className="text-white/50 block mb-1">Focal Anchor</span>
          <select
            value={focalPoint}
            onChange={(e) => onChange({ focalPoint: e.target.value as any })}
            className="w-full rounded bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="center">Center</option>
            <option value="top">Top (Head/Sky)</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {/* Optional Caption */}
      {caption !== undefined && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <span className="text-white/50 block mb-1">Caption / Media Label</span>
          <input
            type="text"
            value={caption}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="e.g. Studio Campaign Shoot - 01"
            className="w-full rounded border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-white placeholder-white/30 focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
