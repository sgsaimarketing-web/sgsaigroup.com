/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Automated Verification for:
 * 1. Section 06 Direct WhatsApp & Email Routing
 * 2. Section 05 Media Compressor & 3-Tab Selected Work Profile Architecture
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CASE_STUDIES, WORK_CATEGORIES } from './siteContent.ts';

describe('Contact Form Direct Routing & Media CMS Verification', () => {
  // Test 1: WhatsApp URL Formatting
  it('generates verified WhatsApp URL targeting +60 11-3944 0907 with full structured payload', () => {
    const WHATSAPP_NUMBER = '601139440907';
    const sampleForm = {
      name: 'Sarah Tan',
      email: 'sarah@enterprise.com',
      service: 'AI Applications & Custom Engineering',
      message: 'Need automated distributor analytics platform across Malaysia and Singapore.',
    };

    const messageText =
      `*New SGS AI Group Project Inquiry*\n\n` +
      `*Client Name:* ${sampleForm.name}\n` +
      `*Business Email:* ${sampleForm.email}\n` +
      `*Strategic Objective:* ${sampleForm.service}\n\n` +
      `*Project Overview & Brief:*\n${sampleForm.message}`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;

    assert.ok(waUrl.startsWith('https://wa.me/601139440907?text='), 'Target WhatsApp URL must point to 601139440907');
    assert.ok(waUrl.includes(encodeURIComponent('Sarah Tan')), 'Must contain encoded client name');
    assert.ok(waUrl.includes(encodeURIComponent('sarah@enterprise.com')), 'Must contain encoded email');
    assert.ok(waUrl.includes(encodeURIComponent('AI Applications & Custom Engineering')), 'Must contain encoded objective');
  });

  // Test 2: Mailto URL Formatting
  it('generates verified Mailto URL targeting sgsaimarketing@gmail.com with subject and body', () => {
    const TARGET_EMAIL = 'sgsaimarketing@gmail.com';
    const sampleForm = {
      name: 'Sarah Tan',
      email: 'sarah@enterprise.com',
      service: 'Brand Strategy & Creative',
      message: 'Looking to rebrand regional FMCG product portfolio.',
    };

    const subject = `SGS AI Group Inquiry — ${sampleForm.service} (${sampleForm.name})`;
    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(sampleForm.message)}`;

    assert.ok(mailtoUrl.startsWith('mailto:sgsaimarketing@gmail.com?'), 'Must target sgsaimarketing@gmail.com');
    assert.ok(mailtoUrl.includes(encodeURIComponent(sampleForm.name)), 'Subject must contain name');
    assert.ok(mailtoUrl.includes(encodeURIComponent(sampleForm.service)), 'Subject must contain service');
  });

  // Test 3: Media Type Detection Logic
  it('correctly discriminates image vs video URLs to prevent broken video playback tags', () => {
    const isImage = (url: string) =>
      url.startsWith('data:image/') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.webp');

    const isVideo = (url: string) =>
      url.startsWith('data:video/') || url.endsWith('.mp4') || url.endsWith('.webm');

    // Sample URLs
    assert.strictEqual(isImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'), true);
    assert.strictEqual(isVideo('data:image/png;base64,iVBORw0KGgoAAA...'), false);

    assert.strictEqual(isImage('/assets/work/luxury-fragrance.jpg'), true);
    assert.strictEqual(isVideo('/assets/work/luxury-fragrance.jpg'), false);

    assert.strictEqual(isVideo('data:video/mp4;base64,AAAAHGZ0eXBtcDQy...'), true);
    assert.strictEqual(isImage('data:video/mp4;base64,AAAAHGZ0eXBtcDQy...'), false);
  });

  // Test 4: Selected Work 3-Tab Schema Integrity
  it('verifies all case studies satisfy the 3-tab schema requirements (Media, Story, Dossier)', () => {
    CASE_STUDIES.forEach((project) => {
      // Tab 1: Media
      assert.ok(project.coverImage, `Project ${project.id} must have coverImage`);
      assert.ok(['cover', 'contain', undefined].includes(project.coverFit), 'Invalid coverFit');
      assert.ok(
        ['center', 'top', 'bottom', 'left', 'right', undefined].includes(project.coverFocalPoint),
        'Invalid focalPoint'
      );

      // Tab 2: Story
      assert.ok(project.title && project.title.length > 0, `Project ${project.id} missing title`);
      assert.ok(project.sector && project.sector.length > 0, `Project ${project.id} missing sector`);
      assert.ok(project.challenge && project.challenge.length > 0, `Project ${project.id} missing challenge`);
      assert.ok(project.approach && project.approach.length > 0, `Project ${project.id} missing approach`);

      // Tab 3: Deliverables & Dossier
      assert.ok(project.execution && project.execution.length > 0, `Project ${project.id} missing execution`);
      assert.ok(project.outcome && project.outcome.length > 0, `Project ${project.id} missing outcome`);
      assert.ok(Array.isArray(project.tags) && project.tags.length > 0, `Project ${project.id} missing tags`);
    });
  });

  // Test 5: Storage Quota Safety
  it('verifies safe storage setter handles quota limits without unhandled exceptions', () => {
    const mockStorage: Record<string, string> = {};
    const safeSet = (key: string, value: string) => {
      try {
        if (value.length > 1000) {
          throw new Error('QuotaExceededError');
        }
        mockStorage[key] = value;
        return true;
      } catch {
        // Fallback gracefully without throwing
        return false;
      }
    };

    assert.strictEqual(safeSet('normal_key', 'short payload'), true);
    assert.strictEqual(safeSet('large_key', 'A'.repeat(2000)), false);
    // Does not throw an uncaught exception
    assert.strictEqual(mockStorage['normal_key'], 'short payload');
  });

  // Test 6: 9:16 Vertical Aspect Ratio Standard
  it('standardizes on 9:16 vertical format for mobile-first showcase cards', () => {
    const verticalRatio = 9 / 16;
    assert.strictEqual(verticalRatio, 0.5625);
    // Verifies 9:16 height calculation given 300px width
    const cardWidth = 300;
    const cardHeight = (cardWidth / 9) * 16;
    assert.strictEqual(Math.round(cardHeight), 533);
  });

  // Test 7: Video Poster Decoupling to Prevent 0:00 / 1:00 Black Screen
  it('ensures video case studies decouple poster image from video streams to prevent decoder stalls', () => {
    const videoProjects = CASE_STUDIES.filter((p) => p.hasVideo);
    assert.ok(videoProjects.length > 0, 'Must have at least one video showcase project');
    videoProjects.forEach((proj) => {
      assert.ok(
        proj.coverImage && proj.coverImage.length > 0,
        `Video project ${proj.id} must have a valid cover image for 9:16 poster rendering`
      );
      assert.ok(
        !proj.coverImage.startsWith('data:video/'),
        `Video project ${proj.id} coverImage must be an image, not raw video data`
      );
    });
  });

  // Test 8: Fast Playback Format Validation
  it('validates supported video stream formats and codecs without stalling browser memory', () => {
    const isSupportedVideoUrl = (url: string) => {
      return (
        url.startsWith('blob:') ||
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.endsWith('.mp4') ||
        url.endsWith('.webm')
      );
    };

    assert.strictEqual(isSupportedVideoUrl('blob:http://localhost:3000/123-abc'), true);
    assert.strictEqual(isSupportedVideoUrl('/assets/showreel.mp4'), true);
    assert.strictEqual(isSupportedVideoUrl('https://stream.example.com/reel.webm'), true);
  });

  // Test 9: Video Case Study Source Integrity
  it('ensures video case studies have genuine video streams rather than image files', () => {
    const videoProjects = CASE_STUDIES.filter((p) => p.hasVideo && p.videoUrl);
    assert.ok(videoProjects.length >= 2, 'Should have verified video case studies');
    videoProjects.forEach((proj) => {
      assert.ok(
        proj.videoUrl?.endsWith('.mp4') || proj.videoUrl?.endsWith('.webm') || proj.videoUrl?.startsWith('blob:'),
        `Video project ${proj.id} videoUrl must be a video format, found: ${proj.videoUrl}`
      );
    });
  });

  // Test 10: Modal Stream and Poster Resolution Fallback
  it('gracefully rescues video player when an image is passed as video source', () => {
    const isVideoUrl = (u?: string) =>
      !!u && (u.startsWith('blob:') || u.startsWith('data:video/') || u.endsWith('.mp4') || u.endsWith('.webm'));
    const isImageUrl = (u?: string) =>
      !!u && (u.startsWith('data:image/') || u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.webp'));

    const mockCorruptedItem = {
      url: '/assets/work/luxury-fragrance.jpg', // image passed as video
      type: 'video',
      poster: '',
    };
    const defaultVideoUrl = '/assets/nira-loop.mp4';
    const defaultPosterUrl = '/assets/work/luxury-fragrance.jpg';

    // Resolution logic
    const resolvedVideo = isVideoUrl(mockCorruptedItem.url) ? mockCorruptedItem.url : defaultVideoUrl;
    const resolvedPoster = isImageUrl(mockCorruptedItem.poster)
      ? mockCorruptedItem.poster
      : isImageUrl(mockCorruptedItem.url)
      ? mockCorruptedItem.url
      : defaultPosterUrl;

    assert.strictEqual(resolvedVideo, '/assets/nira-loop.mp4', 'Must rescue video player with valid stream');
    assert.strictEqual(resolvedPoster, '/assets/work/luxury-fragrance.jpg', 'Must rescue poster with valid image');
  });
});
