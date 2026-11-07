# Implementation Plan: Fix Section 05 Showcase Video & Decoupled 9:16 Playback

Solve the "Video stream unavailable" and broken poster cover error in Section 05 Selected Work by decoupling image posters from video streams, providing a verified pre-loaded SGS showcase reel (`/assets/nira-loop.mp4`), and adding clean dual-input management in the CMS editor.

---

## User Review Required

> [!IMPORTANT]
> **Decoupled Video & Poster Architecture**: 
> Previously, the system attempted to feed `.jpg` image URLs into HTML5 `<video src="...">` tags, and video URLs into `<img>` tags, resulting in decoding failures and broken image icons. We are enforcing strict asset separation:
> - **Card / Poster Visual**: Always a high-resolution 9:16 image (WebP/JPG).
> - **Video Stream**: A dedicated MP4/WebM video stream (pre-loaded with SGS showcase reel `/assets/nira-loop.mp4`, or custom uploaded video).

---

## Proposed Changes

### 1. Pre-loaded Video Data & Asset Alignment
#### `src/data/siteContent.ts`
- Populate `videoUrl: '/assets/nira-loop.mp4'` and `posterUrl: '/assets/work/luxury-fragrance.jpg'` for all video showcase case studies.
- Ensure `gallery` items with `type: 'video'` use `url: '/assets/nira-loop.mp4'` as their playable stream and `poster: '/assets/work/luxury-fragrance.jpg'` as their poster frame.
- Guarantee that `coverImage` is always a valid image asset, never a raw video stream.

### 2. Bulletproof Video & Poster Renderer
#### `src/components/ProjectModal.tsx`
- **Smart Stream Validation**: When `currentMedia.type === 'video'`, verify whether `currentMedia.url` is a genuine video stream (`.mp4`, `.webm`, `blob:`, `data:video/`). If it is accidentally an image URL (e.g. `.jpg`), automatically route the video source to `project.videoUrl || '/assets/nira-loop.mp4'` and use the image as the poster.
- **Image Fallback Protection**: Ensure `activePoster` is guaranteed to be an image. If `coverImage` or `posterUrl` contains a video format, fallback to `/assets/work/luxury-fragrance.jpg` so `<img>` tags never throw broken image icons.
- **Instant Playback**: Pre-load video metadata and auto-start playback smoothly when opened from a card with a video badge.

### 3. Dedicated CMS Video & Poster Management
#### `src/components/editor/SelectedWorkEditor.tsx` & `src/components/editor/MediaControl.tsx`
- **Separated Tab 1 Inputs**:
  - Input A: **"9:16 Vertical Card Poster Visual"** (Image only, auto-compresses to WebP, updates card display).
  - Input B: **"Project Showcase Video (9:16 MP4 / WebM)"** (Video upload via native ObjectURL or direct file, saves to `videoUrl`, auto-activates `hasVideo`).
  - Input C: **"Use SGS Showreel Reel"** one-click preset button to instantly load `/assets/nira-loop.mp4`.
- **Modal Gallery Asset Separation**: When adding or editing gallery assets, provide separate controls for the video stream and the 9:16 poster preview.

### 4. Card Poster Display Safety
#### `src/components/SelectedWork.tsx`
- Ensure the card `<img src={...}>` resolves to `project.posterUrl || project.coverImage`, ignoring any raw video strings to prevent card rendering failures.

---

## Verification Plan

### Automated Tests
- Run `npx tsx --test src/data/*.test.ts`:
  - Verify all 26+ existing tests pass.
  - Add test verifying `videoUrl` points to a genuine video stream (`.mp4`/`.webm`/`blob:`) while `coverImage` points to an image.
  - Add test verifying `ProjectModal` falls back to `/assets/nira-loop.mp4` when an image is accidentally flagged as a video.

### Compilation & Static Build
- Co-execute `compile_applet` and `lint_applet` (`tsc --noEmit`).
- Run `npm run build` to verify full Vite production bundle creation with zero warnings or errors.
