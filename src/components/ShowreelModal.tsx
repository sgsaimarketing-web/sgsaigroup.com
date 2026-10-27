import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '../data/siteContent.ts';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShowreelModal: React.FC<ShowreelModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 250);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="showreel-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-sm border border-white/15 bg-[#101318] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#151922]">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-[#2563EB]/20 text-[#2563EB]">
              <Sparkles className="size-4" />
            </span>
            <div>
              <h2 id="showreel-title" className="font-display text-sm font-bold tracking-tight text-white">
                SGS AI Group · 2026 Agency Showreel Teaser
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                Creative Intelligence × AI Engineering · Malaysia &amp; Singapore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close showreel"
            className="flex size-8 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-[16/9] w-full bg-black overflow-hidden flex items-center justify-center">
          <img
            src="/assets/work/cinema-camera.jpg"
            alt="Agency showreel studio frame"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

          {/* Center Play Indicator */}
          <div className="relative text-center p-8 z-10">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause showreel' : 'Play showreel'}
              className="size-20 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(37,99,235,0.6)] transition-all cursor-pointer group"
            >
              {isPlaying ? (
                <Pause className="size-8 fill-white" />
              ) : (
                <Play className="size-8 fill-white ml-1" />
              )}
            </button>

            <p className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              HUMAN THINKING. INTELLIGENT EXECUTION.
            </p>
            <p className="text-sm text-[#CBD5E1] mt-2 max-w-md mx-auto">
              Showcasing commercial advertising, luxury product cinematography, and AI software engineering across ASEAN.
            </p>
          </div>

          {/* Bottom Player Controls */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-3">
            {/* Scrubber Progress Bar */}
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden cursor-pointer">
              <div
                className="bg-[#2563EB] h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <span>00:1{Math.floor(progress / 10)} / 01:00</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
                <span className="text-[10px] uppercase tracking-wider text-[#2563EB] font-bold">
                  4K ProRes Studio Master
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
