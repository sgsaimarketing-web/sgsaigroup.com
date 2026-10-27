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
  Image,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { CaseStudy, GalleryMediaItem, WorkCategory } from '../../data/siteContent.ts';

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
      aspectRatio: '16:9',
      fit: 'cover',
      focalPoint: 'center',
      caption: `New Media Item ${current.length + 1}`,
    };
    updateGallery(project, [...current, newItem]);
    setEditorNotice(null);
  };

  const removeGalleryItem = (project: CaseStudy, index: number) => {
    const current = getProjectGallery(project);
    if (current.length <= 1) {
      setEditorNotice('A project must have at least one media item in its gallery.');
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
          aspectRatio: '16:9',
          fit: 'cover',
          focalPoint: 'center',
          caption: 'Hero campaign visual',
        },
        {
          id: 'media-1',
          url: '/assets/work/beauty-range.jpg',
          type: 'image',
          aspectRatio: '4:5',
          fit: 'cover',
          focalPoint: 'center',
          caption: 'Portrait packaging study',
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
    <div className="space-y-6 text-sm">
      {/* Category Pills Selector */}
      <div className="rounded-xl border border-white/10 bg-[#161B22] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="size-4 text-[#2563EB]" />
            Section 05 · Selected Work Manager
          </h3>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            {siteData.caseStudies.length} Projects Total
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 pb-2">
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
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-black/40 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Projects List vs Selected Project Details */}
      {!activeProject ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Projects in Category ({filteredProjects.length})
            </h4>
            <button
              type="button"
              onClick={handleAddNewProject}
              className="flex items-center gap-1 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
            >
              <Plus className="size-3.5" />
              Add Project
            </button>
          </div>

          <div className="space-y-3">
            {filteredProjects.map((proj, idx) => (
              <div
                key={proj.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#161B22] p-3 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={proj.coverImage}
                    alt=""
                    className="size-14 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        0{idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                        {proj.sector}
                      </span>
                      {proj.hasVideo && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                          <Video className="size-2.5" /> Video
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-white text-sm truncate mt-0.5">
                      {proj.title}
                    </p>
                    <p className="text-[11px] text-white/50 truncate max-w-sm">
                      {proj.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move Up"
                    disabled={idx === 0}
                    onClick={() => moveProject(idx, 'up')}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move Down"
                    disabled={idx === filteredProjects.length - 1}
                    onClick={() => moveProject(idx, 'down')}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate Project"
                    onClick={() => duplicateCaseStudy(proj.id)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                  >
                    <Copy className="size-3.5" />
                  </button>

                  {deleteConfirmId === proj.id ? (
                    <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 rounded px-1.5 py-0.5">
                      <span className="text-[10px] text-red-300">Confirm?</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteCaseStudy(proj.id);
                          setDeleteConfirmId(null);
                        }}
                        className="text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-1.5 py-0.5 rounded"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] text-white/60 hover:text-white px-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Delete Project"
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setDeleteConfirmId(null);
                      setEditorNotice(null);
                    }}
                    className="flex items-center gap-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white ml-2"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Full Project Editor */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setSelectedProjectId(null)}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1"
            >
              ← Back to Projects List
            </button>
            <span className="font-mono text-xs text-[#2563EB]">
              Editing Project: {activeProject.title}
            </span>
          </div>

          {/* Core Info */}
          <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-4">
            <h4 className="font-display font-bold text-white text-sm">
              Project Meta & Categorization
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
                  className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Subtitle / Brief</label>
              <textarea
                rows={2}
                value={activeProject.subtitle}
                onChange={(e) =>
                  updateSingleCaseStudy(activeProject.id, { subtitle: e.target.value })
                }
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Category</label>
                <select
                  value={activeProject.categoryId}
                  onChange={(e) => {
                    const cat = siteData.workCategories.find((c) => c.id === e.target.value);
                    updateSingleCaseStudy(activeProject.id, {
                      categoryId: e.target.value,
                      categoryLabel: cat?.label || activeProject.categoryLabel,
                    });
                  }}
                  className="w-full rounded bg-black/60 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {siteData.workCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Index String</label>
                <input
                  type="text"
                  value={activeProject.index}
                  onChange={(e) =>
                    updateSingleCaseStudy(activeProject.id, { index: e.target.value })
                  }
                  className="w-full rounded bg-black/50 border border-white/10 px-2 py-1 text-xs text-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={!!activeProject.hasVideo}
                    onChange={(e) =>
                      updateSingleCaseStudy(activeProject.id, { hasVideo: e.target.checked })
                    }
                    className="rounded border-white/20 bg-black/50 text-[#2563EB] focus:ring-0"
                  />
                  <span>Has Video Playback</span>
                </label>
              </div>
            </div>
          </div>

          {/* Project Cover Media */}
          <MediaControl
            label="Hero Cover Visual"
            url={activeProject.coverImage}
            mediaType={activeProject.hasVideo ? 'video' : 'image'}
            fit={activeProject.coverFit || 'cover'}
            focalPoint={activeProject.coverFocalPoint || 'center'}
            aspectRatio="16:9"
            onChange={(patch) => {
              updateSingleCaseStudy(activeProject.id, {
                coverImage: patch.url || activeProject.coverImage,
                coverFit: patch.fit,
                coverFocalPoint: patch.focalPoint,
              });
            }}
          />

          {/* Rich Gallery Media Items (Mixed Portrait & Landscape, Video & Image) */}
          <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-white text-sm">
                  Project Detail Gallery Media
                </h4>
                <p className="text-[11px] text-[#94A3B8]">
                  Supports mixed portrait (4:5, 9:16), landscape (16:9, 3:2), square (1:1), images & videos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => addGalleryItem(activeProject)}
                className="flex items-center gap-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition"
              >
                <Plus className="size-3.5" />
                Add Media Item
              </button>
            </div>

            {editorNotice && (
              <div className="rounded bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-300 flex items-center justify-between">
                <span>{editorNotice}</span>
                <button
                  type="button"
                  onClick={() => setEditorNotice(null)}
                  className="text-amber-300 hover:text-white text-xs underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="space-y-4">
              {getProjectGallery(activeProject).map((item, gIdx) => (
                <div
                  key={item.id || gIdx}
                  className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2563EB]">
                      Gallery Asset 0{gIdx + 1} · {item.type} ({item.aspectRatio || 'auto'})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move Up"
                        disabled={gIdx === 0}
                        onClick={() => moveGalleryItem(activeProject, gIdx, 'up')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        title="Move Down"
                        disabled={gIdx === getProjectGallery(activeProject).length - 1}
                        onClick={() => moveGalleryItem(activeProject, gIdx, 'down')}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                      <button
                        type="button"
                        title="Delete Media Item"
                        onClick={() => removeGalleryItem(activeProject, gIdx)}
                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 ml-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>

                  <MediaControl
                    label={`Asset 0${gIdx + 1}`}
                    url={item.url}
                    mediaType={item.type}
                    fit={item.fit || 'cover'}
                    focalPoint={item.focalPoint || 'center'}
                    aspectRatio={item.aspectRatio || '16:9'}
                    caption={item.caption}
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

          {/* Dossier Fields (Challenge, Approach, Execution, Outcome) */}
          <div className="rounded-xl border border-white/10 bg-[#161B22] p-4 space-y-4">
            <h4 className="font-display font-bold text-white text-sm">
              Case Study Dossier (Popup Content)
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                The Challenge
              </label>
              <textarea
                rows={2}
                value={activeProject.challenge}
                onChange={(e) =>
                  updateSingleCaseStudy(activeProject.id, { challenge: e.target.value })
                }
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Our Approach
              </label>
              <textarea
                rows={2}
                value={activeProject.approach}
                onChange={(e) =>
                  updateSingleCaseStudy(activeProject.id, { approach: e.target.value })
                }
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                The Execution
              </label>
              <textarea
                rows={2}
                value={activeProject.execution}
                onChange={(e) =>
                  updateSingleCaseStudy(activeProject.id, { execution: e.target.value })
                }
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                The Outcome
              </label>
              <textarea
                rows={2}
                value={activeProject.outcome}
                onChange={(e) =>
                  updateSingleCaseStudy(activeProject.id, { outcome: e.target.value })
                }
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                Category Tags (Comma separated)
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
                placeholder="Brand Strategy, Creative Campaign, Video Production"
                className="w-full rounded bg-black/50 border border-white/10 px-2.5 py-1.5 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
