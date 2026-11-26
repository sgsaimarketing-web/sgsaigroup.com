/**
 * SGS AI Group - Site Content & Brand Configuration
 * Visual Master: /public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png
 * Master Company: SGS AI Group (Creative Intelligence × AI Engineering)
 * Division: SGS AI Marketing (Creative and digital marketing company serving Malaysia and Singapore)
 * Brand Philosophy: Human Thinking. Intelligent Execution.
 * Generated via SGS AI Group Visual Content & Design Editor
 */

export type DeviceBreakpoint = 'laptop' | 'tablet' | 'mobile';
export type MediaAspectRatio = 'auto' | '16:9' | '16:10' | '4:3' | '3:2' | '4:5' | '3:4' | '9:16' | '1:1';
export type MediaFitMode = 'cover' | 'contain';
export type MediaFocalPoint = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type DeviceHeightScale = 'compact' | 'standard' | 'tall';

export interface DeviceMediaOverride {
  aspectRatio?: MediaAspectRatio;
  fit?: MediaFitMode;
  focalPoint?: MediaFocalPoint;
  heightScale?: DeviceHeightScale;
}

export interface ResponsiveMediaOverrides {
  laptop?: DeviceMediaOverride;
  tablet?: DeviceMediaOverride;
  mobile?: DeviceMediaOverride;
}

export interface SectionLayoutOverride {
  paddingY?: 'compact' | 'standard' | 'spacious';
  mobileLayout?: 'carousel' | 'stack' | 'grid-2';
  columnsTablet?: 2 | 3;
  columnsLaptop?: 2 | 3 | 4;
}

export interface ResponsiveSectionOverrides {
  laptop?: SectionLayoutOverride;
  tablet?: SectionLayoutOverride;
  mobile?: SectionLayoutOverride;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface IndustryItem {
  id: string;
  num: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  cropAspect?: '16:9' | '4:3' | '1:1' | 'auto';
  focalPoint?: MediaFocalPoint;
  responsiveMedia?: ResponsiveMediaOverrides;
}

export interface CapabilityItem {
  num: string;
  title: string;
  description: string;
  iconName: 'lightbulb' | 'chart' | 'video' | 'cpu' | 'settings' | 'monitor' | 'layers' | 'shield' | 'sparkles' | 'globe';
}

export interface WhoWeAreCard {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  focalPoint?: MediaFocalPoint;
  responsiveMedia?: ResponsiveMediaOverrides;
}

export interface GalleryMediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  caption?: string;
  aspectRatio?: MediaAspectRatio;
  fit?: MediaFitMode;
  focalPoint?: MediaFocalPoint;
  poster?: string;
  responsiveMedia?: ResponsiveMediaOverrides;
}

export interface CaseStudy {
  id: string;
  categoryId: string;
  categoryLabel: string;
  sector: string;
  index: string;
  total: string;
  title: string;
  subtitle: string;
  coverImage: string;
  posterUrl?: string;
  coverFit?: MediaFitMode;
  coverFocalPoint?: MediaFocalPoint;
  responsiveMedia?: ResponsiveMediaOverrides;
  thumbnails: string[];
  gallery?: GalleryMediaItem[];
  challenge: string;
  approach: string;
  execution: string;
  outcome: string;
  tags: string[];
  hasVideo?: boolean;
  videoUrl?: string;
}

export interface WorkCategory {
  id: string;
  label: string;
}

export interface ContactDetail {
  label: string;
  value: string;
  subtext?: string;
  href?: string;
  type?: 'tel' | 'mailto' | 'text';
}

export interface SiteConfig {
  brandName: string;
  marketingBrandName: string;
  philosophy: string;
  positioning: string;
  logoWhite: string;
  logoDark: string;
  heroImage: string;
  earthImage: string;
  email: string;
  phoneTK: string;
  phoneAppointments: string;
  regions: string;
  copyright: string;
  selectedWorkLayout?: ResponsiveSectionOverrides;
}

export interface HeroContent {
  eyebrow: string;
  headlineLines: string[];
  supportParagraph: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  niraBadge: {
    title: string;
    subtitle: string;
  };
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundFit?: MediaFitMode;
  backgroundFocalPoint?: MediaFocalPoint;
  animationSpeed?: 'subtle' | 'standard' | 'dynamic';
  responsiveMedia?: ResponsiveMediaOverrides;
  responsiveLayout?: ResponsiveSectionOverrides;
}

export interface WhoWeAreContent {
  num: string;
  eyebrow: string;
  headlineMain: string;
  headlineAccent: string;
  description: string;
  baseline: string;
  cards: WhoWeAreCard[];
  responsiveLayout?: ResponsiveSectionOverrides;
}

export interface IndustriesContent {
  num: string;
  eyebrow: string;
  headlineMain: string;
  headlineAccent: string;
  description: string;
  items: IndustryItem[];
  responsiveLayout?: ResponsiveSectionOverrides;
}

export interface ExpertiseContent {
  num: string;
  eyebrow: string;
  headlineLines: string[];
  capabilities: CapabilityItem[];
  responsiveLayout?: ResponsiveSectionOverrides;
}

export interface ContactContent {
  num: string;
  eyebrow: string;
  headline: string;
  intro: string;
  details: ContactDetail[];
  cardTitle: string;
  cardIntro: string;
  footerTagline: string;
  footerPrivacy: string;
  recipientEmail?: string;
  successMessage?: string;
  responsiveLayout?: ResponsiveSectionOverrides;
}

export const SITE_CONFIG: SiteConfig = {
  "brandName": "SGS AI Group",
  "marketingBrandName": "SGS AI Marketing",
  "philosophy": "Human Thinking. Intelligent Execution.",
  "positioning": "Creative Intelligence × AI Engineering",
  "logoWhite": "/assets/sgs-logo-white.png",
  "logoDark": "/assets/sgs-logo.png",
  "heroImage": "/assets/nira-official.webp",
  "earthImage": "/assets/nira-connected-earth.webp",
  "email": "sgsaimarketing@gmail.com",
  "phoneTK": "+60 11-3944 0907",
  "phoneAppointments": "+60 17-270 8575",
  "regions": "Malaysia · Singapore",
  "copyright": "© 2026 SGS AI Group. All rights reserved."
};

export const NAV_LINKS: NavItem[] = [
  {
    "label": "About",
    "href": "#about"
  },
  {
    "label": "Industries",
    "href": "#industries"
  },
  {
    "label": "Expertise",
    "href": "#expertise"
  },
  {
    "label": "Our Work",
    "href": "#our-work"
  },
  {
    "label": "Contact",
    "href": "#contact"
  }
];

export const HERO_CONTENT: HeroContent = {
  "eyebrow": "HUMAN THINKING. INTELLIGENT EXECUTION.",
  "headlineLines": [
    "WE BUILD WHAT",
    "MOVES BUSINESS",
    "FORWARD."
  ],
  "supportParagraph": "We pair revenue-driven brand campaigns with custom AI workflows—helping Malaysia and Singapore leaders win market share faster and cut operational drag in weeks, not quarters.",
  "primaryCta": {
    "label": "Explore Our Work",
    "href": "#our-work"
  },
  "secondaryCta": {
    "label": "Watch Showreel",
    "href": "#showreel"
  },
  "niraBadge": {
    "title": "NIRA",
    "subtitle": "PEOPLE. IDEAS. A SMARTER TOMORROW."
  },
  "backgroundVideo": "/assets/nira-loop.mp4",
  "backgroundImage": "/assets/nira-official.webp",
  "backgroundFit": "cover",
  "backgroundFocalPoint": "center",
  "responsiveMedia": {
    "laptop": {
      "aspectRatio": "16:9",
      "fit": "cover",
      "focalPoint": "center",
      "heightScale": "standard"
    },
    "tablet": {
      "aspectRatio": "16:9",
      "fit": "cover",
      "focalPoint": "center",
      "heightScale": "standard"
    },
    "mobile": {
      "aspectRatio": "16:9",
      "fit": "cover",
      "focalPoint": "center",
      "heightScale": "standard"
    }
  }
};

export const WHO_WE_ARE_CONTENT: WhoWeAreContent = {
  "num": "02",
  "eyebrow": "WHO WE ARE",
  "headlineMain": "Creative by instinct.",
  "headlineAccent": "Intelligent by design.",
  "description": "SGS AI Group is a Malaysia-based creative intelligence and AI engineering partner, with SGS AI Marketing driving commercial growth across Malaysia and Singapore. One team connecting market demand directly to automated execution.",
  "baseline": "— CREATE. CONNECT. ENGINEER.",
  "cards": [
    {
      "title": "CREATE",
      "subtitle": "Category-defining brand systems and cinema-grade campaigns built to command shelf space and buyer preference.",
      "image": "/assets/who-we-are/create.jpg",
      "imageAlt": "Creative director evaluating glowing futuristic holographic interfaces"
    },
    {
      "title": "CONNECT",
      "subtitle": "Omnichannel digital platforms and performance storytelling that convert attention into qualified pipeline.",
      "image": "/assets/who-we-are/connect.jpg",
      "imageAlt": "Business leaders silhouetted against a golden hour city skyline"
    },
    {
      "title": "ENGINEER",
      "subtitle": "Bespoke AI tools and workflow automation that reclaim team hours and accelerate executive decisions.",
      "image": "/assets/who-we-are/engineer.jpg",
      "imageAlt": "Hands interacting with node graph holographic architecture"
    }
  ]
};

export const INDUSTRIES_CONTENT: IndustriesContent = {
  "num": "03",
  "eyebrow": "INDUSTRIES WE SERVE",
  "headlineMain": "Different industries.",
  "headlineAccent": "A smarter tomorrow.",
  "description": "Different markets face different bottlenecks. We combine sharp creative positioning with practical AI systems engineered for measurable ROI across your value chain.",
  "items": [
    {
      "id": "fmcg",
      "num": "01",
      "title": "FMCG & Consumer Brands",
      "description": "Win crowded retail shelves with distinctive packaging, festive storytelling, and regional demand campaigns.",
      "image": "/assets/industry-fmcg.jpg",
      "imageAlt": "Consumer packaged goods and olive oil bottles on artisanal store shelf"
    },
    {
      "id": "industrial",
      "num": "02",
      "title": "Industrial & Essential Services",
      "description": "Turn complex technical and ESG capabilities into clear stakeholder hubs and streamlined field workflows.",
      "image": "/assets/industry-industrial.jpg",
      "imageAlt": "Modern industrial processing plant illuminated at dusk"
    },
    {
      "id": "retail",
      "num": "03",
      "title": "Retail & Commerce",
      "description": "Increase store dwell time and repeat basket value by linking experiential merchandising with targeted digital conversion.",
      "image": "/assets/industry-retail.jpg",
      "imageAlt": "Luxury retail boutique with modern architectural interior lighting"
    },
    {
      "id": "sme",
      "num": "04",
      "title": "SMEs & Professional Services",
      "description": "Command enterprise credibility with sharp digital presence and automated lead handling—without adding headcount.",
      "image": "/assets/industry-sme.jpg",
      "imageAlt": "Executive partners collaborating on strategy with laptop"
    },
    {
      "id": "distribution",
      "num": "05",
      "title": "Distribution & Supply Chain",
      "description": "Sync trade dealers, warehouse dispatches, and regional sales teams through unified B2B portals and automated alerts.",
      "image": "/assets/industry-logistics.jpg",
      "imageAlt": "Commercial freight transport truck parked at distribution terminal"
    }
  ]
};

export const EXPERTISE_CONTENT: ExpertiseContent = {
  "num": "04",
  "eyebrow": "OUR EXPERTISE",
  "headlineLines": [
    "Good ideas",
    "need great",
    "execution."
  ],
  "capabilities": [
    {
      "num": "01",
      "title": "Brand Strategy & Creative",
      "description": "Positioning, visual identity, and launch campaigns engineered to command price premiums and buyer recall.",
      "iconName": "lightbulb"
    },
    {
      "num": "02",
      "title": "Digital Marketing",
      "description": "Targeted social, paid acquisition, and conversion funnels measured by pipeline velocity—not vanity impressions.",
      "iconName": "chart"
    },
    {
      "num": "03",
      "title": "Content & Media Production",
      "description": "Vertical 9:16 commercial reels, product photography, and acoustic sound design built for modern feeds.",
      "iconName": "video"
    },
    {
      "num": "04",
      "title": "AI Applications & Engineering",
      "description": "Custom internal copilots, executive data cockpits, and generative content engines tailored to your stack.",
      "iconName": "cpu"
    },
    {
      "num": "05",
      "title": "Business Process Automation",
      "description": "Automated reporting, dispatch routing, and workflow elimination delivering measurable ROI in weeks.",
      "iconName": "settings"
    },
    {
      "num": "06",
      "title": "Websites & Digital Experiences",
      "description": "Fast, mobile-first corporate hubs and product showcases designed to turn high-intent visitors into direct enquiries.",
      "iconName": "monitor"
    }
  ]
};

export const WORK_CATEGORIES: WorkCategory[] = [
  {
    "id": "brand-campaigns",
    "label": "Brand & Campaigns"
  },
  {
    "id": "packaging-experience",
    "label": "Packaging & Product Experience"
  },
  {
    "id": "corporate-solutions",
    "label": "Corporate & Industrial Solutions"
  },
  {
    "id": "ai-systems",
    "label": "AI Systems & Business Automation"
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    "id": "nelson-trading-launch",
    "categoryId": "brand-campaigns",
    "categoryLabel": "Brand & Campaigns",
    "sector": "FMCG",
    "index": "01",
    "total": "04",
    "title": "Nelson Trading Launch",
    "subtitle": "A strategic campaign, cinema-grade content production, and digital rollout to build a stronger brand presence and drive regional sales impact.",
    "coverImage": "/assets/work/nelson-diamond.png",
    "posterUrl": "/assets/work/nelson-diamond.png",
    "videoUrl": "/assets/nira-loop.mp4",
    "thumbnails": [
      "/assets/work/nelson-diamond.png",
      "/assets/work/nelson-trading.png",
      "/assets/work/city-ooh.jpg",
      "/assets/industry-retail.jpg"
    ],
    "gallery": [
      {
        "id": "nelson-video-0",
        "url": "/assets/nira-loop.mp4",
        "type": "video",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Nelson Trading Launch 9:16 Video Reel",
        "poster": "/assets/work/nelson-diamond.png"
      },
      {
        "id": "nelson-img-1",
        "url": "/assets/work/nelson-diamond.png",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Gemological Precision & Diamond Inspection",
        "poster": "/assets/work/nelson-diamond.png"
      },
      {
        "id": "nelson-img-2",
        "url": "/assets/work/nelson-trading.png",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Brand Identity & Celestial Horizon",
        "poster": "/assets/work/nelson-trading.png"
      }
    ],
    "challenge": "Establish immediate market presence, distributor trust, and brand differentiation in a highly competitive commodities landscape.",
    "approach": "Engineered a high-impact visual identity, digital-first campaign assets, and cinema-grade vertical video to drive regional awareness.",
    "execution": "Master brand identity, 9:16 vertical video reel, digital and retail rollout assets, and executive storytelling.",
    "outcome": "Successful regional market rollout, enhanced consumer recall, and robust retail distribution traction.",
    "tags": [
      "Brand Strategy",
      "FMCG Rollout",
      "9:16 Video Reel",
      "Digital Campaign",
      "OOH Display"
    ],
    "hasVideo": true
  },
  {
    "id": "biho-festive-campaign",
    "categoryId": "brand-campaigns",
    "categoryLabel": "Brand & Campaigns",
    "sector": "FMCG · Food & Confectionery",
    "index": "02",
    "total": "04",
    "title": "Biho Food Festive Campaign",
    "subtitle": "Multicultural festive campaign uniting celebratory gift-giving rituals, packaging merchandising, and heartfelt community connection across Malaysia.",
    "coverImage": "/assets/work/biho-festive-poster.webp",
    "posterUrl": "/assets/work/biho-festive-poster.webp",
    "thumbnails": [
      "/assets/work/biho-festive-poster.webp",
      "/assets/work/biho-gift-bag.webp",
      "/assets/work/biho-festive-door.png"
    ],
    "gallery": [
      {
        "id": "biho-img-0",
        "url": "/assets/work/biho-festive-poster.webp",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Biho Festive Open House & Neighbourly Gifting",
        "poster": "/assets/work/biho-festive-poster.webp"
      },
      {
        "id": "biho-img-1",
        "url": "/assets/work/biho-gift-bag.webp",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Signature Biho Gift Hamper Presentation",
        "poster": "/assets/work/biho-gift-bag.webp"
      },
      {
        "id": "biho-img-2",
        "url": "/assets/work/biho-festive-door.png",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Traditional Welcome & Cultural Unity",
        "poster": "/assets/work/biho-festive-door.png"
      }
    ],
    "challenge": "Differentiating Biho festive confectionery in a competitive holiday retail season while forging deep cross-cultural emotional affinity.",
    "approach": "Crafted an authentic Malaysian festive open-house narrative celebrating shared cultural harmony, family traditions, and warm hospitality.",
    "execution": "Commercial visual direction, branded gift packaging, festive POS displays, and digital campaign creative across social channels.",
    "outcome": "Record holiday season retail sell-through and widespread social sharing across diverse Malaysian communities.",
    "tags": [
      "Festive Campaign",
      "FMCG Food",
      "Packaging Design",
      "Community Storytelling"
    ],
    "hasVideo": false
  },
  {
    "id": "alzara-curry-powder",
    "categoryId": "brand-campaigns",
    "categoryLabel": "Brand & Campaigns",
    "sector": "FMCG · Spices & Culinary",
    "index": "03",
    "total": "04",
    "title": "Alzara Selera Terangkat",
    "subtitle": "Dynamic commercial campaign featuring master chef culinary demonstration, aromatic spice sensory visuals, and omnichannel retail launch.",
    "coverImage": "/assets/work/alzara-curry-poster.webp",
    "posterUrl": "/assets/work/alzara-curry-poster.webp",
    "videoUrl": "/assets/work/alzara-curry-reel.mp4",
    "thumbnails": [
      "/assets/work/alzara-curry-poster.webp",
      "/assets/work/alzara-curry-chef.webp",
      "/assets/industry-fmcg.jpg",
      "/assets/work/city-ooh.jpg"
    ],
    "gallery": [
      {
        "id": "alzara-vid-0",
        "url": "/assets/work/alzara-curry-reel.mp4",
        "type": "video",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Alzara Selera Terangkat 9:16 Culinary Reel",
        "poster": "/assets/work/alzara-curry-poster.webp"
      },
      {
        "id": "alzara-img-1",
        "url": "/assets/work/alzara-curry-poster.webp",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Master Chef with Serbuk Kari Daging & Simmering Dish",
        "poster": "/assets/work/alzara-curry-poster.webp"
      },
      {
        "id": "alzara-img-2",
        "url": "/assets/work/alzara-curry-chef.webp",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Culinary Master Endorsement & Fresh Spices",
        "poster": "/assets/work/alzara-curry-chef.webp"
      }
    ],
    "challenge": "Establishing immediate credibility and consumer appetite against well-entrenched legacy curry powder brands in Malaysia.",
    "approach": "Leveraged high-energy kitchen cinematography with live sizzling wok action, highlighting authentic aromatic flavor (\"Selera Terangkat\").",
    "execution": "Full 9:16 vertical commercial video production, color grading, sound design with authentic wok acoustic sizzle, and digital retail assets.",
    "outcome": "Rapid supermarket distribution uptake and a 38% surge in consumer trial across West Malaysia retail chains.",
    "tags": [
      "Culinary Campaign",
      "9:16 Video Reel",
      "FMCG Spices",
      "Chef Commercial"
    ],
    "hasVideo": true
  },
  {
    "id": "mykaapie-filter-coffee",
    "categoryId": "brand-campaigns",
    "categoryLabel": "Brand & Campaigns",
    "sector": "FMCG · Specialty Beverages",
    "index": "04",
    "total": "04",
    "title": "My Kaapie Filter Coffee",
    "subtitle": "Sensorial beverage brand launch celebrating authentic South Indian filter coffee brewing, traditional brass dabara rituals, and modern packaging.",
    "coverImage": "/assets/work/mykaapie-coffee-poster.webp",
    "posterUrl": "/assets/work/mykaapie-coffee-poster.webp",
    "videoUrl": "/assets/work/mykaapie-coffee-reel.mp4",
    "thumbnails": [
      "/assets/work/mykaapie-coffee-poster.webp",
      "/assets/work/mykaapie-pour.webp",
      "/assets/work/mykaapie-cup.png",
      "/assets/industry-retail.jpg"
    ],
    "gallery": [
      {
        "id": "mykaapie-vid-0",
        "url": "/assets/work/mykaapie-coffee-reel.mp4",
        "type": "video",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "My Kaapie Slow-Pour Sensory 9:16 Reel",
        "poster": "/assets/work/mykaapie-coffee-poster.webp"
      },
      {
        "id": "mykaapie-img-1",
        "url": "/assets/work/mykaapie-coffee-poster.webp",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Steaming Brass Tumbler & Roasted Coffee Beans",
        "poster": "/assets/work/mykaapie-coffee-poster.webp"
      },
      {
        "id": "mykaapie-img-2",
        "url": "/assets/work/mykaapie-pour.webp",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Rich Frothy Micro-Crema Stream",
        "poster": "/assets/work/mykaapie-pour.webp"
      },
      {
        "id": "mykaapie-img-3",
        "url": "/assets/work/mykaapie-cup.png",
        "type": "image",
        "aspectRatio": "9:16",
        "fit": "cover",
        "focalPoint": "center",
        "caption": "Introducing My Kaapie Authentic South Indian Coffee",
        "poster": "/assets/work/mykaapie-cup.png"
      }
    ],
    "challenge": "Introducing traditional South Indian filter coffee to contemporary specialty coffee drinkers while preserving generational ritual authenticity.",
    "approach": "Combined macro cinematography and slow-motion liquid dynamics with warm acoustic sound design capturing the soothing coffee brewing ritual.",
    "execution": "Cinema-grade 9:16 vertical video reel, typography animation, acoustic foley sound mixing, and high-contrast digital marketing kits.",
    "outcome": "Phenomenal social engagement across coffee enthusiasts and rapid onboarding into artisanal cafes and retail grocery stores.",
    "tags": [
      "Beverage Launch",
      "9:16 Video Reel",
      "Artisanal Coffee",
      "Sensory Cinematography"
    ],
    "hasVideo": true
  },
  {
    "id": "artisanal-fmcg-packaging",
    "categoryId": "packaging-experience",
    "categoryLabel": "Packaging & Product Experience",
    "sector": "FMCG & Retail",
    "index": "01",
    "total": "02",
    "title": "Artisanal Reserve Packaging Architecture",
    "subtitle": "Structural box engineering, custom embossed labeling, and tactile sustainable materials for luxury consumer goods.",
    "coverImage": "/assets/industry-fmcg.jpg",
    "thumbnails": [
      "/assets/industry-fmcg.jpg",
      "/assets/work/luxury-fragrance.jpg",
      "/assets/work/beauty-range.jpg",
      "/assets/industry-retail.jpg",
      "/assets/work/city-ooh.jpg"
    ],
    "challenge": "Re-engineering legacy product packaging into a sustainable premium format that justifies luxury price positioning.",
    "approach": "Designed unboxing touchpoints utilizing post-consumer recycled paperboard, gold foil stampings, and airtight cork seals.",
    "execution": "Structural packaging prototypes, dieline engineering, print vendor press checks, and barcode compliance testing.",
    "outcome": "Achieved prestigious international packaging design accolades and lowered logistics breakage by 18%.",
    "tags": [
      "Packaging Design",
      "Structural Engineering",
      "Print Production",
      "FMCG"
    ],
    "hasVideo": false
  },
  {
    "id": "luxury-retail-merchandising",
    "categoryId": "packaging-experience",
    "categoryLabel": "Packaging & Product Experience",
    "sector": "Retail & Commerce",
    "index": "02",
    "total": "02",
    "title": "Flagship Merchandising & POS Displays",
    "subtitle": "Modular experiential floor displays and lighted acrylic vitrines engineered for prime department store environments.",
    "coverImage": "/assets/industry-retail.jpg",
    "thumbnails": [
      "/assets/industry-retail.jpg",
      "/assets/work/beauty-range.jpg",
      "/assets/work/luxury-fragrance.jpg",
      "/assets/who-we-are/create.jpg",
      "/assets/work/city-ooh.jpg"
    ],
    "challenge": "Creating high-touch interactive display fixtures that entice tactile customer sampling without staff intervention.",
    "approach": "Engineered illuminated magnetic product pedestals with embedded NFC chips that trigger interactive tablet specs.",
    "execution": "CAD fabrication drawings, prototype material stress tests, nationwide rollout logistics, and installation guides.",
    "outcome": "Demonstrated 35% higher in-store dwell times and elevated direct boutique purchase conversions.",
    "tags": [
      "Retail Displays",
      "POS Merchandising",
      "Spatial Design",
      "Customer Experience"
    ],
    "hasVideo": false
  },
  {
    "id": "infrastructure-digital-portal",
    "categoryId": "corporate-solutions",
    "categoryLabel": "Corporate & Industrial Solutions",
    "sector": "Industrial & Essential Services",
    "index": "01",
    "total": "02",
    "title": "Essential Services Digital Hub & Stakeholder Platform",
    "subtitle": "Unified enterprise portal communicating environmental governance, real-time facility telemetry, and investor reporting.",
    "coverImage": "/assets/industry-industrial.jpg",
    "thumbnails": [
      "/assets/industry-industrial.jpg",
      "/assets/who-we-are/engineer.jpg",
      "/assets/industry-logistics.jpg",
      "/assets/who-we-are/connect.jpg",
      "/assets/nira-connected-earth.webp"
    ],
    "challenge": "Modernizing public utility communication to satisfy strict ESG reporting requirements and consumer transparency expectations.",
    "approach": "Engineered an intuitive corporate storytelling experience backed by live operational metrics and interactive compliance audits.",
    "execution": "Enterprise React architecture, WCAG AA accessibility audits, secure stakeholder document vaults, and press distribution tools.",
    "outcome": "Pioneered transparent utility communications across Malaysia and eliminated 80% of routine investor inquiry calls.",
    "tags": [
      "Corporate Platforms",
      "ESG Reporting",
      "Enterprise Web",
      "Industrial Tech"
    ],
    "hasVideo": false
  },
  {
    "id": "supply-chain-network-suite",
    "categoryId": "corporate-solutions",
    "categoryLabel": "Corporate & Industrial Solutions",
    "sector": "Distribution & Supply Chain",
    "index": "02",
    "total": "02",
    "title": "Fleet & Distributor Communications Network",
    "subtitle": "Integrated trade communications and digital dispatch tools connecting warehouse logistics hubs with regional retail partners.",
    "coverImage": "/assets/industry-logistics.jpg",
    "thumbnails": [
      "/assets/industry-logistics.jpg",
      "/assets/industry-industrial.jpg",
      "/assets/who-we-are/engineer.jpg",
      "/assets/who-we-are/connect.jpg",
      "/assets/industry-sme.jpg"
    ],
    "challenge": "Bridging fragmented communication gaps between warehouse logistics operators and hundreds of independent trade retail dealers.",
    "approach": "Built a low-latency web application streamlining order acknowledgments, delivery window tracking, and real-time inventory updates.",
    "execution": "Mobile-optimized driver web consoles, automated SMS/WhatsApp dispatch triggers, and executive logistics dashboards.",
    "outcome": "Reduced turnaround dispatch discrepancies by 29% and consolidated regional dealer inquiries into a single channel.",
    "tags": [
      "Supply Chain",
      "Logistics UX",
      "Operational Systems",
      "B2B Communication"
    ],
    "hasVideo": false
  },
  {
    "id": "enterprise-workflow-automation",
    "categoryId": "ai-systems",
    "categoryLabel": "AI Systems & Business Automation",
    "sector": "Enterprise AI",
    "index": "01",
    "total": "02",
    "title": "Automated Multi-Channel Content & Reporting Engine",
    "subtitle": "Custom machine intelligence pipeline turning raw business data into branded executive presentations and campaign assets.",
    "coverImage": "/assets/who-we-are/engineer.jpg",
    "thumbnails": [
      "/assets/who-we-are/engineer.jpg",
      "/assets/nira-connected-earth.webp",
      "/assets/industry-sme.jpg",
      "/assets/work/cinema-camera.jpg",
      "/assets/who-we-are/create.jpg"
    ],
    "challenge": "Marketing teams spent over 30 hours per week manually consolidating regional sales reports and generating repetitive social assets.",
    "approach": "Architected a proprietary node-based generative pipeline automating report summarization and localized graphic generation.",
    "execution": "Internal REST API connectors, automated template styling engines, LLM-based commercial copy generation, and PDF export workers.",
    "outcome": "Reclaimed 85% of creative team production hours while maintaining 100% brand guideline typography compliance.",
    "tags": [
      "AI Automation",
      "Workflow Orchestration",
      "Generative Tooling",
      "Internal Systems"
    ],
    "hasVideo": true,
    "videoUrl": "/assets/nira-loop.mp4",
    "posterUrl": "/assets/who-we-are/engineer.jpg"
  },
  {
    "id": "connected-intelligence-dashboard",
    "categoryId": "ai-systems",
    "categoryLabel": "AI Systems & Business Automation",
    "sector": "Regional Intelligence",
    "index": "02",
    "total": "02",
    "title": "Southeast Asia Cross-Border Intelligence Matrix",
    "subtitle": "Real-time data visualization connecting market signals, competitor sentiment, and campaign performance across ASEAN hubs.",
    "coverImage": "/assets/nira-connected-earth.webp",
    "thumbnails": [
      "/assets/nira-connected-earth.webp",
      "/assets/who-we-are/engineer.jpg",
      "/assets/who-we-are/connect.jpg",
      "/assets/nira-official.webp",
      "/assets/industry-industrial.jpg"
    ],
    "challenge": "Executive leadership required a unified cockpit to monitor regional digital campaign performance across currency boundaries.",
    "approach": "Developed an animated geographic mapping interface with automated anomaly alerts and multi-tier role permissions.",
    "execution": "WebGL particle trajectory maps, real-time Firestore synchronization, high-frequency currency conversions, and automated audit trails.",
    "outcome": "Accelerated strategic budget allocation decisions from weeks to minutes across Malaysia, Singapore, and regional partners.",
    "tags": [
      "Data Visualization",
      "Executive Cockpit",
      "Enterprise AI",
      "ASEAN Tech"
    ],
    "hasVideo": true,
    "videoUrl": "/assets/nira-loop.mp4",
    "posterUrl": "/assets/nira-connected-earth.webp"
  }
];

export const CONTACT_CONTENT: ContactContent = {
  "num": "06",
  "eyebrow": "CONTACT",
  "headline": "Let's build what's next.",
  "intro": "Ready to accelerate brand demand or eliminate manual workflow bottlenecks? Share your objective—our leadership team responds within one business day.",
  "details": [
    {
      "label": "Business enquiries · TK",
      "value": "+60 11-3944 0907",
      "subtext": "AI Business Solutions Consultant · Executive Director",
      "href": "tel:+601139440907",
      "type": "tel"
    },
    {
      "label": "Appointments",
      "value": "+60 17-270 8575",
      "href": "tel:+60172708575",
      "type": "tel"
    },
    {
      "label": "Email",
      "value": "sgsaimarketing@gmail.com",
      "href": "mailto:sgsaimarketing@gmail.com",
      "type": "mailto"
    },
    {
      "label": "Regional coverage",
      "value": "Malaysia · Singapore",
      "type": "text"
    }
  ],
  "cardTitle": "Start a conversation",
  "cardIntro": "Skip slow agency retainers. Send your brief below or reach TK directly on WhatsApp or email to align on scope, ROI, and launch timeline.",
  "successMessage": "Your structured project brief is ready. Choose WhatsApp or Email below to send it directly to our leadership team—typical response within 2–4 business hours.",
  "footerTagline": "Creative intelligence, commercial production, and custom AI engineering—built to move Malaysia and Singapore businesses forward.",
  "footerPrivacy": "Details you share by email or phone are used only to respond to your enquiry."
};
