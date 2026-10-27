import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_DATA } from '../context/ContentContext.tsx';
import { generateSiteContentTs } from './contentSerializer.ts';

test('content serializer outputs valid TypeScript code with all exported symbols', () => {
  const code = generateSiteContentTs(DEFAULT_SITE_DATA);
  assert.ok(code.includes('export const SITE_CONFIG: SiteConfig ='));
  assert.ok(code.includes('export const NAV_LINKS: NavItem[] ='));
  assert.ok(code.includes('export const HERO_CONTENT: HeroContent ='));
  assert.ok(code.includes('export const WHO_WE_ARE_CONTENT: WhoWeAreContent ='));
  assert.ok(code.includes('export const INDUSTRIES_CONTENT: IndustriesContent ='));
  assert.ok(code.includes('export const EXPERTISE_CONTENT: ExpertiseContent ='));
  assert.ok(code.includes('export const WORK_CATEGORIES: WorkCategory[] ='));
  assert.ok(code.includes('export const CASE_STUDIES: CaseStudy[] ='));
  assert.ok(code.includes('export const CONTACT_CONTENT: ContactContent ='));
  assert.ok(code.includes('SGS AI Group'));
  assert.ok(code.includes('+60 11-3944 0907'));
  assert.ok(code.includes('sgsaimarketing@gmail.com'));
});
