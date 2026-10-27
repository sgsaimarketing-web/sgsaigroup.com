/**
 * SGS AI Group - Site Content & Brand Configuration
 * Visual Master: /public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png
 * Master Company: SGS AI Group (Creative Intelligence × AI Engineering)
 * Division: SGS AI Marketing (Creative and digital marketing company serving Malaysia and Singapore)
 * Brand Philosophy: Human Thinking. Intelligent Execution.
 */

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
  focalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
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
  focalPoint?: 'center' | 'top' | 'bottom';
}

export interface GalleryMediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  caption?: string;
  aspectRatio?: '16:9' | '9:16' | '4:5' | '1:1' | '3:2' | 'auto';
  fit?: 'cover' | 'contain';
  focalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  poster?: string;
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
  coverFit?: 'cover' | 'contain';
  coverFocalPoint?: 'center' | 'top' | 'bottom' | 'left' | 'right';
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
  backgroundFit?: 'cover' | 'contain';
  backgroundFocalPoint?: 'center' | 'top' | 'bottom' | 'right' | 'left';
  animationSpeed?: 'subtle' | 'standard' | 'dynamic';
}

export interface WhoWeAreContent {
  num: string;
  eyebrow: string;
  headlineMain: string;
  headlineAccent: string;
  description: string;
  baseline: string;
  cards: WhoWeAreCard[];
}

export interface IndustriesContent {
  num: string;
  eyebrow: string;
  headlineMain: string;
  headlineAccent: string;
  description: string;
  items: IndustryItem[];
}

export interface ExpertiseContent {
  num: string;
  eyebrow: string;
  headlineLines: string[];
  capabilities: CapabilityItem[];
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
}

export const SITE_CONFIG: SiteConfig = {
  brandName: 'SGS AI Group',
  marketingBrandName: 'SGS AI Marketing',
  philosophy: 'Human Thinking. Intelligent Execution.',
  positioning: 'Creative Intelligence × AI Engineering',
  logoWhite: '/assets/sgs-logo-white.png',
  logoDark: '/assets/sgs-logo.png',
  heroImage: '/assets/nira-official.png',
  earthImage: '/assets/nira-connected-earth.png',
  email: 'sgsaimarketing@gmail.com',
  phoneTK: '+60 11-3944 0907',
  phoneAppointments: '+60 17-270 8575',
  regions: 'Malaysia · Singapore',
  copyright: '© 2026 SGS AI Group. All rights reserved.',
};

export const NAV_LINKS: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Industries', href: '#industries' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Our Work', href: '#our-work' },
  { label: 'Contact', href: '#contact' },
];

export const HERO_CONTENT = {
  eyebrow: 'HUMAN THINKING. INTELLIGENT EXECUTION.',
  headlineLines: ['WE BUILD WHAT', 'MOVES BUSINESS', 'FORWARD.'],
  supportParagraph:
    'From brand growth to AI-powered business systems, we help companies communicate better, market smarter and operate more intelligently.',
  primaryCta: { label: 'Explore Our Work', href: '#our-work' },
  secondaryCta: { label: 'Watch Showreel', href: '#showreel' },
  niraBadge: {
    title: 'NIRA',
    subtitle: 'PEOPLE. IDEAS. A SMARTER TOMORROW.',
  },
};

export const WHO_WE_ARE_CONTENT = {
  num: '02',
  eyebrow: 'WHO WE ARE',
  headlineMain: 'Creative by instinct.',
  headlineAccent: 'Intelligent by design.',
  description:
    'SGS AI Group is a Malaysia-based creative and technology company, with SGS AI Marketing as our marketing and creative division serving businesses in Malaysia and Singapore.',
  baseline: '— CREATE. CONNECT. ENGINEER.',
  cards: [
    {
      title: 'CREATE',
      subtitle: 'Brands, Campaigns, Content.',
      image: '/assets/who-we-are/create.jpg',
      imageAlt: 'Creative director evaluating glowing futuristic holographic interfaces',
    },
    {
      title: 'CONNECT',
      subtitle: 'Digital Presence, Customer Engagement.',
      image: '/assets/who-we-are/connect.jpg',
      imageAlt: 'Business leaders silhouetted against a golden hour city skyline',
    },
    {
      title: 'ENGINEER',
      subtitle: 'AI Systems, Business Efficiency.',
      image: '/assets/who-we-are/engineer.jpg',
      imageAlt: 'Hands interacting with node graph holographic architecture',
    },
  ] as WhoWeAreCard[],
};

export const INDUSTRIES_CONTENT = {
  num: '03',
  eyebrow: 'INDUSTRIES WE SERVE',
  headlineMain: 'Different industries.',
  headlineAccent: 'A smarter tomorrow.',
  description:
    'Every industry has its own challenges. We bring creative thinking, digital expertise and intelligent technology together to help businesses move forward.',
  items: [
    {
      id: 'fmcg',
      num: '01',
      title: 'FMCG & Consumer Brands',
      description: 'Stronger brands and deeper consumer connections.',
      image: '/assets/industry-fmcg.jpg',
      imageAlt: 'Consumer packaged goods and olive oil bottles on artisanal store shelf',
    },
    {
      id: 'industrial',
      num: '02',
      title: 'Industrial & Essential Services',
      description: 'Clearer communication and smarter operations.',
      image: '/assets/industry-industrial.jpg',
      imageAlt: 'Modern industrial processing plant illuminated at dusk',
    },
    {
      id: 'retail',
      num: '03',
      title: 'Retail & Commerce',
      description: 'Engage customers and grow online and offline sales.',
      image: '/assets/industry-retail.jpg',
      imageAlt: 'Luxury retail boutique with modern architectural interior lighting',
    },
    {
      id: 'sme',
      num: '04',
      title: 'SMEs & Professional Services',
      description: 'Build visibility and trust for sustainable growth.',
      image: '/assets/industry-sme.jpg',
      imageAlt: 'Executive partners collaborating on strategy with laptop',
    },
    {
      id: 'distribution',
      num: '05',
      title: 'Distribution & Supply Chain',
      description: 'Strengthen your network with smarter communication.',
      image: '/assets/industry-logistics.jpg',
      imageAlt: 'Commercial freight transport truck parked at distribution terminal',
    },
  ] as IndustryItem[],
};

export const EXPERTISE_CONTENT = {
  num: '04',
  eyebrow: 'OUR EXPERTISE',
  headlineLines: ['Good ideas', 'need great', 'execution.'],
  capabilities: [
    {
      num: '01',
      title: 'Brand Strategy & Creative',
      description: 'Brand identity, campaigns and creative solutions.',
      iconName: 'lightbulb',
    },
    {
      num: '02',
      title: 'Digital Marketing',
      description: 'Social media, performance marketing and content.',
      iconName: 'chart',
    },
    {
      num: '03',
      title: 'Content & Media Production',
      description: 'Video, photography and branded content.',
      iconName: 'video',
    },
    {
      num: '04',
      title: 'AI Applications & Engineering',
      description: 'Custom AI tools and intelligent systems.',
      iconName: 'cpu',
    },
    {
      num: '05',
      title: 'Business Process Automation',
      description: 'Smarter workflows and operational efficiency.',
      iconName: 'settings',
    },
    {
      num: '06',
      title: 'Websites & Digital Experiences',
      description: 'Modern websites and digital platforms.',
      iconName: 'monitor',
    },
  ] as CapabilityItem[],
};

export const WORK_CATEGORIES: WorkCategory[] = [
  { id: 'brand-campaigns', label: 'Brand & Campaigns' },
  { id: 'packaging-experience', label: 'Packaging & Product Experience' },
  { id: 'corporate-solutions', label: 'Corporate & Industrial Solutions' },
  { id: 'ai-systems', label: 'AI Systems & Business Automation' },
];

export const CASE_STUDIES: CaseStudy[] = [
  // Category 1: Brand & Campaigns
  {
    id: 'luxury-fragrance-launch',
    categoryId: 'brand-campaigns',
    categoryLabel: 'Brand & Campaigns',
    sector: 'FMCG',
    index: '01',
    total: '04',
    title: 'Luxury Fragrance Launch',
    subtitle:
      'A strategic campaign, content production and digital rollout to build a stronger brand presence and drive sales impact.',
    coverImage: '/assets/work/luxury-fragrance.jpg',
    thumbnails: [
      '/assets/work/luxury-fragrance.jpg',
      '/assets/work/beauty-range.jpg',
      '/assets/who-we-are/create.jpg',
      '/assets/work/city-ooh.jpg',
      '/assets/industry-retail.jpg',
    ],
    challenge:
      'Increase brand visibility in a competitive fragrance market and drive consumer engagement across digital and retail touchpoints.',
    approach:
      'Developed a distinctive visual identity, multi-platform campaign and high-impact content to connect with target consumers.',
    execution:
      'Campaign visuals, product photography, social media content, OOH assets and launch video.',
    outcome:
      'Stronger brand presence, higher engagement and successful market launch.',
    tags: ['Brand Strategy', 'Creative Campaign', 'Video Production', 'Digital Marketing', 'OOH'],
    hasVideo: true,
  },
  {
    id: 'beauty-range-campaign',
    categoryId: 'brand-campaigns',
    categoryLabel: 'Brand & Campaigns',
    sector: 'FMCG',
    index: '02',
    total: '04',
    title: 'Beauty Range Campaign',
    subtitle:
      'Integrated product launch uniting high-contrast studio packaging, influencer seeding, and e-commerce conversion assets.',
    coverImage: '/assets/work/beauty-range.jpg',
    thumbnails: [
      '/assets/work/beauty-range.jpg',
      '/assets/work/luxury-fragrance.jpg',
      '/assets/work/cinema-camera.jpg',
      '/assets/industry-fmcg.jpg',
      '/assets/work/city-ooh.jpg',
    ],
    challenge:
      'Differentiating a new botanicals skincare formulation against crowded regional luxury shelf offerings.',
    approach:
      'Crafted vibrant magenta and gold product storytelling highlighting formulation purity and premium sensorial rituals.',
    execution:
      'Studio cinematography, e-commerce content kits, retail display merchandising, and micro-influencer digital ad creative.',
    outcome:
      'Accelerated direct-to-consumer sell-through and immediate retail partner placement across Malaysia & Singapore.',
    tags: ['Product Launch', 'Art Direction', 'Commercial Photography', 'Packaging Systems'],
    hasVideo: true,
  },
  {
    id: 'city-ooh-campaign',
    categoryId: 'brand-campaigns',
    categoryLabel: 'Brand & Campaigns',
    sector: 'Retail',
    index: '03',
    total: '04',
    title: 'City OOH Campaign',
    subtitle:
      'Large-format dynamic digital billboard installations commanding prime footfall in downtown metropolitan shopping districts.',
    coverImage: '/assets/work/city-ooh.jpg',
    thumbnails: [
      '/assets/work/city-ooh.jpg',
      '/assets/who-we-are/connect.jpg',
      '/assets/industry-retail.jpg',
      '/assets/work/luxury-fragrance.jpg',
      '/assets/nira-official.png',
    ],
    challenge:
      'Achieving high-memorability brand cut-through during peak retail shopping seasons across major city corridors.',
    approach:
      'Engineered an architectural 3D anamorphic perspective display that visually breaks outward from the building facade.',
    execution:
      'High-resolution 3D motion design, localized time-of-day dynamic sequencing, and synchronized social media tie-ins.',
    outcome:
      'Over 2.4 million documented high-intent impressions with extensive organic consumer social resharing.',
    tags: ['OOH Media', 'Motion Graphics', 'Retail Activation', 'Creative Direction'],
    hasVideo: false,
  },
  {
    id: 'product-video-series',
    categoryId: 'brand-campaigns',
    categoryLabel: 'Brand & Campaigns',
    sector: 'FMCG',
    index: '04',
    total: '04',
    title: 'Product Video Series',
    subtitle:
      'Studio-grade commercial video productions showcasing behind-the-scenes precision and consumer lifestyle aspiration.',
    coverImage: '/assets/work/cinema-camera.jpg',
    thumbnails: [
      '/assets/work/cinema-camera.jpg',
      '/assets/work/luxury-fragrance.jpg',
      '/assets/who-we-are/create.jpg',
      '/assets/work/beauty-range.jpg',
      '/assets/who-we-are/engineer.jpg',
    ],
    challenge:
      'Overcoming consumer skepticism by visualizing rigorous ingredient sourcing and laboratory quality standards.',
    approach:
      'Combined cinematic anamorphic camera rigs with high-speed macro fluid capture and documentary founder narrative.',
    execution:
      'Multi-day studio filming, color grading in DaVinci Resolve, dynamic sound design, and omnichannel aspect-ratio mastering.',
    outcome:
      'Elevated brand trust metrics by 42% across regional consumer focus groups and drove record video completion rates.',
    tags: ['Cinematography', 'Video Production', 'Commercial Storytelling', 'Sound Design'],
    hasVideo: true,
  },

  // Category 2: Packaging & Product Experience
  {
    id: 'artisanal-fmcg-packaging',
    categoryId: 'packaging-experience',
    categoryLabel: 'Packaging & Product Experience',
    sector: 'FMCG & Retail',
    index: '01',
    total: '02',
    title: 'Artisanal Reserve Packaging Architecture',
    subtitle:
      'Structural box engineering, custom embossed labeling, and tactile sustainable materials for luxury consumer goods.',
    coverImage: '/assets/industry-fmcg.jpg',
    thumbnails: [
      '/assets/industry-fmcg.jpg',
      '/assets/work/luxury-fragrance.jpg',
      '/assets/work/beauty-range.jpg',
      '/assets/industry-retail.jpg',
      '/assets/work/city-ooh.jpg',
    ],
    challenge:
      'Re-engineering legacy product packaging into a sustainable premium format that justifies luxury price positioning.',
    approach:
      'Designed unboxing touchpoints utilizing post-consumer recycled paperboard, gold foil stampings, and airtight cork seals.',
    execution:
      'Structural packaging prototypes, dieline engineering, print vendor press checks, and barcode compliance testing.',
    outcome:
      'Achieved prestigious international packaging design accolades and lowered logistics breakage by 18%.',
    tags: ['Packaging Design', 'Structural Engineering', 'Print Production', 'FMCG'],
    hasVideo: false,
  },
  {
    id: 'luxury-retail-merchandising',
    categoryId: 'packaging-experience',
    categoryLabel: 'Packaging & Product Experience',
    sector: 'Retail & Commerce',
    index: '02',
    total: '02',
    title: 'Flagship Merchandising & POS Displays',
    subtitle:
      'Modular experiential floor displays and lighted acrylic vitrines engineered for prime department store environments.',
    coverImage: '/assets/industry-retail.jpg',
    thumbnails: [
      '/assets/industry-retail.jpg',
      '/assets/work/beauty-range.jpg',
      '/assets/work/luxury-fragrance.jpg',
      '/assets/who-we-are/create.jpg',
      '/assets/work/city-ooh.jpg',
    ],
    challenge:
      'Creating high-touch interactive display fixtures that entice tactile customer sampling without staff intervention.',
    approach:
      'Engineered illuminated magnetic product pedestals with embedded NFC chips that trigger interactive tablet specs.',
    execution:
      'CAD fabrication drawings, prototype material stress tests, nationwide rollout logistics, and installation guides.',
    outcome:
      'Demonstrated 35% higher in-store dwell times and elevated direct boutique purchase conversions.',
    tags: ['Retail Displays', 'POS Merchandising', 'Spatial Design', 'Customer Experience'],
    hasVideo: false,
  },

  // Category 3: Corporate & Industrial Solutions
  {
    id: 'infrastructure-digital-portal',
    categoryId: 'corporate-solutions',
    categoryLabel: 'Corporate & Industrial Solutions',
    sector: 'Industrial & Essential Services',
    index: '01',
    total: '02',
    title: 'Essential Services Digital Hub & Stakeholder Platform',
    subtitle:
      'Unified enterprise portal communicating environmental governance, real-time facility telemetry, and investor reporting.',
    coverImage: '/assets/industry-industrial.jpg',
    thumbnails: [
      '/assets/industry-industrial.jpg',
      '/assets/who-we-are/engineer.jpg',
      '/assets/industry-logistics.jpg',
      '/assets/who-we-are/connect.jpg',
      '/assets/nira-connected-earth.png',
    ],
    challenge:
      'Modernizing public utility communication to satisfy strict ESG reporting requirements and consumer transparency expectations.',
    approach:
      'Engineered an intuitive corporate storytelling experience backed by live operational metrics and interactive compliance audits.',
    execution:
      'Enterprise React architecture, WCAG AA accessibility audits, secure stakeholder document vaults, and press distribution tools.',
    outcome:
      'Pioneered transparent utility communications across Malaysia and eliminated 80% of routine investor inquiry calls.',
    tags: ['Corporate Platforms', 'ESG Reporting', 'Enterprise Web', 'Industrial Tech'],
    hasVideo: false,
  },
  {
    id: 'supply-chain-network-suite',
    categoryId: 'corporate-solutions',
    categoryLabel: 'Corporate & Industrial Solutions',
    sector: 'Distribution & Supply Chain',
    index: '02',
    total: '02',
    title: 'Fleet & Distributor Communications Network',
    subtitle:
      'Integrated trade communications and digital dispatch tools connecting warehouse logistics hubs with regional retail partners.',
    coverImage: '/assets/industry-logistics.jpg',
    thumbnails: [
      '/assets/industry-logistics.jpg',
      '/assets/industry-industrial.jpg',
      '/assets/who-we-are/engineer.jpg',
      '/assets/who-we-are/connect.jpg',
      '/assets/industry-sme.jpg',
    ],
    challenge:
      'Bridging fragmented communication gaps between warehouse logistics operators and hundreds of independent trade retail dealers.',
    approach:
      'Built a low-latency web application streamlining order acknowledgments, delivery window tracking, and real-time inventory updates.',
    execution:
      'Mobile-optimized driver web consoles, automated SMS/WhatsApp dispatch triggers, and executive logistics dashboards.',
    outcome:
      'Reduced turnaround dispatch discrepancies by 29% and consolidated regional dealer inquiries into a single channel.',
    tags: ['Supply Chain', 'Logistics UX', 'Operational Systems', 'B2B Communication'],
    hasVideo: false,
  },

  // Category 4: AI Systems & Business Automation
  {
    id: 'enterprise-workflow-automation',
    categoryId: 'ai-systems',
    categoryLabel: 'AI Systems & Business Automation',
    sector: 'Enterprise AI',
    index: '01',
    total: '02',
    title: 'Automated Multi-Channel Content & Reporting Engine',
    subtitle:
      'Custom machine intelligence pipeline turning raw business data into branded executive presentations and campaign assets.',
    coverImage: '/assets/who-we-are/engineer.jpg',
    thumbnails: [
      '/assets/who-we-are/engineer.jpg',
      '/assets/nira-connected-earth.png',
      '/assets/industry-sme.jpg',
      '/assets/work/cinema-camera.jpg',
      '/assets/who-we-are/create.jpg',
    ],
    challenge:
      'Marketing teams spent over 30 hours per week manually consolidating regional sales reports and generating repetitive social assets.',
    approach:
      'Architected a proprietary node-based generative pipeline automating report summarization and localized graphic generation.',
    execution:
      'Internal REST API connectors, automated template styling engines, LLM-based commercial copy generation, and PDF export workers.',
    outcome:
      'Reclaimed 85% of creative team production hours while maintaining 100% brand guideline typography compliance.',
    tags: ['AI Automation', 'Workflow Orchestration', 'Generative Tooling', 'Internal Systems'],
    hasVideo: true,
  },
  {
    id: 'connected-intelligence-dashboard',
    categoryId: 'ai-systems',
    categoryLabel: 'AI Systems & Business Automation',
    sector: 'Regional Intelligence',
    index: '02',
    total: '02',
    title: 'Southeast Asia Cross-Border Intelligence Matrix',
    subtitle:
      'Real-time data visualization connecting market signals, competitor sentiment, and campaign performance across ASEAN hubs.',
    coverImage: '/assets/nira-connected-earth.png',
    thumbnails: [
      '/assets/nira-connected-earth.png',
      '/assets/who-we-are/engineer.jpg',
      '/assets/who-we-are/connect.jpg',
      '/assets/nira-official.png',
      '/assets/industry-industrial.jpg',
    ],
    challenge:
      'Executive leadership required a unified cockpit to monitor regional digital campaign performance across currency boundaries.',
    approach:
      'Developed an animated geographic mapping interface with automated anomaly alerts and multi-tier role permissions.',
    execution:
      'WebGL particle trajectory maps, real-time Firestore synchronization, high-frequency currency conversions, and automated audit trails.',
    outcome:
      'Accelerated strategic budget allocation decisions from weeks to minutes across Malaysia, Singapore, and regional partners.',
    tags: ['Data Visualization', 'Executive Cockpit', 'Enterprise AI', 'ASEAN Tech'],
    hasVideo: true,
  },
];

export const CONTACT_CONTENT = {
  num: '06',
  eyebrow: 'CONTACT',
  headline: "Let's build what's next.",
  intro:
    'Have a brand to grow, a business challenge to solve, or an idea worth bringing to life? Let\'s talk.',
  details: [
    {
      label: 'Business enquiries · TK',
      value: '+60 11-3944 0907',
      subtext: 'AI Business Solutions Consultant · Executive Director',
      href: 'tel:+601139440907',
      type: 'tel',
    },
    {
      label: 'Appointments',
      value: '+60 17-270 8575',
      href: 'tel:+60172708575',
      type: 'tel',
    },
    {
      label: 'Email',
      value: 'sgsaimarketing@gmail.com',
      href: 'mailto:sgsaimarketing@gmail.com',
      type: 'mailto',
    },
    {
      label: 'Regional coverage',
      value: 'Malaysia · Singapore',
      type: 'text',
    },
  ] as ContactDetail[],
  cardTitle: 'Start a conversation',
  cardIntro:
    'The fastest way to reach us is directly. Email us about your project, or call to talk it through and arrange an appointment.',
  footerTagline:
    'Creative strategy, digital marketing, content production, AI software and business automation — connected.',
  footerPrivacy:
    'Details you share by email or phone are used only to respond to your enquiry.',
};
