import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sliders, Grid, RefreshCw, Check, Film, AlertCircle } from 'lucide-react';
import { captureVideoFrame, extractFrameGrid, ExtractedFrame } from '../../utils/videoFrameGrabber.ts';
import { uploadDataUrlAsset } from '../../lib/mediaUpload.ts';
import { useSiteContent } from '../../context/ContentContext.tsx';

interface VideoThumbnailPickerProps {
  videoUrl: string;
  currentPosterUrl?: string;
  onSelectPoster: (posterDataUrl: string) => void;
}

export const VideoThumbnailPicker: React.FC<VideoThumbnailPickerProps> = ({
  videoUrl,
  currentPosterUrl,
  onSelectPoster,
}) => {
  const { getCmsAuthHeaders } = useSiteContent();
  const [activeTab, setActiveTab] = useState<'scrubber' | 'grid'>('scrubber');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [gridFrames, setGridFrames] = useState<ExtractedFrame[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Update video duration on load
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration || 10;
      setDuration(d);
      setCurrentTime(Math.min(1, d / 2));
      videoRef.current.currentTime = Math.min(1, d / 2);
    }
  };

  // Extract grid frames when switching to grid mode or when video changes
  useEffect(() => {
    if (activeTab === 'grid' && gridFrames.length === 0 && videoUrl) {
      loadGridFrames();
    }
  }, [activeTab, videoUrl]);

  const loadGridFrames = async () => {
    if (!videoUrl) return;
    setIsExtracting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const frames = await extractFrameGrid(videoUrl, 5, 270, 480);
      setGridFrames(frames);
    } catch (e) {
      console.warn('Grid extraction error:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  // Scrubber time change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Persist captured 9:16 frame to Supabase Storage CDN (or authenticated server fallback)
  const persistCapturedPoster = async (dataUrl: string, label: string): Promise<string> => {
    const uploaded = await uploadDataUrlAsset(dataUrl, {
      fileName: `poster-${label.replace(/[^a-zA-Z0-9_-]/g, '_')}.webp`,
      folder: 'posters',
      authHeaders: getCmsAuthHeaders(),
    });
    return uploaded.url;
  };

  // Capture current scrubbed frame
  const handleCaptureScrubbedFrame = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const frameDataUrl = await captureVideoFrame(videoRef.current, currentTime, 540, 960);
      const publicUrl = await persistCapturedPoster(frameDataUrl, `scrub-${Math.round(currentTime)}s`);
      onSelectPoster(publicUrl);
      setSuccessMessage(`Captured & saved frame at ${formatTime(currentTime)} as 9:16 poster!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not capture & save frame.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSelectGridFrame = async (frame: ExtractedFrame) => {
    setErrorMessage(null);
    try {
      const publicUrl = await persistCapturedPoster(frame.dataUrl, `grid-${frame.label}`);
      onSelectPoster(publicUrl);
      setSuccessMessage(`Selected & saved frame at ${frame.label} as 9:16 poster!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload selected poster frame.');
    }
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#12161E] p-3.5 space-y-3">
      {/* Header with Mode Toggles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Film className="size-4 text-[#38BDF8]" />
          <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
            Choose Poster From Video
          </span>
        </div>

        {/* Dual Mode Switch */}
        <div className="flex items-center rounded-lg bg-black/50 p-0.5 border border-white/10 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('scrubber')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'scrubber'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders className="size-3" />
            <span>Timeline Scrubber</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Grid className="size-3" />
            <span>5-Frame Grid</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300 animate-in fade-in">
          <Check className="size-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 rounded-lg bg-red-500/15 border border-red-500/30 p-2 text-xs text-red-300 animate-in fade-in">
          <AlertCircle className="size-3.5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MODE 1: TIMELINE SCRUBBER */}
      {activeTab === 'scrubber' && (
        <div className="space-y-3">
          {/* Live Preview Box with 9:16 Guide */}
          <div className="relative aspect-[9/16] w-full max-w-[200px] mx-auto rounded-lg overflow-hidden bg-black border border-white/10 shadow-lg flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl}
              crossOrigin="anonymous"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              className="h-full w-full object-cover"
            />
            {/* Timestamp Badge */}
            <div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white/90 backdrop-blur">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            {/* 9:16 Aspect Overlay Indicator */}
            <div className="absolute bottom-2 right-2 rounded bg-[#2563EB]/85 px-1.5 py-0.5 font-mono text-[9px] text-white backdrop-blur">
              9:16 WEB-P
            </div>
          </div>

          {/* Time Scrubber Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>Scrub Video Timeline</span>
              <span className="font-mono text-white font-medium">
                {formatTime(currentTime)} of {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.1}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
          </div>

          {/* 1-Click Frame Capture Button */}
          <button
            type="button"
            disabled={isCapturing}
            onClick={handleCaptureScrubbedFrame}
            className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-bold text-white shadow-md transition cursor-pointer ${
              isCapturing ? 'bg-blue-800 cursor-wait' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
            }`}
          >
            {isCapturing ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Camera className="size-3.5" />
            )}
            <span>
              {isCapturing ? 'Capturing 9:16 Frame...' : 'Set This Frame as 9:16 Poster Cover'}
            </span>
          </button>
        </div>
      )}

      {/* MODE 2: AUTO-GENERATED 5-FRAME GRID */}
      {activeTab === 'grid' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span>Click any frame to set as 9:16 poster:</span>
            <button
              type="button"
              onClick={loadGridFrames}
              disabled={isExtracting}
              className="text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`size-3 ${isExtracting ? 'animate-spin' : ''}`} />
              <span>Rescan</span>
            </button>
          </div>

          {isExtracting ? (
            <div className="flex flex-col items-center justify-center p-6 text-white/50 text-xs gap-2">
              <RefreshCw className="size-5 animate-spin text-[#2563EB]" />
              <span>Extracting 5 preview frames across video...</span>
            </div>
          ) : gridFrames.length > 0 ? (
            <div className="grid grid-cols-5 gap-1.5">
              {gridFrames.map((frame, idx) => {
                const isSelected = currentPosterUrl === frame.dataUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectGridFrame(frame)}
                    className={`group relative aspect-[9/16] rounded-md overflow-hidden border transition-all cursor-pointer bg-black ${
                      isSelected
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/50 scale-102'
                        : 'border-white/10 hover:border-white/30 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={frame.dataUrl} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[8px] font-mono text-[#38BDF8]">
                      {frame.label}
                    </span>
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#2563EB]/30 flex items-center justify-center">
                        <Check className="size-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-white/40">
              No frames extracted. Click "Rescan" to sample frames.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
