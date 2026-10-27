import {
  SiteConfig,
  NavItem,
  HeroContent,
  WhoWeAreContent,
  IndustriesContent,
  ExpertiseContent,
  WorkCategory,
  CaseStudy,
  ContactContent,
} from './siteContent.ts';

export interface SiteData {
  config: SiteConfig;
  navLinks: NavItem[];
  hero: HeroContent;
  whoWeAre: WhoWeAreContent;
  industries: IndustriesContent;
  expertise: ExpertiseContent;
  workCategories: WorkCategory[];
  caseStudies: CaseStudy[];
  contact: ContactContent;
}

/**
 * Serializes the complete SiteData structure back into a pristine TypeScript source file
 * that can replace src/data/siteContent.ts directly for 100% static & permanent deployment.
 */
export function generateSiteContentTs(data: SiteData): string {
  return `/**
 * SGS AI Group - Site Content & Brand Configuration
 * Visual Master: /public/assets/aistudio/SGS_AI_Group_Portfolio_Showcase_e406d3e2.png
 * Master Company: SGS AI Group (Creative Intelligence × AI Engineering)
 * Division: SGS AI Marketing (Creative and digital marketing company serving Malaysia and Singapore)
 * Brand Philosophy: Human Thinking. Intelligent Execution.
 * Generated via SGS AI Group Visual Content & Design Editor
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
  focalPoint?: 'center' | 'top' | 'bottom';
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

export const SITE_CONFIG: SiteConfig = ${JSON.stringify(data.config, null, 2)};

export const NAV_LINKS: NavItem[] = ${JSON.stringify(data.navLinks, null, 2)};

export const HERO_CONTENT: HeroContent = ${JSON.stringify(data.hero, null, 2)};

export const WHO_WE_ARE_CONTENT: WhoWeAreContent = ${JSON.stringify(data.whoWeAre, null, 2)};

export const INDUSTRIES_CONTENT: IndustriesContent = ${JSON.stringify(data.industries, null, 2)};

export const EXPERTISE_CONTENT: ExpertiseContent = ${JSON.stringify(data.expertise, null, 2)};

export const WORK_CATEGORIES: WorkCategory[] = ${JSON.stringify(data.workCategories, null, 2)};

export const CASE_STUDIES: CaseStudy[] = ${JSON.stringify(data.caseStudies, null, 2)};

export const CONTACT_CONTENT: ContactContent = ${JSON.stringify(data.contact, null, 2)};
`;
}
