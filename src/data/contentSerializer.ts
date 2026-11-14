import type {
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
