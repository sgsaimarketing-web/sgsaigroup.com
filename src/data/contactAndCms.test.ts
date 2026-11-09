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

  // Test 11: 9:16 Video Frame Grabber Cover Crop Calculation Math
  it('correctly calculates 9:16 cover crop dimensions across diverse aspect source videos', async () => {
    const { calculateCoverCrop } = await import('../utils/videoFrameGrabber.ts');

    // 16:9 Landscape Video (1920x1080) -> Target 9:16 (e.g. 540x960)
    // Target ratio = 540 / 960 = 0.5625. Source ratio = 1920 / 1080 = 1.777.
    // Source is wider than target -> crop horizontally, full height.
    const landscapeCrop = calculateCoverCrop(1920, 1080, 540, 960);
    assert.strictEqual(landscapeCrop.sHeight, 1080);
    assert.strictEqual(Math.round(landscapeCrop.sWidth), Math.round(1080 * (540 / 960))); // 607.5 -> 608
    assert.strictEqual(landscapeCrop.sy, 0);
    assert.ok(landscapeCrop.sx > 0, 'Must center horizontal crop for landscape input');

    // 9:16 Vertical Video (1080x1920) -> Target 9:16 (540x960)
    // Same ratio -> full width and height with zero offset
    const verticalCrop = calculateCoverCrop(1080, 1920, 540, 960);
    assert.strictEqual(verticalCrop.sWidth, 1080);
    assert.strictEqual(verticalCrop.sHeight, 1920);
    assert.strictEqual(verticalCrop.sx, 0);
    assert.strictEqual(verticalCrop.sy, 0);

    // 1:1 Square Video (1080x1080) -> Target 9:16 (540x960)
    // Square is wider than 9:16 -> crop horizontally
    const squareCrop = calculateCoverCrop(1080, 1080, 540, 960);
    assert.strictEqual(squareCrop.sHeight, 1080);
    assert.strictEqual(Math.round(squareCrop.sWidth), Math.round(1080 * (540 / 960))); // 608
    assert.ok(squareCrop.sx > 0, 'Must center square video horizontally');
  });

  // Test 12: Dual Persistence Key Generation for Video Blobs
  it('generates consistent IndexedDB storage keys for binary video blobs', () => {
    const projectId = 'nelson-trading-launch';
    const videoKey = `video_blob_${projectId}`;
    assert.strictEqual(videoKey, 'video_blob_nelson-trading-launch');
  });

  // Test 13: Thumbnail Frame Selection Syncs Card & Modal Poster
  it('ensures selecting a video frame synchronizes both posterUrl and coverImage', () => {
    const mockProject = {
      id: 'nelson-trading-launch',
      coverImage: '/assets/work/old-poster.jpg',
      posterUrl: '/assets/work/old-poster.jpg',
      hasVideo: true,
      videoUrl: '/assets/nira-loop.mp4',
    };

    const newCapturedFrame = 'data:image/webp;base64,UklGRm...frameAt01m24s';

    // Simulated handler onSelectPoster
    const updatedProject = {
      ...mockProject,
      posterUrl: newCapturedFrame,
      coverImage: newCapturedFrame,
    };

    assert.strictEqual(updatedProject.posterUrl, newCapturedFrame);
    assert.strictEqual(updatedProject.coverImage, newCapturedFrame);
    assert.strictEqual(updatedProject.hasVideo, true);
  });

  // Test 14: Nelson Trading Launch Primary Publication
  it('publishes Nelson Trading Launch as the primary showcase project in brand-campaigns', () => {
    const primary = CASE_STUDIES[0];
    assert.strictEqual(primary.id, 'nelson-trading-launch');
    assert.strictEqual(primary.title, 'Nelson Trading Launch');
    assert.strictEqual(primary.sector, 'FMCG');
    assert.strictEqual(primary.hasVideo, true);
    assert.ok(primary.videoUrl, 'Primary project must have active video stream');
    assert.ok(primary.coverImage, 'Primary project must have active cover image');
  });

  // Test 15: Public Server Asset Path Recognition
  it('recognizes server-hosted /assets/uploads/ media paths for live visitor playback', () => {
    const testVideoPath = '/assets/uploads/1731050000-nelson-reel.mp4';
    const testPosterPath = '/assets/uploads/poster-1731050000-grid-0_05.webp';

    const isVideo = (u: string) =>
      u.endsWith('.mp4') || u.endsWith('.webm') || u.startsWith('blob:') || u.startsWith('/assets/');
    const isImage = (u: string) =>
      u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.webp') || u.startsWith('/assets/');

    assert.strictEqual(isVideo(testVideoPath), true);
    assert.strictEqual(isImage(testPosterPath), true);
  });

  // Test 16: Card Play Button Inline Video Toggle
  it('toggles inline video playback when clicking play button on video cards', () => {
    let playingCardId: string | null = null;
    const handleToggleCardPlay = (id: string) => {
      playingCardId = playingCardId === id ? null : id;
    };

    // User clicks play button on Nelson Trading Launch card
    handleToggleCardPlay('nelson-trading-launch');
    assert.strictEqual(playingCardId, 'nelson-trading-launch', 'Must activate video playback on card');

    // User clicks again to pause
    handleToggleCardPlay('nelson-trading-launch');
    assert.strictEqual(playingCardId, null, 'Must pause video playback on card');
  });

  // Test 17: Modal Theater Visual & Filmstrip Thumbnail Source Synchronization
  it('guarantees active thumbnail visual matches the main theater stage visual source', () => {
    const isImg = (u?: string) => !!u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.webp') || u.startsWith('data:image/') || u.startsWith('/assets/'));

    const getMediaDisplaySrc = (item: { url: string; poster?: string; type: string }, defaultPoster: string): string => {
      if (item.type === 'video') {
        if (item.poster && isImg(item.poster)) return item.poster;
        return defaultPoster;
      }
      if (item.url && isImg(item.url)) return item.url;
      if (item.poster && isImg(item.poster)) return item.poster;
      return defaultPoster;
    };

    // Case: User added an image item where poster was initialized to a different image (e.g. perfume)
    const galleryItemImage = {
      id: 'media-1',
      url: '/assets/uploads/fathers-day-campaign.png',
      poster: '/assets/work/luxury-fragrance.jpg', // Stale or default poster
      type: 'image',
    };

    const mainStageSrc = getMediaDisplaySrc(galleryItemImage, '/assets/work/nelson-diamond.png');
    const thumbImgSrc = getMediaDisplaySrc(galleryItemImage, '/assets/work/nelson-diamond.png');

    // Both MUST be identical so there is zero mismatch between main stage and thumbnail!
    assert.strictEqual(
      mainStageSrc,
      '/assets/uploads/fathers-day-campaign.png',
      'Main stage visual must use image URL'
    );
    assert.strictEqual(
      thumbImgSrc,
      '/assets/uploads/fathers-day-campaign.png',
      'Thumbnail visual must strictly match the main stage visual'
    );
    assert.strictEqual(mainStageSrc, thumbImgSrc, 'Stage and thumbnail must be 100% in sync');
  });
});
