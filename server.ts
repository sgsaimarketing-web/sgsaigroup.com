import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { generateSiteContentTs } from './src/data/contentSerializer.ts';
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
} from './src/data/siteContent.ts';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure required directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-content.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public/assets/uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory versioning & SSE subscribers
let contentVersion = Date.now().toString();
const sseClients = new Set<Response>();

function broadcastUpdate(data: any, version: string) {
  const payload = `data: ${JSON.stringify({ type: 'content_update', version, timestamp: Date.now(), data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Default baseline data in case file is absent
const DEFAULT_SITE_DATA = {
  config: SITE_CONFIG,
  navLinks: NAV_LINKS,
  hero: HERO_CONTENT,
  whoWeAre: WHO_WE_ARE_CONTENT,
  industries: INDUSTRIES_CONTENT,
  expertise: EXPERTISE_CONTENT,
  workCategories: WORK_CATEGORIES,
  caseStudies: CASE_STUDIES,
  contact: CONTACT_CONTENT,
};

// Seed or load site-content.json
function loadContentFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (raw && raw.trim().startsWith('{')) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.warn('Error reading data/site-content.json, resetting to defaults:', err);
  }
  // Initialize with baseline data
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SITE_DATA, null, 2), 'utf-8');
  return DEFAULT_SITE_DATA;
}

// Save content atomically to disk (write to tmp file, then atomic rename)
function saveContentToDisk(data: any) {
  const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DATA_FILE);

  // Sync to src/data/siteContent.ts for permanent repo synchronization
  try {
    const tsCode = generateSiteContentTs(data);
    const tsPath = path.resolve(process.cwd(), 'src/data/siteContent.ts');
    fs.writeFileSync(tsPath, tsCode, 'utf-8');
  } catch (err) {
    console.warn('Warning syncing to src/data/siteContent.ts:', err);
  }

  contentVersion = Date.now().toString();
  broadcastUpdate(data, contentVersion);
  return contentVersion;
}

// Parse JSON bodies (up to 50MB for canvas snapshots and embedded data)
app.use(express.json({ limit: '50mb' }));

// Gracefully handle malformed JSON syntax errors in incoming request bodies
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Malformed JSON payload: please check body formatting.',
    });
    return;
  }
  next(err);
});

// 1. SSE Real-Time Stream Endpoint
app.get('/api/content/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send current state and version immediately upon connection
  const initialContent = loadContentFromDisk();
  res.write(`data: ${JSON.stringify({ type: 'init', version: contentVersion, timestamp: Date.now(), data: initialContent })}\n\n`);

  // Heartbeat ping every 25 seconds
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// 2. GET /api/content - Return live server content
app.get('/api/content', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const content = loadContentFromDisk();
  res.json({
    success: true,
    version: contentVersion,
    data: content,
  });
});

// 3. POST /api/content - Auto-save / Save content live to server
app.post('/api/content', (req: Request, res: Response) => {
  const authHeader = (req.headers['x-cms-auth'] as string) || req.body?.passcode;
  const isAuthorized =
    authHeader === 'sgs2026' || authHeader === 'sgs' || req.headers['x-cms-bypass'] === 'local';

  if (!isAuthorized) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid CMS passcode required (sgs2026).',
    });
    return;
  }

  const payload = req.body?.content || req.body?.data || req.body;
  if (!payload || typeof payload !== 'object' || !payload.hero || !payload.caseStudies) {
    res.status(400).json({
      success: false,
      error: 'Invalid payload: SiteData must contain hero, caseStudies, and configuration.',
    });
    return;
  }

  try {
    const updatedVersion = saveContentToDisk(payload);
    res.json({
      success: true,
      message: 'Successfully saved to server 24/7 live storage.',
      version: updatedVersion,
      savedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to persist content to server.',
    });
  }
});

// 4. Backwards compatible /api/save-content
app.post('/api/save-content', (req: Request, res: Response) => {
  if (req.body && typeof req.body.tsContent === 'string') {
    try {
      const targetPath = path.resolve(process.cwd(), 'src/data/siteContent.ts');
      fs.writeFileSync(targetPath, req.body.tsContent, 'utf-8');
      contentVersion = Date.now().toString();
      broadcastUpdate(loadContentFromDisk(), contentVersion);
      res.json({
        success: true,
        bytes: req.body.tsContent.length,
        message: 'Successfully written to src/data/siteContent.ts',
      });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
      return;
    }
  }

  if (req.body && req.body.data) {
    try {
      const v = saveContentToDisk(req.body.data);
      res.json({ success: true, version: v });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message });
      return;
    }
  }

  res.status(400).json({ success: false, error: 'Missing content in payload' });
});

// 5. Media Upload Handler (Streaming Binary & Base64 JSON)
app.post('/api/upload-media', (req: Request, res: Response) => {
  const customFileName = req.headers['x-file-name'] as string;

  // Case A: Binary stream upload with x-file-name
  if (customFileName) {
    const sanitized = customFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = path.join(UPLOADS_DIR, sanitized);
    const fileStream = fs.createWriteStream(targetPath);

    req.on('error', (err) => {
      fileStream.destroy();
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    fileStream.on('finish', () => {
      if (res.headersSent) return;
      const stats = fs.statSync(targetPath);
      res.json({
        success: true,
        url: `/assets/uploads/${sanitized}`,
        size: stats.size,
        name: sanitized,
      });
    });

    fileStream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    req.pipe(fileStream);
    return;
  }

  // Case B: JSON Base64 upload
  const data = req.body;
  if (data && (data.dataUrl || data.base64)) {
    try {
      const fileName = (data.fileName || `media-${Date.now()}.webp`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetPath = path.join(UPLOADS_DIR, fileName);

      let fileBuffer: Buffer;
      if (data.dataUrl && data.dataUrl.includes(';base64,')) {
        const base64Data = data.dataUrl.split(';base64,').pop();
        fileBuffer = Buffer.from(base64Data, 'base64');
      } else {
        fileBuffer = Buffer.from(data.base64, 'base64');
      }

      fs.writeFileSync(targetPath, fileBuffer);
      res.json({
        success: true,
        url: `/assets/uploads/${fileName}`,
        size: fileBuffer.length,
        name: fileName,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server upload error' });
    }
    return;
  }

  res.status(400).json({ success: false, error: 'No media file or base64 data provided' });
});

// 6. HTTP Range Video Streaming Middleware for /assets/uploads
app.use('/assets/uploads', (req: Request, res: Response, next: NextFunction) => {
  const fileName = path.basename((req.url || '').split('?')[0]);
  const filePath = path.join(UPLOADS_DIR, fileName);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain',
    };

    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.setHeader('Content-Length', stat.size);
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  next();
});

// Also serve other static files from public/assets
app.use('/assets', express.static(path.resolve(process.cwd(), 'public/assets')));

// 7. Mount Vite in Dev or Serve Static dist in Production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SGS Live Server] Running at http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
