import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SITE_CONFIG,
  NAV_LINKS,
  HERO_CONTENT,
  WHO_WE_ARE_CONTENT,
  INDUSTRIES_CONTENT,
  EXPERTISE_CONTENT,
  WORK_CATEGORIES,
  CASE_STUDIES,
  CONTACT_CONTENT,
} from './siteContent.ts';

test('site config contains verified SGS AI Group contact details and branding', () => {
  assert.equal(SITE_CONFIG.brandName, 'SGS AI Group');
  assert.equal(SITE_CONFIG.marketingBrandName, 'SGS AI Marketing');
  assert.equal(SITE_CONFIG.philosophy, 'Human Thinking. Intelligent Execution.');
  assert.equal(SITE_CONFIG.email, 'sgsaimarketing@gmail.com');
  assert.equal(SITE_CONFIG.phoneTK, '+60 11-3944 0907');
  assert.equal(SITE_CONFIG.phoneAppointments, '+60 17-270 8575');
  assert.equal(SITE_CONFIG.regions, 'Malaysia · Singapore');
});

test('navigation contains exactly the 5 links from the approved mockup', () => {
  const labels = NAV_LINKS.map((n) => n.label);
  assert.deepEqual(labels, ['About', 'Industries', 'Expertise', 'Our Work', 'Contact']);
});

test('hero content matches approved master mockup', () => {
  assert.equal(HERO_CONTENT.eyebrow, 'HUMAN THINKING. INTELLIGENT EXECUTION.');
  assert.deepEqual(HERO_CONTENT.headlineLines, ['WE BUILD WHAT', 'MOVES BUSINESS', 'FORWARD.']);
  assert.equal(HERO_CONTENT.primaryCta.label, 'Explore Our Work');
  assert.equal(HERO_CONTENT.secondaryCta.label, 'Watch Showreel');
  assert.equal(HERO_CONTENT.niraBadge.title, 'NIRA');
});

test('who we are contains 3 core discipline cards (Create, Connect, Engineer)', () => {
  assert.equal(WHO_WE_ARE_CONTENT.cards.length, 3);
  assert.equal(WHO_WE_ARE_CONTENT.cards[0].title, 'CREATE');
  assert.equal(WHO_WE_ARE_CONTENT.cards[1].title, 'CONNECT');
  assert.equal(WHO_WE_ARE_CONTENT.cards[2].title, 'ENGINEER');
});

test('industries section contains all 5 required industries', () => {
  assert.equal(INDUSTRIES_CONTENT.items.length, 5);
  const titles = INDUSTRIES_CONTENT.items.map((i) => i.title);
  assert.deepEqual(titles, [
    'FMCG & Consumer Brands',
    'Industrial & Essential Services',
    'Retail & Commerce',
    'SMEs & Professional Services',
    'Distribution & Supply Chain',
  ]);
});

test('expertise section contains all 6 core capabilities', () => {
  assert.equal(EXPERTISE_CONTENT.capabilities.length, 6);
  assert.equal(EXPERTISE_CONTENT.capabilities[0].title, 'Brand Strategy & Creative');
  assert.equal(EXPERTISE_CONTENT.capabilities[5].title, 'Websites & Digital Experiences');
});

test('selected work has 4 interactive categories and rich case study dossiers', () => {
  assert.equal(WORK_CATEGORIES.length, 4);
  const categoryIds = WORK_CATEGORIES.map((c) => c.id);
  assert.ok(categoryIds.includes('brand-campaigns'));
  assert.ok(categoryIds.includes('packaging-experience'));
  assert.ok(categoryIds.includes('corporate-solutions'));
  assert.ok(categoryIds.includes('ai-systems'));

  const luxuryFragrance = CASE_STUDIES.find((c) => c.id === 'luxury-fragrance-launch');
  assert.ok(luxuryFragrance);
  assert.equal(luxuryFragrance.sector, 'FMCG');
  assert.ok(luxuryFragrance.challenge);
  assert.ok(luxuryFragrance.approach);
  assert.ok(luxuryFragrance.execution);
  assert.ok(luxuryFragrance.outcome);
  assert.ok(luxuryFragrance.thumbnails.length >= 4);
});

test('contact section preserves verified direct communication links', () => {
  assert.equal(CONTACT_CONTENT.details[0].value, '+60 11-3944 0907');
  assert.equal(CONTACT_CONTENT.details[1].value, '+60 17-270 8575');
  assert.equal(CONTACT_CONTENT.details[2].value, 'sgsaimarketing@gmail.com');
});
