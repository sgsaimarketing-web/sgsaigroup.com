import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Sparkles, ArrowRight, Video } from 'lucide-react';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreWork?: () => void;
  onStartProject?: () => void;
}

interface ShowreelTrack {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  src: string;
  poster: string;
}

const SHOWREEL_TRACKS: ShowreelTrack[] = [
  {
    id: 'nira-master',
    label: '01 · NIRA AI World',
    title: 'SGS AI Group · Agency Showreel Master',
    subtitle: 'Creative Intelligence × AI Engineering across Malaysia & Singapore.',
    src: '/assets/nira-loop.mp4',
    poster: '/assets/work/cinema-camera.jpg',
  },
  {
    id: 'alzara-reel',
    label: '02 · Alzara FMCG',
    title: 'Alzara Selera Terangkat Commercial Reel',
    subtitle: 'Cinema-grade FMCG culinary production driving +38% consumer trial.',
    src: '/assets/work/alzara-curry-reel.mp4',
    poster: '/assets/work/alzara-curry-poster.webp',
  },
  {
    id: 'mykaapie-reel',
    label: '03 · My Kaapie',
    title: 'My Kaapie Filter Coffee Sensory Launch',
    subtitle: 'Artisanal beverage launch storytelling built for modern retail feeds.',
    src: '/assets/work/mykaapie-coffee-reel.mp4',
    poster: '/assets/work/mykaapie-coffee-poster.webp',
  },
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
}

export const ShowreelModal: React.FC<ShowreelModalProps> = ({
  isOpen,
  onClose,
  onExploreWork,
  onStartProject,
}) => {
  const device = useEffectiveDevice();
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeTrack = SHOWREEL_TRACKS[activeTrackIndex] || SHOWREEL_TRACKS[0];

  // Lock body scroll while showreel is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    containerRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Autoplay real video stream when modal opens or track switches
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    setVideoError(false);
    setProgress(0);
    setCurrentTime(0);

    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = isMuted;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
    }, 80);

    return () => clearTimeout(timer);
  }, [isOpen, activeTrackIndex]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setVideoError(false);
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setVideoError(true));
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isMuted, isPlaying]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const dur = Number.isFinite(video.duration) ? video.duration : 0;
    const curr = video.currentTime || 0;
    setCurrentTime(curr);
    setDuration(dur);
    setProgress(dur > 0 ? (curr / dur) * 100 : 0);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
    setProgress(pos * 100);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="showreel-title"
      className={`fixed inset-0 z-[110] flex items-center justify-center ${
        device === 'mobile' ? 'p-3' : 'p-4 sm:p-6'
      } bg-black/90 backdrop-blur-md animate-in fade-in duration-200`}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-lg sm:rounded-sm border border-white/15 bg-[#101318] text-white shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div
          className={`flex items-center justify-between border-b border-white/10 ${
            device === 'mobile' ? 'px-4 py-3' : 'px-6 py-4'
          } bg-[#151922]`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/20 text-[#2563EB]">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 id="showreel-title" className="font-display text-xs sm:text-sm font-bold tracking-tight text-white truncate">
                {activeTrack.title}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#94A3B8] truncate">
                {activeTrack.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close showreel"
            className="flex size-10 sm:size-8 shrink-0 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Real Video Canvas Container */}
        <div
          className={`relative ${
            device === 'mobile' ? 'aspect-[4/3]' : 'aspect-[16/9]'
          } w-full bg-black overflow-hidden flex items-center justify-center group`}
        >
          {videoError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-[#94A3B8] h-full w-full bg-[#0C0F14]">
              <Video className="size-10 text-white/30 mb-3" />
              <p className="text-sm font-semibold text-white">Showreel stream interrupted</p>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">
                Select another studio reel below or reload the master NIRA sequence.
              </p>
              <button
                type="button"
                onClick={() => {
                  setVideoError(false);
                  setActiveTrackIndex(0);
                }}
                className="mt-4 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                Reload Master Reel
              </button>
            </div>
          ) : (
            <>
              <video
                key={activeTrack.id}
                ref={videoRef}
                src={activeTrack.src}
                poster={activeTrack.poster}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
                onClick={togglePlayback}
                className="h-full w-full object-contain bg-black cursor-pointer"
              />

              {/* Subtle Top Vignette & Brand Watermark */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent" />

              {/* Center Play Button Overlay when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-label="Play showreel"
                  className={`absolute inset-0 m-auto ${
                    device === 'mobile' ? 'size-14' : 'size-20'
                  } rounded-full bg-[#2563EB]/95 hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all cursor-pointer z-10`}
                >
                  <Play className={`${device === 'mobile' ? 'size-6' : 'size-8'} fill-white ml-1`} />
                </button>
              )}

              {/* Bottom Player Controls */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-2.5 z-20">
                {/* Interactive Scrubber Bar */}
                <div
                  role="slider"
                  aria-label="Showreel timeline"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  onClick={handleScrub}
                  className="w-full bg-white/25 h-2 sm:h-1.5 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
                >
                  <div
                    className="bg-[#2563EB] h-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#CBD5E1]">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-1 font-medium"
                    >
                      {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <span className="tabular-nums font-mono text-[11px] text-[#94A3B8]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-1"
                    >
                      {isMuted ? <VolumeX className="size-4 text-amber-400" /> : <Volume2 className="size-4 text-emerald-400" />}
                      <span>{isMuted ? 'Tap for Sound' : 'Sound On'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Track Switcher & CMO Conversion Actions */}
        <div
          className={`border-t border-white/10 bg-[#151922] ${
            device === 'mobile' ? 'p-4 space-y-3' : 'px-6 py-4 flex items-center justify-between gap-4'
          }`}
        >
          {/* Reel Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {SHOWREEL_TRACKS.map((track, idx) => {
              const active = idx === activeTrackIndex;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setActiveTrackIndex(idx)}
                  className={`px-3 py-1.5 min-h-[34px] rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {track.label}
                </button>
              );
            })}
          </div>

          {/* Direct Next Step CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onExploreWork && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreWork();
                }}
                className="px-4 py-2 min-h-[38px] rounded-full border border-white/15 text-xs font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Explore Selected Work
              </button>
            )}
            {onStartProject && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartProject();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
