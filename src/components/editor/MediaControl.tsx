import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image, Video, RefreshCw, Sparkles, AlertCircle, Monitor, Tablet, Smartphone, Layers, RotateCcw } from 'lucide-react';
import { processMediaUpload, CompressionResult } from '../../utils/mediaCompressor.ts';
import type {
  DeviceBreakpoint,
  DeviceHeightScale,
  DeviceMediaOverride,
  MediaAspectRatio,
  MediaFitMode,
  MediaFocalPoint,
  ResponsiveMediaOverrides,
} from '../../data/siteContent.ts';
import { useSiteContent } from '../../context/ContentContext.tsx';
import {
  getFocalClass,
  isImageAssetUrl,
  isVideoAssetUrl,
  mapPreviewDeviceToBreakpoint,
} from '../../utils/responsiveMedia.ts';
import { uploadCmsMediaFile, uploadDataUrlAsset } from '../../lib/mediaUpload.ts';

interface MediaControlProps {
  label: string;
  url: string;
  mediaType?: 'image' | 'video';
  fit?: MediaFitMode;
  focalPoint?: MediaFocalPoint;
  aspectRatio?: MediaAspectRatio;
  caption?: string;
  posterUrl?: string;
  responsiveMedia?: ResponsiveMediaOverrides;
  onResponsiveChange?: (next: ResponsiveMediaOverrides) => void;
  showHeightScale?: boolean;
  onPosterChange?: (poster: string) => void;
  onVideoFileSelect?: (file: File) => void;
  onChange: (patch: {
    url?: string;
    type?: 'image' | 'video';
    fit?: MediaFitMode;
    focalPoint?: MediaFocalPoint;
    aspectRatio?: MediaAspectRatio;
    caption?: string;
  }) => void;
  allowVideo?: boolean;
}

const PRESET_ASSETS = [
  { label: 'Alzara Selera Terangkat Reel', url: '/assets/work/alzara-curry-reel.mp4', type: 'video' },
  { label: 'My Kaapie Filter Coffee Reel', url: '/assets/work/mykaapie-coffee-reel.mp4', type: 'video' },
  { label: 'SGS NIRA Showcase Reel', url: '/assets/nira-loop.mp4', type: 'video' },
  { label: 'Alzara Curry Poster', url: '/assets/work/alzara-curry-poster.webp', type: 'image' },
  { label: 'My Kaapie Coffee Poster', url: '/assets/work/mykaapie-coffee-poster.webp', type: 'image' },
  { label: 'Biho Food Festive Poster', url: '/assets/work/biho-festive-poster.webp', type: 'image' },
  { label: 'Biho Food Gift Hamper', url: '/assets/work/biho-gift-bag.webp', type: 'image' },
  { label: 'Nelson Diamond Inspection', url: '/assets/work/nelson-diamond.png', type: 'image' },
  { label: 'Nelson Trading Cosmic', url: '/assets/work/nelson-trading.png', type: 'image' },
  { label: 'NIRA Official Hero', url: '/assets/nira-official.webp', type: 'image' },
  { label: 'Connected Earth', url: '/assets/nira-connected-earth.webp', type: 'image' },
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
  posterUrl,
  responsiveMedia,
  onResponsiveChange,
  showHeightScale = false,
  onPosterChange,
  onVideoFileSelect,
  onChange,
  allowVideo = true,
}) => {
  const { previewDevice, setPreviewDevice, getCmsAuthHeaders } = useSiteContent();
  const [showPresets, setShowPresets] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressingLabel, setCompressingLabel] = useState('Uploading...');
  const [isPosterCompressing, setIsPosterCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressionBadge, setCompressionBadge] = useState<string | null>(null);
  const [previewAspect, setPreviewAspect] = useState<'current' | '9:16' | 'landscape'>('current');
  const [editingTarget, setEditingTarget] = useState<'base' | DeviceBreakpoint>('base');

  const localBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (localBlobUrlRef.current) {
        try {
          URL.revokeObjectURL(localBlobUrlRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Keep selected override tab in sync if toolbar device changes while inspecting a device override
  useEffect(() => {
    if (editingTarget !== 'base') {
      setEditingTarget(mapPreviewDeviceToBreakpoint(previewDevice));
    }
  }, [previewDevice, editingTarget]);

  const activeOverride: DeviceMediaOverride | undefined =
    editingTarget === 'base' ? undefined : responsiveMedia?.[editingTarget];
  const hasDeviceCustom =
    editingTarget !== 'base' &&
    !!activeOverride &&
    Object.values(activeOverride).some((v) => v !== undefined);

  const effectiveAspect: MediaAspectRatio =
    editingTarget === 'base' ? aspectRatio : activeOverride?.aspectRatio || aspectRatio;
  const effectiveFit: MediaFitMode =
    editingTarget === 'base' ? fit : activeOverride?.fit || fit;
  const effectiveFocal: MediaFocalPoint =
    editingTarget === 'base' ? focalPoint : activeOverride?.focalPoint || focalPoint;
  const effectiveHeightScale: DeviceHeightScale =
    editingTarget === 'base' ? 'standard' : activeOverride?.heightScale || 'standard';

  const handleSelectTarget = (target: 'base' | DeviceBreakpoint) => {
    setEditingTarget(target);
    if (target !== 'base') {
      setPreviewDevice(target === 'laptop' ? 'desktop' : target);
    }
  };

  const updateFraming = (patch: Partial<DeviceMediaOverride>) => {
    if (editingTarget === 'base' || !onResponsiveChange) {
      onChange({
        aspectRatio: patch.aspectRatio,
        fit: patch.fit,
        focalPoint: patch.focalPoint,
      });
      return;
    }
    const next: ResponsiveMediaOverrides = {
      ...(responsiveMedia || {}),
      [editingTarget]: {
        ...(responsiveMedia?.[editingTarget] || {}),
        ...patch,
      },
    };
    onResponsiveChange(next);
  };

  const resetDeviceOverride = () => {
    if (editingTarget === 'base' || !onResponsiveChange || !responsiveMedia) return;
    const next: ResponsiveMediaOverrides = { ...responsiveMedia };
    delete next[editingTarget];
    onResponsiveChange(next);
  };

  // Detect genuine media type using unified responsiveMedia helpers
  const isImageSrc = isImageAssetUrl(url);
  const isVideoSrc = isVideoAssetUrl(url);
  const resolvedMediaType = isImageSrc ? 'image' : isVideoSrc ? 'video' : mediaType;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setUploadError(null);
    setCompressionBadge(null);

    try {
      const isVideo =
        file.type.startsWith('video/') ||
        /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(file.name);

      if (isVideo) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(
            `Video (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB bucket limit. Please compress below 50MB before uploading.`
          );
        }

        const sizeKb = Math.round(file.size / 1024);
        setCompressingLabel('Uploading Video...');
        setCompressionBadge(`Uploading (${sizeKb}KB)...`);

        if (onVideoFileSelect) {
          onVideoFileSelect(file);
        }

        const result = await uploadCmsMediaFile(file, {
          fileName: file.name,
          folder: 'videos',
          contentType: file.type || 'video/mp4',
          authHeaders: getCmsAuthHeaders(),
        });

        if (localBlobUrlRef.current) {
          try {
            URL.revokeObjectURL(localBlobUrlRef.current);
          } catch {
            // ignore
          }
          localBlobUrlRef.current = null;
        }

        onChange({
          url: result.url,
          type: 'video',
        });

        setCompressionBadge(
          result.provider === 'supabase'
            ? `✓ Saved to Supabase CDN (${sizeKb}KB)`
            : `✓ Saved to Server (${sizeKb}KB)`
        );
      } else {
        setCompressingLabel('Optimizing WebP...');
        const result: CompressionResult = await processMediaUpload(file, 1600, 1600, 0.82);

        setCompressingLabel('Uploading Image...');
        const uploaded = await uploadDataUrlAsset(result.dataUrl, {
          fileName: `img-${file.name.replace(/\.[^.]+$/, '')}.webp`,
          folder: 'images',
          authHeaders: getCmsAuthHeaders(),
        });

        onChange({
          url: uploaded.url,
          type: 'image',
        });

        setCompressionBadge(
          uploaded.provider === 'supabase'
            ? `✓ Saved to Supabase CDN (${result.compressedSizeKb}KB WebP)`
            : `✓ Saved to Server (${result.compressedSizeKb}KB WebP)`
        );
      }
    } catch (err: any) {
      setCompressionBadge(null);
      setUploadError(err?.message || 'Failed to upload media permanently.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onPosterChange) return;

    setIsPosterCompressing(true);
    setUploadError(null);

    try {
      const result: CompressionResult = await processMediaUpload(file, 1080, 1920, 0.82);
      const uploaded = await uploadDataUrlAsset(result.dataUrl, {
        fileName: `poster-${file.name.replace(/\.[^.]+$/, '')}.webp`,
        folder: 'posters',
        authHeaders: getCmsAuthHeaders(),
      });
      onPosterChange(uploaded.url);
      setCompressionBadge(
        uploaded.provider === 'supabase'
          ? `✓ Poster Saved to Supabase CDN (${result.compressedSizeKb}KB)`
          : `✓ Poster Saved to Server (${result.compressedSizeKb}KB)`
      );
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload 9:16 poster cover.');
    } finally {
      setIsPosterCompressing(false);
      e.target.value = '';
    }
  };

  const getAspectPreviewClass = () => {
    if (previewAspect === '9:16') return 'aspect-[9/16] max-w-[170px]';
    if (previewAspect === 'landscape') return 'aspect-[16/9] w-full';
    switch (effectiveAspect) {
      case '9:16':
        return 'aspect-[9/16] max-w-[170px]';
      case '3:4':
        return 'aspect-[3/4] max-w-[180px]';
      case '4:5':
        return 'aspect-[4/5] max-w-[190px]';
      case '1:1':
        return 'aspect-square max-w-[210px]';
      case '4:3':
        return 'aspect-[4/3] w-full';
      case '3:2':
        return 'aspect-[3/2] w-full';
      case '16:10':
        return 'aspect-[16/10] w-full';
      case '16:9':
        return 'aspect-[16/9] w-full';
      default:
        return 'aspect-[9/16] max-w-[170px]';
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 text-xs text-white/90">
      <div className="flex items-center justify-between mb-3">
        <label className="font-semibold text-white tracking-wide flex items-center gap-2">
          {resolvedMediaType === 'video' ? (
            <Video className="size-4 text-[#2563EB]" />
          ) : (
            <Image className="size-4 text-[#2563EB]" />
          )}
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {compressionBadge && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="size-2.5" />
              {compressionBadge}
            </span>
          )}
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-[#94A3B8]">
            {resolvedMediaType} · {effectiveAspect}
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="mb-3 rounded bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Visual Preview Box */}
      <div className="relative mb-3 flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black/40 p-2 overflow-hidden">
        <div className={`relative overflow-hidden rounded bg-black/60 shadow-inner ${getAspectPreviewClass()} transition-all duration-300`}>
          {url ? (
            resolvedMediaType === 'video' ? (
              <video
                src={url}
                poster={posterUrl || '/assets/work/luxury-fragrance.jpg'}
                className={`h-full w-full ${effectiveFit === 'contain' ? 'object-contain' : 'object-cover'} ${getFocalClass(
                  effectiveFocal
                )}`}
                controls
                muted
                playsInline
              />
            ) : (
              <img
                src={url}
                alt="Preview"
                className={`h-full w-full ${effectiveFit === 'contain' ? 'object-contain' : 'object-cover'} ${getFocalClass(
                  effectiveFocal
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
            {editingTarget !== 'base' ? `${editingTarget} · ` : ''}
            {effectiveFit} · {effectiveFocal}
          </div>
        </div>

        {/* Aspect Ratio Test Toggles */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
          <span className="text-white/40">Test View:</span>
          <button
            type="button"
            onClick={() => setPreviewAspect('current')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${previewAspect === 'current' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Configured
          </button>
          <button
            type="button"
            onClick={() => setPreviewAspect('9:16')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${previewAspect === '9:16' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            9:16 Vertical
          </button>
          <button
            type="button"
            onClick={() => setPreviewAspect('landscape')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${previewAspect === 'landscape' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            16:9 Landscape
          </button>
        </div>
      </div>

      {/* URL or Upload Input */}
      <div className="grid gap-2 mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              const val = e.target.value;
              const isImg = isImageAssetUrl(val);
              const isVid = isVideoAssetUrl(val);
              onChange({
                url: val,
                type: isImg ? 'image' : isVid ? 'video' : mediaType,
              });
            }}
            placeholder="Asset path or URL (e.g. /assets/work/photo.jpg)"
            className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#2563EB] focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <label className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition ${isCompressing ? 'bg-blue-700 opacity-90 cursor-wait' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'}`}>
              {isCompressing ? <RefreshCw className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              <span>{isCompressing ? compressingLabel : 'Upload'}</span>
              <input
                type="file"
                disabled={isCompressing}
                accept={allowVideo ? 'image/*,video/*,.mp4,.webm,.mov,.m4v,.png,.jpg,.jpeg,.webp' : 'image/*,.png,.jpg,.jpeg,.webp'}
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
            {isCompressing && (
              <button
                type="button"
                onClick={() => setIsCompressing(false)}
                className="text-[10px] text-white/60 hover:text-white underline cursor-pointer px-1 py-1"
                title="Cancel or reset upload button"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Dedicated 9:16 Poster Cover input for Video to prevent black screen */}
        {resolvedMediaType === 'video' && onPosterChange && (
          <div className="rounded-lg border border-[#2563EB]/30 bg-[#2563EB]/10 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white text-[11px] flex items-center gap-1.5">
                <Image className="size-3 text-[#38BDF8]" />
                9:16 Video Poster Cover (Auto-Compressor)
              </span>
              <span className="text-[10px] text-[#38BDF8] font-mono">Prevents Black Screens</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={posterUrl || ''}
                onChange={(e) => onPosterChange(e.target.value)}
                placeholder="Poster image URL (e.g. /assets/work/nelson-trading.png)"
                className="flex-1 rounded border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-white focus:outline-none"
              />
              <div className="flex items-center gap-1">
                <label className={`cursor-pointer flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-white transition ${isPosterCompressing ? 'bg-blue-800 cursor-wait' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'}`}>
                  {isPosterCompressing ? <RefreshCw className="size-3 animate-spin" /> : <Upload className="size-3" />}
                  <span>{isPosterCompressing ? 'Compressing...' : 'Upload 9:16'}</span>
                  <input
                    type="file"
                    disabled={isPosterCompressing}
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    onChange={handlePosterUpload}
                    className="sr-only"
                  />
                </label>
                {isPosterCompressing && (
                  <button
                    type="button"
                    onClick={() => setIsPosterCompressing(false)}
                    className="text-[10px] text-white/60 hover:text-white underline cursor-pointer px-1 py-1"
                    title="Reset poster upload button"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preset Library Toggle */}
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showPresets ? 'Hide SGS Asset Library' : 'Choose from SGS Asset Library'}</span>
          </button>
          {allowVideo && (
            <div className="flex items-center gap-1">
              <span className="text-white/40">Format:</span>
              <button
                type="button"
                onClick={() => onChange({ type: 'image' })}
                className={`px-2 py-0.5 rounded cursor-pointer ${resolvedMediaType === 'image' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'}`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => onChange({ type: 'video' })}
                className={`px-2 py-0.5 rounded cursor-pointer ${resolvedMediaType === 'video' ? 'bg-[#2563EB] text-white font-bold' : 'text-white/50 hover:text-white'}`}
              >
                Video
              </button>
            </div>
          )}
        </div>

        {/* Preset Asset Picker */}
        {showPresets && (
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-black/70 p-2 no-scrollbar">
            {PRESET_ASSETS.map((asset) => (
              <button
                key={asset.url}
                type="button"
                onClick={() => {
                  onChange({ url: asset.url, type: asset.type as 'image' | 'video' });
                  setShowPresets(false);
                }}
                className={`flex items-center gap-1.5 text-left p-1 rounded hover:bg-white/10 transition cursor-pointer ${url === asset.url ? 'bg-[#2563EB]/30 border border-[#2563EB]/40' : ''}`}
              >
                {asset.type === 'video' ? (
                  <span className="size-6 shrink-0 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center">
                    <Video className="size-3.5 text-[#38BDF8]" />
                  </span>
                ) : (
                  <img src={asset.url} alt="" className="size-6 shrink-0 rounded object-cover" />
                )}
                <span className="truncate text-[10px] text-white/90">{asset.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Per-Device Media Sizing & Framing Override Bar */}
      {onResponsiveChange && (
        <div className="border-t border-white/10 pt-3 mt-1 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#94A3B8] font-medium">
              Device Override Target
            </span>
            <div className="flex items-center gap-2">
              {editingTarget !== 'base' && (
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[9px] border ${
                    hasDeviceCustom
                      ? 'bg-[#2563EB]/20 text-[#38BDF8] border-[#2563EB]/40'
                      : 'bg-white/5 text-white/50 border-white/10'
                  }`}
                >
                  {hasDeviceCustom ? 'Custom' : 'Inherited'}
                </span>
              )}
              {hasDeviceCustom && (
                <button
                  type="button"
                  onClick={resetDeviceOverride}
                  className="inline-flex items-center gap-1 text-[10px] text-white/60 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="size-2.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 rounded-lg bg-black/50 p-1 border border-white/10">
            {(
              [
                { id: 'base', label: 'Base', icon: Layers },
                { id: 'laptop', label: 'Laptop', icon: Monitor },
                { id: 'tablet', label: 'Tablet', icon: Tablet },
                { id: 'mobile', label: 'Mobile', icon: Smartphone },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = editingTarget === tab.id;
              const isCustomized =
                tab.id !== 'base' &&
                !!responsiveMedia?.[tab.id] &&
                Object.values(responsiveMedia[tab.id] || {}).some((v) => v !== undefined);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTarget(tab.id)}
                  className={`flex items-center justify-center gap-1 rounded py-1 px-1.5 text-[10px] font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="size-3 shrink-0" />
                  <span>{tab.label}</span>
                  {isCustomized && (
                    <span className="size-1.5 rounded-full bg-[#38BDF8]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Media Format & Cropping Controls */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-2 text-[11px]">
        {/* Aspect Ratio */}
        <div>
          <span className="text-white/50 block mb-1">Aspect Ratio</span>
          <select
            value={effectiveAspect}
            onChange={(e) => updateFraming({ aspectRatio: e.target.value as MediaAspectRatio })}
            className="w-full rounded bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="auto">Auto / Original</option>
            <option value="16:9">16:9 Landscape</option>
            <option value="16:10">16:10 Wide</option>
            <option value="4:3">4:3 Standard</option>
            <option value="3:2">3:2 Photo</option>
            <option value="4:5">4:5 Portrait</option>
            <option value="3:4">3:4 Card</option>
            <option value="9:16">9:16 Vertical</option>
            <option value="1:1">1:1 Square</option>
          </select>
        </div>

        {/* Fit Mode */}
        <div>
          <span className="text-white/50 block mb-1">Fit &amp; Framing</span>
          <select
            value={effectiveFit}
            onChange={(e) => updateFraming({ fit: e.target.value as MediaFitMode })}
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
            value={effectiveFocal}
            onChange={(e) => updateFraming({ focalPoint: e.target.value as MediaFocalPoint })}
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

      {/* Optional Hero Height Scale Override per device */}
      {showHeightScale && editingTarget !== 'base' && onResponsiveChange && (
        <div className="mt-2 pt-2 border-t border-white/5 text-[11px]">
          <span className="text-white/50 block mb-1">
            Media Stage Height ({editingTarget})
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['compact', 'standard', 'tall'] as const).map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => updateFraming({ heightScale: scale })}
                className={`py-1 px-2 rounded text-[10px] font-semibold capitalize border transition cursor-pointer ${
                  effectiveHeightScale === scale
                    ? 'bg-[#2563EB]/25 border-[#2563EB] text-white'
                    : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Optional Caption */}
      {caption !== undefined && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <span className="text-white/50 block mb-1">Caption / Media Label</span>
          <input
            type="text"
            value={caption}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="e.g. Campaign packaging visual study"
            className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs text-white focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
