# SGS AI Group Official Website Master Implementation Plan

Architectural blueprint and visual engineering specification to recreate the SGS AI Group official single-page website based faithfully on the approved visual master mockup (`/public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png`), achieving creative pedigree on par with BBDO and Leo Burnett while preserving 100% static Cloudflare Pages compatibility.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The approved visual master (`/public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png`) governs the layout, spatial hierarchy, typography, and interactive components. The following decisions are confirmed:

- **Industry Section Slider**: The 5 industry tracks (FMCG, Industrial & Essential Services, Retail & Commerce, SMEs & Professional Services, Distribution & Supply Chain) will be presented via a fluid, responsive horizontal slider with custom arrow controls (`←` and `→`), exactly as shown in Section 03 of the approved mockup.
- **Hero Video & Showreel Teaser**: The hero features the cinematic NIRA AI World with subtle ambient motion, the headline *"WE BUILD WHAT MOVES BUSINESS FORWARD."*, and dual action buttons: *"Explore Our Work →"* (scrolls directly to Section 05) and *"Watch Showreel ▷"* (opens an interactive video player modal previewing client AI teasers with zero initial page load performance penalty).
- **Interactive Selected Work (Section 05) & Case Study Modal**: 4 interactive categories (*Brand & Campaigns*, *Packaging & Product Experience*, *Corporate & Industrial Solutions*, *AI Systems & Business Automation*) with active category filtering. Clicking *"View Project →"* opens the high-end dark cinematic popup overlay shown in the approved mockup, complete with Challenge, Approach, Execution, Outcome, capability tags, filmstrip thumbnail gallery, and in-modal *"Next Project →"* navigation without page redirection.
- **Verified SGS Credentials**: Retains verified contact coordinates (`+60 11-3944 0907` for TK / Executive Director, `+60 17-270 8575` for appointments, `sgsaimarketing@gmail.com`, regional coverage for Malaysia & Singapore).

---

## 1. Overview & Core Concept

- **What It Does**: The official corporate web experience for **SGS AI Group** (Master company integrating creative intelligence, strategic marketing, and AI engineering) and **SGS AI Marketing** (the dedicated creative and digital marketing company serving Malaysia and Singapore).
- **Brand Philosophy**: *"Human Thinking. Intelligent Execution."*
- **Brand Positioning**: *"Creative Intelligence × AI Engineering"*.
- **Target Audience**: C-suite executives, marketing directors, brand leaders, and SME/enterprise founders across Southeast Asia seeking world-class creative campaigns backed by automated business intelligence and generative engineering.
- **Key Value Proposition**: Bridging the gap between agency-grade creative intuition (Leo Burnett / BBDO standard) and enterprise software reliability.

---

## 2. User Experience & Visual Design

### Section Flow & Visual Rhythm

The interface sequences alternating dark cinematic and luminous white architectural surfaces to establish cadence:

1. **Top Navigation Bar (Cinematic Dark `#101318`)**:
   - Left: Original SGS AI Group logo wordmark with subtitle *"CREATIVE INTELLIGENCE × AI ENGINEERING"*.
   - Center: Five single-line navigation links (`About`, `Industries`, `Expertise`, `Our Work`, `Contact`).
   - Right: Electric-blue pill button *"Let's Talk →"*.
   - Mobile: High-contrast slide-down drawer with accessible focus trapping.

2. **01 — Hero: NIRA AI World (Cinematic Dark `#101318`)**:
   - Numbered index: `01` with electric blue vertical bar.
   - Eyebrow: `HUMAN THINKING. INTELLIGENT EXECUTION.`
   - Headline: `WE BUILD WHAT MOVES BUSINESS FORWARD.` in bold uppercase Manrope (`clamp(2.5rem, 6vw, 5.5rem)`).
   - Subtitle: *"From brand growth to AI-powered business systems, we help companies communicate better, market smarter and operate more intelligently."*
   - Actions: Primary *"Explore Our Work →"* and Secondary *"Watch Showreel ▷"*.
   - Ambient visual: NIRA overlooking the illuminated city skyline with digital orbital links, and signature corner lockup: *"NIRA · PEOPLE. IDEAS. A SMARTER TOMORROW."*

3. **02 — Who We Are (Luminous White `#FFFFFF`)**:
   - Numbered index: `02` with vertical bar.
   - Eyebrow: `WHO WE ARE`.
   - Headline: *"Creative by instinct. Intelligent by design."* (with *"Intelligent by design."* in signature electric blue `#2563EB`).
   - Strategic description articulating SGS AI Group as master company and SGS AI Marketing as the regional creative/marketing division.
   - Baseline rule: `— CREATE. CONNECT. ENGINEER.`
   - Three photo cards with darkened overlays and captions:
     - **CREATE**: Brands, Campaigns, Content.
     - **CONNECT**: Digital Presence, Customer Engagement.
     - **ENGINEER**: AI Systems, Business Efficiency.

4. **03 — Industries We Serve (Luminous White / Soft Architectural Surface `#F8FAFC`)**:
   - Numbered index: `03`.
   - Headline: *"Different industries. A smarter tomorrow."* (with *"A smarter tomorrow."* in `#2563EB`).
   - Right description and slider navigation buttons (`←` and `→`).
   - 5 interactive cards in a fluid horizontal carousel:
     - *01. FMCG & Consumer Brands*
     - *02. Industrial & Essential Services*
     - *03. Retail & Commerce*
     - *04. SMEs & Professional Services*
     - *05. Distribution & Supply Chain*
   - Each card features crisp photography, value proposition, and circular link affordance (`→`).

5. **04 — Our Expertise (Cinematic Dark `#101318`)**:
   - Numbered index: `04` in electric blue.
   - Eyebrow: `OUR EXPERTISE`.
   - Left: Imposing headline *"Good ideas need great execution."*
   - Right: 2-column grid of 6 core capability disciplines with clean icons, numbers, and scope summaries:
     - *01 Brand Strategy & Creative* (Lightbulb)
     - *02 Digital Marketing* (Bar Chart)
     - *03 Content & Media Production* (Camera)
     - *04 AI Applications & Engineering* (Microchip)
     - *05 Business Process Automation* (Gears)
     - *06 Websites & Digital Experiences* (Monitor)

6. **05 — Selected Work (Luminous White `#FFFFFF`)**:
   - Numbered index: `05`.
   - Eyebrow: `SELECTED WORK`.
   - Headline: *"Ideas that create real-world impact."*
   - 4-pill interactive category switcher:
     - `Brand & Campaigns` (Default active)
     - `Packaging & Product Experience`
     - `Corporate & Industrial Solutions`
     - `AI Systems & Business Automation`
   - Case study cards with high-fidelity imagery, sector tag, project title, and *"View Project →"*.
   - **Interactive Modal Overlay (The Showcase Overlay)**:
     - Triggered on *"View Project →"*.
     - Full-screen architectural dialog with backdrop blur (`#101318/95`).
     - Left pane: Large media viewer with play controls, previous/next carousel arrows, and 5 interactive filmstrip thumbnails.
     - Right pane: Breadcrumb (`BRAND & CAMPAIGNS / FMCG`), project index (`01 / 04`), title, executive summary, **The Challenge**, **Our Approach**, **The Execution**, **The Outcome**, skill badges, and in-modal *"Next Project →"* button.

7. **06 — Contact & Verified Channels (Soft Architectural Surface `#F8FAFC`)**:
   - Verified executive direct channels:
     - Business enquiries · TK: `+60 11-3944 0907` (Executive Director)
     - Appointments: `+60 17-270 8575`
     - Email: `sgsaimarketing@gmail.com`
     - Regional coverage: `Malaysia · Singapore`
   - Direct interactive action card (*"Start a conversation"*) with validated contact submission handling.
   - Authoritative footer with original SGS logo, sitemap navigation, privacy assurance, and copyright.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client AI Video Integration**:
  - *Chosen Approach*: Lightweight video teaser modal for the Hero showreel and embedded HTML5 video preview in the Selected Work case study modal.
  - *Why*: Direct multi-megabyte looping video files in the hero degrade Core Web Vitals (LCP/FID) and increase mobile bandwidth consumption. By pairing optimized video poster frames with instantaneous zero-latency modal video players, we achieve a high-end agency look with high performance.
- **Decision 2: In-Place Modal Navigation vs. Multi-Page Routing**:
  - *Chosen Approach*: Fully accessible overlay modal with keyboard controls (`Esc` to close, `ArrowLeft`/`ArrowRight` to navigate), URL hash synchronization (`#work?project=luxury-fragrance`), and internal Next/Previous state.
  - *Why*: Satisfies the strict single-page constraint without requiring sub-routes or reloads, maintaining Cloudflare Pages static compatibility.
- **Decision 3: Image Assets & Visual Fidelity**:
  - *Chosen Approach*: Utilize the verified high-resolution assets already established in `/public/assets/` supplemented by bespoke high-contrast studio assets for the Selected Work showcase (Luxury Fragrance, Beauty Range, City OOH, Studio Production).
  - *Why*: Ensures zero broken images, crisp rendering on 4K displays, and exact alignment with the master mockup.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Root Layout)                          │
├────────────────────────────────────────────────────────────────────────┤
│  ▲ Header.tsx (Sticky Executive Navigation & "Let's Talk →")           │
│                                                                        │
│  ▼ Main Content:                                                       │
│    ├── 01 Hero.tsx                                                     │
│    │     └── [Watch Showreel ▷] ──► ShowreelModal.tsx                  │
│    ├── 02 WhoWeAre.tsx                                                 │
│    │     └── 3 Disciplines (Create, Connect, Engineer photo cards)     │
│    ├── 03 Industries.tsx                                               │
│    │     └── Horizontal Slider (FMCG, Industrial, Retail, SME, Dist)   │
│    ├── 04 Expertise.tsx                                                │
│    │     └── 6 Core Capabilities Grid with Icons & Scope               │
│    ├── 05 SelectedWork.tsx                                             │
│    │     ├── 4 Interactive Category Filters                            │
│    │     ├── Project Card Carousel                                     │
│    │     └── [View Project →] ──► ProjectModal.tsx (Deep Case Study)   │
│    └── 06 Contact.tsx                                                  │
│          ├── Verified Executive Directory (TK, Appointments, Email)    │
│          └── Validated Direct Action / Enquiry Form                    │
│                                                                        │
│  ▲ Footer.tsx (SGS Master Branding, Sitemap & Legal)                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

- `src/data/portfolioData.ts`: Central typed repository containing:
  - 4 categories: `brand-campaigns`, `packaging-experience`, `corporate-solutions`, `ai-systems`.
  - Comprehensive project models (Title, Subtitle, Category, Sector, Challenge, Approach, Execution, Outcome, Tags, Main Media, Filmstrip Thumbnails).
  - Showreel video configurations.
- `ProjectModal.tsx`:
  - Active project state, category index tracking (`01 / 04`).
  - Active thumbnail selection and video play/pause toggle.
  - `Next Project` / `Previous Project` circular navigation.
- `Industries.tsx`:
  - State-driven slider index with wrap-around boundaries.
  - Accessible button controls (`aria-label="Previous industry"`, `aria-label="Next industry"`).
- `Contact.tsx`:
  - Instant direct communication links (`tel:`, `mailto:`).
  - Controlled input fields with inline validation and submission confirmation.
