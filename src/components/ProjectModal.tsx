import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Video,
  X,
} from 'lucide-react';
import { CaseStudy, GalleryMediaItem } from '../data/siteContent.ts';
import { useEffectiveDevice } from '../hooks/useEffectiveDevice.ts';
import { useFocusTrap } from '../hooks/useFocusTrap.ts';
import {
  getAspectRatioClass,
  getFocalClass,
  isImageAssetUrl,
  isVideoAssetUrl,
  resolveMediaForDevice,
} from '../utils/responsiveMedia.ts';

interface ProjectModalProps {
  project: CaseStudy | null;
  allProjects: CaseStudy[];
  onClose: () => void;
  onSelectProject: (project: CaseStudy) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  allProjects,
  onClose,
  onSelectProject,
}) => {
  const device = useEffectiveDevice();
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(Boolean(project), containerRef);

  // Prevent background scrolling when modal is open & autofocus modal
  useEffect(() => {
    if (!project) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    containerRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [project]);

  useEffect(() => {
    setActiveMediaIndex(0);
    setVideoProgress(0);
    setVideoError(false);
    if (project?.hasVideo) {
      setIsPlayingVideo(true);
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current
            .play()
            .then(() => setIsPlayingVideo(true))
            .catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current
                  .play()
                  .then(() => setIsPlayingVideo(true))
                  .catch(() => {});
              }
            });
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsPlayingVideo(false);
    }
  }, [project]);

  const currentCategoryProjects = project
    ? allProjects.filter((p) => p.categoryId === project.categoryId)
    : [];
  const currentProjectIdx = project
    ? currentCategoryProjects.findIndex((p) => p.id === project.id)
    : -1;

  const handleNextProject = useCallback(() => {
    if (currentCategoryProjects.length <= 1) return;
    const nextIdx = (currentProjectIdx + 1) % currentCategoryProjects.length;
    onSelectProject(currentCategoryProjects[nextIdx]);
  }, [currentCategoryProjects, currentProjectIdx, onSelectProject]);

  const handlePrevProject = useCallback(() => {
    if (currentCategoryProjects.length <= 1) return;
    const prevIdx =
      (currentProjectIdx - 1 + currentCategoryProjects.length) % currentCategoryProjects.length;
    onSelectProject(currentCategoryProjects[prevIdx]);
  }, [currentCategoryProjects, currentProjectIdx, onSelectProject]);

  const defaultVideoUrl: string =
    project?.videoUrl && isVideoAssetUrl(project.videoUrl)
      ? project.videoUrl
      : '/assets/nira-loop.mp4';
  const defaultPosterUrl: string =
    project?.posterUrl && isImageAssetUrl(project.posterUrl)
      ? project.posterUrl
      : isImageAssetUrl(project?.coverImage)
      ? (project?.coverImage || '/assets/work/nelson-diamond.png')
      : '/assets/work/nelson-diamond.png';

  const getMediaDisplaySrc = (item?: GalleryMediaItem): string => {
    if (!item) return project?.coverImage || '/assets/work/nelson-diamond.png';
    if (item.type === 'video') {
      if (item.poster && isImageAssetUrl(item.poster)) return item.poster;
      if (project?.posterUrl && isImageAssetUrl(project.posterUrl)) return project.posterUrl;
      if (project?.coverImage && isImageAssetUrl(project.coverImage)) return project.coverImage;
      return '/assets/work/nelson-diamond.png';
    }
    if (item.url && isImageAssetUrl(item.url)) return item.url;
    if (item.poster && isImageAssetUrl(item.poster)) return item.poster;
    return project?.coverImage || '/assets/work/nelson-diamond.png';
  };

  const galleryItems: GalleryMediaItem[] =
    project?.gallery && project.gallery.length > 0
      ? project.gallery.map((g, i) => {
          // Guard against image URLs accidentally tagged as 'video'
          const isItemVideo =
            isVideoAssetUrl(g.url) || (g.type === 'video' && !isImageAssetUrl(g.url));
          const validVideoSrc: string =
            (isVideoAssetUrl(g.url) ? g.url : defaultVideoUrl) || '/assets/nira-loop.mp4';
          const validImgSrc: string =
            (isImageAssetUrl(g.url)
              ? g.url
              : isImageAssetUrl(g.poster)
              ? g.poster
              : defaultPosterUrl) || defaultPosterUrl;

          return {
            ...g,
            id: g.id || `media-${i}`,
            type: isItemVideo ? 'video' : 'image',
            url: isItemVideo ? validVideoSrc : validImgSrc,
            poster: isItemVideo ? (isImageAssetUrl(g.poster) ? g.poster : defaultPosterUrl) : validImgSrc,
            aspectRatio: g.aspectRatio && g.aspectRatio !== 'auto' ? g.aspectRatio : '9:16',
          };
        })
      : project?.thumbnails && project.thumbnails.length > 0
      ? project.thumbnails.map((url, i) => {
          const isFirstVideo = !!project?.hasVideo && i === 0;
          return {
            id: `media-${i}`,
            url: isFirstVideo ? defaultVideoUrl : url,
            type: isFirstVideo ? 'video' : 'image',
            aspectRatio: '9:16',
            fit: project?.coverFit || 'cover',
            focalPoint: project?.coverFocalPoint || 'center',
            caption: `${project?.title || 'Project'} - Asset 0${i + 1}`,
            poster: isImageAssetUrl(url) ? url : defaultPosterUrl,
          };
        })
      : project
      ? [
          {
            id: 'fallback-media',
            url: project.hasVideo ? defaultVideoUrl : defaultPosterUrl,
            type: project.hasVideo ? 'video' : 'image',
            aspectRatio: '9:16',
            fit: project.coverFit || 'cover',
            focalPoint: project.coverFocalPoint || 'center',
            caption: project.title,
            poster: defaultPosterUrl,
          },
        ]
      : [];

  const handleNextMedia = useCallback(() => {
    if (galleryItems.length <= 1) return;
    setActiveMediaIndex((prev) => (prev + 1) % galleryItems.length);
    setIsPlayingVideo(false);
    setVideoError(false);
    setVideoProgress(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [galleryItems.length]);

  const handlePrevMedia = useCallback(() => {
    if (galleryItems.length <= 1) return;
    setActiveMediaIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    setIsPlayingVideo(false);
    setVideoError(false);
    setVideoProgress(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [galleryItems.length]);

  const toggleVideoPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      setIsPlayingVideo(false);
    } else {
      video
        .play()
        .then(() => {
          setIsPlayingVideo(true);
          setVideoError(false);
        })
        .catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlayingVideo(true);
                setVideoError(false);
              })
              .catch(() => setVideoError(true));
          } else {
            setVideoError(true);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        handleNextMedia();
      } else if (e.key === 'ArrowLeft' && !e.shiftKey) {
        handlePrevMedia();
      } else if ((e.key === 'ArrowRight' && e.shiftKey) || e.key.toLowerCase() === 'n') {
        handleNextProject();
      } else if ((e.key === 'ArrowLeft' && e.shiftKey) || e.key.toLowerCase() === 'p') {
        handlePrevProject();
      } else if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleVideoPlayback();
      } else if (e.key.toLowerCase() === 'm') {
        if (videoRef.current) {
          const nextMuted = !videoRef.current.muted;
          videoRef.current.muted = nextMuted;
          setIsMuted(nextMuted);
        }
      } else if (e.key.toLowerCase() === 'f') {
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    project,
    isFullscreen,
    onClose,
    handleNextMedia,
    handlePrevMedia,
    handleNextProject,
    handlePrevProject,
    toggleVideoPlayback,
  ]);

  if (!project) return null;

  const currentMedia = galleryItems[activeMediaIndex] || {
    url: project.coverImage,
    type: 'image' as const,
    fit: 'cover' as const,
    focalPoint: 'center' as const,
    aspectRatio: '9:16' as const,
  };

  const resolvedMedia = resolveMediaForDevice(
    device,
    {
      aspectRatio: currentMedia.aspectRatio || '9:16',
      fit: currentMedia.fit || project.coverFit || 'cover',
      focalPoint: currentMedia.focalPoint || project.coverFocalPoint || 'center',
    },
    currentMedia.responsiveMedia,
    {
      mobile: {
        aspectRatio:
          currentMedia.aspectRatio && currentMedia.aspectRatio !== 'auto'
            ? currentMedia.aspectRatio
            : '3:4',
      },
      tablet: {
        aspectRatio:
          currentMedia.aspectRatio && currentMedia.aspectRatio !== 'auto'
            ? currentMedia.aspectRatio
            : '4:5',
      },
      laptop: {
        aspectRatio:
          currentMedia.aspectRatio && currentMedia.aspectRatio !== 'auto'
            ? currentMedia.aspectRatio
            : '9:16',
      },
    }
  );

  const isLandscapeAspect = ['16:9', '16:10', '3:2', '4:3'].includes(resolvedMedia.aspectRatio);
  const theaterViewportClass = getAspectRatioClass(resolvedMedia.aspectRatio);
  const fitClass = resolvedMedia.fit === 'contain' ? 'object-contain bg-black' : 'object-cover';
  const focalClass = getFocalClass(resolvedMedia.focalPoint);

  const viewportWidthLimit = isLandscapeAspect
    ? 'w-full max-w-[540px]'
    : device === 'mobile'
    ? 'w-full max-w-[270px] max-h-[50dvh]'
    : 'w-full max-w-[340px] sm:max-w-[360px] max-h-[70vh]';

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(isNaN(progress) ? 0 : progress);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * (videoRef.current.duration || 1);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = project?.coverImage || '/assets/work/nelson-diamond.png';
  };

  const handleVideoError = () => {
    if (
      videoRef.current &&
      videoRef.current.src &&
      !videoRef.current.src.endsWith('/assets/nira-loop.mp4')
    ) {
      videoRef.current.src = '/assets/nira-loop.mp4';
      videoRef.current.load();
      setVideoError(false);
    } else {
      setVideoError(true);
    }
  };

  const activePoster = getMediaDisplaySrc(currentMedia);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={`fixed inset-0 z-[100] flex ${
        device === 'mobile' ? 'items-end justify-center p-0' : 'items-center justify-center p-3 sm:p-6'
      } bg-black/90 backdrop-blur-md animate-in fade-in duration-200`}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className={`relative w-full border border-white/10 bg-[#101318] text-white shadow-2xl transition-all focus:outline-none overflow-y-auto ${
          isFullscreen
            ? 'fixed inset-0 max-w-none max-h-none h-full rounded-none'
            : device === 'mobile'
            ? 'max-h-[92dvh] rounded-t-2xl'
            : 'max-w-6xl max-h-[92vh] rounded-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Breadcrumb Bar */}
        <div
          className={`flex items-center justify-between border-b border-white/[0.08] ${
            device === 'mobile' ? 'px-4 py-3' : 'px-6 py-4'
          } bg-[#0F1218] sticky top-0 z-30`}
        >
          <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-[#94A3B8] min-w-0 truncate">
            <span className="font-bold text-white shrink-0">SGS AI GROUP</span>
            <span>/</span>
            <span className="truncate">SELECTED WORK</span>
            {device !== 'mobile' && (
              <>
                <span>/</span>
                <span className="text-white/50 truncate">{project.categoryLabel}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen View (F)'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
              className="flex size-10 sm:size-8 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project modal (Esc)"
              className="flex size-10 sm:size-8 items-center justify-center rounded-full text-[#94A3B8] hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Grid */}
        <div
          className={`grid ${
            device === 'laptop'
              ? 'gap-8 p-6 lg:p-8 grid-cols-12 items-start'
              : device === 'tablet'
              ? 'gap-6 p-6 grid-cols-1'
              : 'gap-5 p-4 grid-cols-1'
          }`}
        >
          {/* Left / Top Column: Adaptive Media Theater */}
          <div className={`${device === 'laptop' ? 'col-span-6' : ''} flex flex-col items-center justify-between`}>
            <div
              className={`relative w-full overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl flex items-center justify-center ${
                device === 'mobile' ? 'p-3 min-h-[300px]' : 'p-4 min-h-[420px] sm:min-h-[500px]'
              }`}
            >
              {/* Subtle Ambient Blurred Backdrop */}
              <div
                className="absolute inset-0 scale-150 opacity-25 blur-3xl pointer-events-none select-none bg-cover bg-center"
                style={{ backgroundImage: `url(${activePoster})` }}
                aria-hidden="true"
              />

              {/* Centered Device-Adaptive Theater Viewport */}
              <div
                className={`relative ${theaterViewportClass} ${viewportWidthLimit} overflow-hidden rounded-xl bg-neutral-950 border border-white/15 shadow-2xl group/media`}
              >
                {currentMedia.type === 'video' ? (
                  <div className="relative h-full w-full flex items-center justify-center bg-black">
                    {videoError ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-[#94A3B8] h-full w-full bg-neutral-900">
                        <Video className="size-10 text-white/30 mb-2" />
                        <p className="text-xs font-semibold text-white">Video stream unavailable</p>
                        <p className="text-[11px] text-white/50 max-w-xs mt-1">
                          Showing poster cover.
                        </p>
                        <img
                          src={activePoster}
                          alt="Poster cover"
                          onError={handleImageError}
                          className="mt-3 size-24 rounded-lg object-cover border border-white/10"
                        />
                        <div className="flex flex-col gap-2 mt-3 w-full max-w-[200px]">
                          <button
                            type="button"
                            onClick={() => {
                              setVideoError(false);
                              if (videoRef.current) {
                                videoRef.current.src = '/assets/nira-loop.mp4';
                                videoRef.current.load();
                                videoRef.current.play().then(() => setIsPlayingVideo(true)).catch(() => setVideoError(true));
                              }
                            }}
                            className="px-3 py-2 rounded-full bg-[#2563EB] text-[11px] text-white font-medium hover:bg-[#1D4ED8] cursor-pointer shadow"
                          >
                            Load SGS Showcase Reel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video
                          key={`modal-video-${currentMedia.id || activeMediaIndex}-${currentMedia.url}`}
                          ref={videoRef}
                          src={currentMedia.url}
                          poster={activePoster}
                          preload="metadata"
                          className={`h-full w-full ${fitClass} ${focalClass}`}
                          muted={isMuted}
                          playsInline
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={() => {
                            setIsPlayingVideo(false);
                            setVideoProgress(100);
                          }}
                          onError={handleVideoError}
                          onClick={toggleVideoPlayback}
                        />

                        {/* Sound Status Pill */}
                        {isPlayingVideo && isMuted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (videoRef.current) {
                                videoRef.current.muted = false;
                                setIsMuted(false);
                              }
                            }}
                            className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-full bg-black/75 hover:bg-black text-white text-[10px] font-mono border border-white/20 backdrop-blur shadow cursor-pointer transition hover:scale-105"
                          >
                            <VolumeX className="size-3 text-amber-400" />
                            <span>Tap for sound</span>
                          </button>
                        )}

                        {/* Center Play Button Overlay */}
                        {!isPlayingVideo && (
                          <button
                            type="button"
                            onClick={toggleVideoPlayback}
                            aria-label="Play video (Space / K)"
                            className="absolute inset-0 m-auto size-16 rounded-full bg-black/60 border border-white/40 backdrop-blur-md flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] transition-all cursor-pointer group/play shadow-2xl z-20"
                          >
                            <Play className="size-7 fill-white text-white ml-1 transition-transform group-hover/play:scale-110" />
                          </button>
                        )}

                        {/* Video Controls Bar */}
                        <div
                          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 flex items-center gap-3 z-20 transition-opacity duration-200 ${
                            device === 'laptop' ? 'opacity-0 group-hover/media:opacity-100' : 'opacity-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={toggleVideoPlayback}
                            aria-label={isPlayingVideo ? 'Pause' : 'Play'}
                            className="text-white hover:text-[#38BDF8] transition cursor-pointer p-1"
                          >
                            {isPlayingVideo ? <Pause className="size-4" /> : <Play className="size-4" />}
                          </button>

                          {/* Progress Scrubber */}
                          <div
                            onClick={handleScrub}
                            className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                          >
                            <div
                              className="h-full bg-[#2563EB] transition-all"
                              style={{ width: `${videoProgress}%` }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.muted = !isMuted;
                                setIsMuted(!isMuted);
                              }
                            }}
                            aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                            className="text-white hover:text-[#38BDF8] transition cursor-pointer p-1"
                          >
                            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative h-full w-full flex items-center justify-center bg-black">
                    <img
                      key={`modal-img-${currentMedia.id || activeMediaIndex}-${getMediaDisplaySrc(currentMedia)}`}
                      src={getMediaDisplaySrc(currentMedia)}
                      alt={`${project.title} asset 0${activeMediaIndex + 1}`}
                      onError={handleImageError}
                      className={`h-full w-full select-none ${fitClass} ${focalClass}`}
                    />
                  </div>
                )}

                {/* Gallery Previous / Next Overlay Controls */}
                {galleryItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevMedia}
                      aria-label="Previous gallery asset (Left Arrow)"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 flex size-10 sm:size-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#2563EB] transition-colors border border-white/20 cursor-pointer z-10"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMedia}
                      aria-label="Next gallery asset (Right Arrow)"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 flex size-10 sm:size-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#2563EB] transition-colors border border-white/20 cursor-pointer z-10"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}

                {/* Aspect Ratio Badge & Caption */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-[#38BDF8] backdrop-blur border border-white/10 uppercase">
                    {resolvedMedia.aspectRatio} · {currentMedia.type}
                  </span>
                  {device !== 'mobile' && currentMedia.caption && (
                    <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur truncate max-w-[140px]">
                      {currentMedia.caption}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Filmstrip Thumbnails */}
            <div className="mt-3 sm:mt-4 flex items-center gap-2 overflow-x-auto w-full pb-2 no-scrollbar justify-start sm:justify-center">
              {galleryItems.map((thumb, idx) => {
                const isSelected = activeMediaIndex === idx;
                const thumbImg = getMediaDisplaySrc(thumb);
                return (
                  <button
                    key={thumb.id || idx}
                    type="button"
                    onClick={() => {
                      setActiveMediaIndex(idx);
                      setIsPlayingVideo(false);
                      setVideoError(false);
                      setVideoProgress(0);
                      if (videoRef.current) {
                        videoRef.current.pause();
                        videoRef.current.currentTime = 0;
                      }
                    }}
                    className={`relative aspect-[3/4] sm:aspect-[9/16] w-12 sm:w-14 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer bg-black ${
                      isSelected
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/50 scale-105'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      key={`thumb-img-${thumb.id || idx}-${thumbImg}`}
                      src={thumbImg}
                      alt={`Thumbnail 0${idx + 1}`}
                      onError={handleImageError}
                      className="h-full w-full object-cover"
                    />
                    {thumb.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="size-3 fill-white text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right / Bottom Column: Case Study Dossier */}
          <div className={`${device === 'laptop' ? 'col-span-6' : ''} flex flex-col justify-between space-y-5 sm:space-y-6`}>
            <div>
              {/* Category & Pagination Counter */}
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#94A3B8]">
                <span className="font-semibold text-[#2563EB]">
                  {project.categoryLabel} / {project.sector}
                </span>
                <span className="font-mono text-white/60">
                  {currentProjectIdx + 1 < 10
                    ? `0${currentProjectIdx + 1}`
                    : currentProjectIdx + 1}{' '}
                  /{' '}
                  {currentCategoryProjects.length < 10
                    ? `0${currentCategoryProjects.length}`
                    : currentCategoryProjects.length}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3
                id="modal-title"
                className={`mt-3 font-display ${
                  device === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl'
                } font-bold leading-tight text-white tracking-[-0.02em]`}
              >
                {project.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {project.subtitle}
              </p>

              {/* Dossier 4 Key Points: 2-column grid on tablet for compact reading */}
              <div
                className={`mt-5 sm:mt-6 border-t border-white/[0.08] pt-4 text-xs ${
                  device === 'tablet' ? 'grid grid-cols-2 gap-5' : 'space-y-4'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                    The Challenge
                  </h4>
                  <p className="text-[#94A3B8] leading-relaxed">{project.challenge}</p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                    Our Approach
                  </h4>
                  <p className="text-[#94A3B8] leading-relaxed">{project.approach}</p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                    The Execution
                  </h4>
                  <p className="text-[#94A3B8] leading-relaxed">{project.execution}</p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
                    The Outcome
                  </h4>
                  <p className="text-[#94A3B8] leading-relaxed">{project.outcome}</p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Category Tags & Next Project Button */}
            <div className="pt-4 border-t border-white/[0.08] space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/70 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrevProject}
                  className="flex items-center gap-1.5 px-3 py-2 min-h-[42px] text-xs text-[#94A3B8] hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextProject}
                  className="flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-2.5 min-h-[42px] text-xs font-bold text-white transition-all shadow-lg shadow-[#2563EB]/25 cursor-pointer"
                >
                  <span>Next Project</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
