import React, { useState } from 'react';
import { useSiteContent } from '../../context/ContentContext.tsx';
import { MediaControl } from './MediaControl.tsx';
import {
  FolderKanban,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  Video,
  Image as ImageIcon,
  Tag,
  CheckCircle,
  FileText,
  Sparkles,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { CaseStudy, GalleryMediaItem, WorkCategory } from '../../data/siteContent.ts';

type ProjectSubTab = 'media' | 'story' | 'dossier';

export const SelectedWorkEditor: React.FC = () => {
  const {
    siteData,
    updateWorkCategories,
    updateCaseStudies,
    updateSingleCaseStudy,
    addCaseStudy,
    deleteCaseStudy,
    duplicateCaseStudy,
  } = useSiteContent();

  const [activeCatId, setActiveCatId] = useState<string>(
    siteData.workCategories[0]?.id || 'brand-campaigns'
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSubTab, setProjectSubTab] = useState<ProjectSubTab>('media');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);

  const filteredProjects = siteData.caseStudies.filter((p) => p.categoryId === activeCatId);
  const activeProject = siteData.caseStudies.find((p) => p.id === selectedProjectId);

  // Gallery Helpers for active project
  const getProjectGallery = (project: CaseStudy): GalleryMediaItem[] => {
    if (project.gallery && project.gallery.length > 0) return project.gallery;
    return project.thumbnails.map((url, i) => ({
      id: `media-${i}`,
      url,
      type: project.hasVideo && i === 0 ? 'video' : 'image',
      aspectRatio: i % 2 === 0 ? '16:9' : '4:5',
      fit: 'cover',
      focalPoint: 'center',
      caption: `Gallery Asset 0${i + 1}`,
    }));
  };

  const updateGallery = (project: CaseStudy, newGallery: GalleryMediaItem[]) => {
    updateSingleCaseStudy(project.id, {
      gallery: newGallery,
      thumbnails: newGallery.map((g) => g.url),
    });
  };

  const addGalleryItem = (project: CaseStudy) => {
    const current = getProjectGallery(project);
    const newItem: GalleryMediaItem = {
      id: `media-${Date.now()}`,
      url: '/assets/work/luxury-fragrance.jpg',
      type: 'image',
      aspectRatio: '9:16',
      fit: 'cover',
      focalPoint: 'center',
      caption: `New 9:16 Asset 0${current.length + 1}`,
      poster: '/assets/work/luxury-fragrance.jpg',
    };
    updateGallery(project, [...current, newItem]);
    setEditorNotice(null);
  };

  const removeGalleryItem = (project: CaseStudy, index: number) => {
    const current = getProjectGallery(project);
    if (current.length <= 1) {
      setEditorNotice('A project profile must have at least one media asset in its gallery.');
      return;
    }
    setEditorNotice(null);
    updateGallery(
      project,
      current.filter((_, i) => i !== index)
    );
  };

  const moveGalleryItem = (project: CaseStudy, index: number, direction: 'up' | 'down') => {
    const current = getProjectGallery(project);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const cloned = [...current];
    const temp = cloned[index];
    cloned[index] = cloned[targetIdx];
    cloned[targetIdx] = temp;
    updateGallery(project, cloned);
  };

  const handleAddNewProject = () => {
    const cat = siteData.workCategories.find((c) => c.id === activeCatId);
    const count = filteredProjects.length + 1;
    const newId = `project-${Date.now()}`;
    const newProj: CaseStudy = {
      id: newId,
      categoryId: activeCatId,
      categoryLabel: cat?.label || 'Selected Work',
      sector: 'Strategic Innovation',
      index: count < 10 ? `0${count}` : `${count}`,
      total: `0${count}`,
      title: 'New Flagship Campaign',
      subtitle:
        'End-to-end creative strategy, cinematic production, and targeted digital distribution.',
      coverImage: '/assets/work/luxury-fragrance.jpg',
      posterUrl: '/assets/work/luxury-fragrance.jpg',
      coverFit: 'cover',
      coverFocalPoint: 'center',
      thumbnails: [
        '/assets/work/luxury-fragrance.jpg',
        '/assets/work/beauty-range.jpg',
        '/assets/work/city-ooh.jpg',
      ],
      gallery: [
        {
          id: 'media-0',
          url: '/assets/work/luxury-fragrance.jpg',
          type: 'image',
          aspectRatio: '9:16',
          fit: 'cover',
          focalPoint: 'center',
          caption: '9:16 Hero campaign visual',
          poster: '/assets/work/luxury-fragrance.jpg',
        },
        {
          id: 'media-1',
          url: '/assets/work/beauty-range.jpg',
          type: 'image',
          aspectRatio: '9:16',
          fit: 'cover',
          focalPoint: 'center',
          caption: '9:16 Packaging study',
          poster: '/assets/work/beauty-range.jpg',
        },
      ],
      challenge:
        'Deliver decisive market cut-through in a crowded regional sector while accelerating brand prestige.',
      approach:
        'Unite high-impact creative storytelling with data-driven audience segmentation and omnichannel delivery.',
      execution:
        'Multi-platform campaign rollout, bespoke packaging architecture, dynamic OOH displays, and digital content kits.',
      outcome:
        'Substantial growth in customer acquisition, elevated brand recall, and record commercial performance.',
      tags: ['Creative Strategy', 'Production', 'Digital Marketing'],
      hasVideo: false,
    };
    addCaseStudy(newProj);
    setSelectedProjectId(newId);
    setProjectSubTab('media');
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredProjects.length) return;
    const all = [...siteData.caseStudies];
    const itemA = filteredProjects[index];
    const itemB = filteredProjects[targetIdx];
    const posA = all.findIndex((p) => p.id === itemA.id);
    const posB = all.findIndex((p) => p.id === itemB.id);
    if (posA !== -1 && posB !== -1) {
      all[posA] = itemB;
      all[posB] = itemA;
      updateCaseStudies(all);
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Category Tabs Pill Bar */}
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <FolderKanban className="size-3.5 text-[#2563EB]" />
            <span>05 · Selected Work Manager</span>
          </h3>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            {siteData.caseStudies.length} Deployments Total
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {siteData.workCategories.map((cat) => {
            const count = siteData.caseStudies.filter((p) => p.categoryId === cat.id).length;
            const isSelected = activeCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCatId(cat.id);
                  setSelectedProjectId(null);
                  setDeleteConfirmId(null);
                  setEditorNotice(null);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-black/30 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="truncate">{cat.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-mono ml-1 shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View: Projects List vs Selected Project 3-Tab Editor */}
      {!activeProject ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              {siteData.workCategories.find((c) => c.id === activeCatId)?.label} ({filteredProjects.length})
            </h4>
            <button
              type="button"
              onClick={handleAddNewProject}
              className="flex items-center gap-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              Add Project
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredProjects.map((proj, idx) => (
              <div
                key={proj.id}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-[#161B22] p-2.5 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={proj.coverImage}
                    alt=""
                    className="size-12 rounded-lg object-cover border border-white/10 shrink-0 bg-black/40"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#2563EB]">
                        0{idx + 1}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#94A3B8] truncate max-w-[110px]">
                        {proj.sector}
                      </span>
                      {proj.hasVideo && (
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono shrink-0">
                          <Video className="size-2.5" /> Video
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-white text-xs truncate mt-0.5">
                      {proj.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move Up"
                    disabled={idx === 0}
                    onClick={() => moveProject(idx, 'up')}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move Down"
                    disabled={idx === filteredProjects.length - 1}
                    onClick={() => moveProject(idx, 'down')}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate Project"
                    onClick={() => duplicateCaseStudy(proj.id)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                  </button>

                  {deleteConfirmId === proj.id ? (
                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 rounded px-1.5 py-0.5">
                      <span className="text-[10px] text-red-300">Delete?</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteCaseStudy(proj.id);
                          setDeleteConfirmId(null);
                        }}
                        className="text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] text-white/60 hover:text-white px-1 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Delete Project"
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setProjectSubTab('media');
                      setDeleteConfirmId(null);
                      setEditorNotice(null);
                    }}
                    className="flex items-center gap-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white ml-1 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Streamlined 3-Tab Project Profile Editor */
        <div className="space-y-4">
          {/* Top Bar with Back Link */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => setSelectedProjectId(null)}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Projects</span>
            </button>
            <span className="font-mono text-[11px] text-[#94A3B8] truncate max-w-[200px]">
              {activeProject.title}
            </span>
          </div>

          {/* Clean 3-Tab Navigation Bar */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              type="button"
              onClick={() => setProjectSubTab('media')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                projectSubTab === 'media'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="size-3.5" />
              <span>Media</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectSubTab('story')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                projectSubTab === 'story'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="size-3.5" />
              <span>Story</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectSubTab('dossier')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                projectSubTab === 'dossier'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle className="size-3.5" />
              <span>Dossier</span>
            </button>
          </div>

          {/* TAB 1: MEDIA & VISUALS */}
          {projectSubTab === 'media' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* 1. Dedicated 9:16 Vertical Card Poster (Strictly Image, No Video) */}
              <MediaControl
                label="9:16 Vertical Card Poster / Thumbnail Visual"
                url={activeProject.posterUrl || activeProject.coverImage}
                mediaType="image"
                fit={activeProject.coverFit || 'cover'}
                focalPoint={activeProject.coverFocalPoint || 'center'}
                aspectRatio="9:16"
                allowVideo={false}
                onChange={(patch) => {
                  updateSingleCaseStudy(activeProject.id, {
                    coverImage: patch.url || activeProject.coverImage,
                    posterUrl: patch.url || activeProject.posterUrl,
                    coverFit: patch.fit,
                    coverFocalPoint: patch.focalPoint,
                  });
                }}
              />

              {/* 2. Video Playback Badge & Switch */}
              <div className="rounded-xl border border-white/10 bg-[#161B22] p-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-xs block">Video Playback Badge</span>
                  <span className="text-[11px] text-white/50">
                    Shows center play badge on 9:16 cards and opens video stream in theater modal
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={!!activeProject.hasVideo}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, {
                        hasVideo: e.target.checked,
                        videoUrl: e.target.checked
                          ? activeProject.videoUrl || '/assets/nira-loop.mp4'
                          : activeProject.videoUrl,
                      })
                    }
                    className="size-4 rounded border-white/20 bg-black/50 text-[#2563EB] focus:ring-0 cursor-pointer"
                  />
                  <span>Active</span>
                </label>
              </div>

              {/* 3. Dedicated Project Showcase Video Stream */}
              {activeProject.hasVideo && (
                <div className="space-y-2 rounded-xl border border-[#2563EB]/40 bg-[#161B22] p-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                      <Video className="size-3.5" />
                      Showcase Video Stream (9:16 MP4 / WebM)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSingleCaseStudy(activeProject.id, {
                          videoUrl: '/assets/nira-loop.mp4',
                          hasVideo: true,
                        })
                      }
                      className="px-2.5 py-1 rounded bg-[#2563EB]/20 border border-[#2563EB]/40 hover:bg-[#2563EB] text-[10px] text-white font-medium transition cursor-pointer"
                    >
                      Use SGS Showreel Reel
                    </button>
                  </div>

                  <MediaControl
                    label="Showcase Video File or URL"
                    url={activeProject.videoUrl || '/assets/nira-loop.mp4'}
                    mediaType="video"
                    fit="cover"
                    focalPoint="center"
                    aspectRatio="9:16"
                    posterUrl={activeProject.posterUrl || activeProject.coverImage}
                    allowVideo={true}
                    onChange={(patch) => {
                      updateSingleCaseStudy(activeProject.id, {
                        videoUrl: patch.url || activeProject.videoUrl || '/assets/nira-loop.mp4',
                        hasVideo: true,
                      });
                    }}
                  />
                </div>
              )}

              {/* Gallery Media Items */}
              <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                      Modal Gallery Assets ({getProjectGallery(activeProject).length})
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Standardized to 9:16 vertical reels with instant modal playback.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addGalleryItem(activeProject)}
                    className="flex items-center gap-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Add Media
                  </button>
                </div>

                {editorNotice && (
                  <div className="rounded bg-amber-500/10 border border-amber-500/30 p-2 text-xs text-amber-300 flex items-center justify-between">
                    <span>{editorNotice}</span>
                    <button
                      type="button"
                      onClick={() => setEditorNotice(null)}
                      className="text-amber-300 hover:text-white text-xs underline ml-2 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {getProjectGallery(activeProject).map((item, gIdx) => (
                    <div
                      key={item.id || gIdx}
                      className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#2563EB]">
                          Asset 0{gIdx + 1} · {item.type} ({item.aspectRatio || '9:16'})
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Move Up"
                            disabled={gIdx === 0}
                            onClick={() => moveGalleryItem(activeProject, gIdx, 'up')}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            title="Move Down"
                            disabled={gIdx === getProjectGallery(activeProject).length - 1}
                            onClick={() => moveGalleryItem(activeProject, gIdx, 'down')}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="size-3" />
                          </button>
                          <button
                            type="button"
                            title="Delete Asset"
                            onClick={() => removeGalleryItem(activeProject, gIdx)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>

                      <MediaControl
                        label={`Gallery Asset 0${gIdx + 1}`}
                        url={item.url}
                        mediaType={item.type}
                        fit={item.fit || 'cover'}
                        focalPoint={item.focalPoint || 'center'}
                        aspectRatio={item.aspectRatio || '9:16'}
                        caption={item.caption}
                        posterUrl={item.poster || activeProject.posterUrl || activeProject.coverImage}
                        onPosterChange={(poster) => {
                          const gallery = [...getProjectGallery(activeProject)];
                          gallery[gIdx] = {
                            ...gallery[gIdx],
                            poster,
                          };
                          updateGallery(activeProject, gallery);
                        }}
                        allowVideo={true}
                        onChange={(patch) => {
                          const gallery = [...getProjectGallery(activeProject)];
                          gallery[gIdx] = {
                            ...gallery[gIdx],
                            ...patch,
                            url: patch.url || gallery[gIdx].url,
                          };
                          updateGallery(activeProject, gallery);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT STORY */}
          {projectSubTab === 'story' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3.5">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                  Project Identity & Overview
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={activeProject.title}
                      onChange={(e) =>
                        updateSingleCaseStudy(activeProject.id, { title: e.target.value })
                      }
                      className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={activeProject.sector}
                      onChange={(e) =>
                        updateSingleCaseStudy(activeProject.id, { sector: e.target.value })
                      }
                      placeholder="e.g. FMCG, Retail, Enterprise AI"
                      className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">Category Classification</label>
                  <select
                    value={activeProject.categoryId}
                    onChange={(e) => {
                      const cat = siteData.workCategories.find((c) => c.id === e.target.value);
                      updateSingleCaseStudy(activeProject.id, {
                        categoryId: e.target.value,
                        categoryLabel: cat?.label || activeProject.categoryLabel,
                      });
                    }}
                    className="w-full rounded bg-black/60 border border-white/10 px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {siteData.workCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">Subtitle / Strategic Brief</label>
                  <textarea
                    rows={2}
                    value={activeProject.subtitle}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, { subtitle: e.target.value })
                    }
                    placeholder="Short summary displayed under title..."
                    className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Challenge & Approach */}
              <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3.5">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                  Strategic Case Study Foundations
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    The Challenge
                  </label>
                  <textarea
                    rows={3}
                    value={activeProject.challenge}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, { challenge: e.target.value })
                    }
                    placeholder="Client's commercial hurdle or market barrier..."
                    className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    Our Approach
                  </label>
                  <textarea
                    rows={3}
                    value={activeProject.approach}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, { approach: e.target.value })
                    }
                    placeholder="SGS strategic angle, methodology, and creative intelligence..."
                    className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERABLES & DOSSIER */}
          {projectSubTab === 'dossier' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3.5">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                  Execution & Commercial Results
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    The Execution
                  </label>
                  <textarea
                    rows={3}
                    value={activeProject.execution}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, { execution: e.target.value })
                    }
                    placeholder="Deliverables produced: media kits, packaging, AI systems, OOH..."
                    className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    The Outcome
                  </label>
                  <textarea
                    rows={3}
                    value={activeProject.outcome}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, { outcome: e.target.value })
                    }
                    placeholder="Documented business metrics, sell-through, impressions, efficiencies..."
                    className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags & Meta */}
              <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-3.5">
                <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                  Strategic Tags & Navigation Index
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={activeProject.tags.join(', ')}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, {
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Brand Strategy, Video Production, AI Systems"
                    className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                  />
                  {/* Live Chips Preview */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {activeProject.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Index String</label>
                    <input
                      type="text"
                      value={activeProject.index}
                      onChange={(e) =>
                        updateSingleCaseStudy(activeProject.id, { index: e.target.value })
                      }
                      className="w-full rounded bg-black/50 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Total String</label>
                    <input
                      type="text"
                      value={activeProject.total}
                      onChange={(e) =>
                        updateSingleCaseStudy(activeProject.id, { total: e.target.value })
                      }
                      className="w-full rounded bg-black/50 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Finalize Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedProjectId(null)}
              className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer ml-auto"
            >
              <CheckCircle className="size-3.5" />
              <span>Finalize & Close Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
