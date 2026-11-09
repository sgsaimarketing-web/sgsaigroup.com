# Server-Side Public Media Pipeline & Live Showcase Publishing

Resolve why website visitors cannot view uploaded videos by replacing local browser-only `blob:` URLs with a server-side media pipeline that saves uploads to `/public/assets/uploads/`, and permanently publish "Nelson Trading Launch" to the production codebase.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed in Phase 1 clarification:
> - **Video Storage Strategy**: Server-side storage. Video uploads will be saved to `/public/assets/uploads/` via a dedicated server endpoint (`/api/upload-media`), making them publicly accessible to every visitor worldwide.
> - **Live Content Publishing**: Publish the "Nelson Trading Launch" showcase with its 9:16 vertical video reel and poster assets directly into `src/data/siteContent.ts`, ensuring external visitors and viewers see it immediately on both development and shared URLs.

---

### 1. Overview & Core Concept
- **The Core Problem**: 
  1. When a video is uploaded in the CMS editor, standard browser file handling generates a local `blob:` URL (e.g. `blob:http://localhost:3000/...`).
  2. `blob:` URLs are ephemeral and scoped solely to that specific browser instance. External visitors on different devices, in incognito mode, or visiting the shared URL cannot access another client's local memory.
  3. Unpublished draft updates remain in the admin's local storage rather than the server codebase.
- **The Solution**:
  1. Implement a server-side upload handler (`/api/upload-media`) in Vite server middlewares that writes uploaded video files and posters into `/public/assets/uploads/`.
  2. Return public server URLs (`/assets/uploads/[filename].mp4`) that are streamed identically to all public visitors.
  3. Publish "Nelson Trading Launch" into the default production dataset (`src/data/siteContent.ts`) with active 9:16 vertical video stream (`/assets/nira-loop.mp4` / uploaded reel) and matching poster cover.

---

### 2. User Experience & Visual Design

- **Visitor Experience**:
  - Visitors browsing Section 05 Selected Work immediately see the **"Nelson Trading Launch"** 9:16 mobile-first vertical card with badge `01 · VIDEO REEL`.
  - Clicking the card or the center play icon opens the full-screen cinematic modal theater.
  - Video streams instantaneously without decoder stalls or "Video stream unavailable" screens.
- **Admin CMS Experience**:
  - In CMS Editor > Selected Work > Tab 1 (Media), uploading a video file now triggers a server upload with progress indicator.
  - CMS displays the generated permanent public URL (`/assets/uploads/...`) instead of a transient `blob:` URL.
  - The "Publish to Live Site" button permanently commits all changes to `src/data/siteContent.ts`, refreshing both the dev and shared preview environments.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Public Asset Hosting vs. Third-Party Cloud CDN**
  - *Chosen Approach*: Server-side `/public/assets/uploads/` endpoint embedded directly into the applet server.
  - *Why*: Zero external API key dependencies, instant zero-latency loading, persistent static file serving across all visitors and shared URLs.
- **Decision 2: Immediate Codebase Publishing for Nelson Trading Launch**
  - *Chosen Approach*: Commit "Nelson Trading Launch" into `src/data/siteContent.ts` as the primary showcase project.
  - *Why*: Visitors and reviewers loading the site for the first time will immediately see the updated title, 9:16 vertical video, and executive dossier without requiring CMS authentication.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT BROWSER                        │
│                                                             │
│   Public Visitor View             Admin CMS Editor          │
│   ┌─────────────────────┐         ┌───────────────────────┐ │
│   │ Section 05 Grid     │         │ Tab 1: Media Upload   │ │
│   │ Nelson Trading Card │         │ Video / Thumbnail     │ │
│   └──────────┬──────────┘         └───────────┬───────────┘ │
│              │                                │             │
│              │ Streams public URL             │ POST File   │
└──────────────┼────────────────────────────────┼─────────────┘
               │                                │
               ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER RUNTIME                         │
│                                                             │
│   Static Asset Server             /api/upload-media         │
│   /assets/uploads/*.mp4    ◄────  Writes file to disk       │
│                                   in /public/assets/uploads │
│                                                             │
│   src/data/siteContent.ts  ◄────  /api/save-content         │
│   (Permanent Live Data)           (Commits Nelson project)  │
└─────────────────────────────────────────────────────────────┘
```

#### Key Implementation Steps:
1. **Server Endpoint (`vite.config.ts`)**: Add multipart/streaming endpoint `/api/upload-media` to parse incoming files and write them to `/public/assets/uploads/`.
2. **CMS Media Uploader (`MediaControl.tsx` & `SelectedWorkEditor.tsx`)**:
   - Send uploaded files to `/api/upload-media`.
   - On success, set `videoUrl` and `posterUrl` to the returned server asset path (`/assets/uploads/...`).
3. **Production Data Update (`src/data/siteContent.ts`)**:
   - Update `CASE_STUDIES[0]` with "Nelson Trading Launch", sector "FMCG", category `brand-campaigns`, valid 9:16 video stream, and high-resolution poster.
4. **Verification**:
   - Verify server upload round-trip and static asset serving.
   - Run full automated test suite (`src/data/*.test.ts`).
   - Co-execute `compile_applet` and `lint_applet`.
