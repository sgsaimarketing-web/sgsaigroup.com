import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
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
const ENV_CMS_PASSCODE = (process.env.CMS_PASSCODE || '').trim();
const SESSION_SECRET =
  (process.env.CMS_SESSION_SECRET || '').trim() || crypto.randomBytes(32).toString('hex');
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB limit
const ALLOWED_UPLOAD_EXTS = new Set([
  '.mp4',
  '.webm',
  '.mov',
  '.webp',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
]);

// Ensure required directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-content.json');
const ADMIN_CREDENTIAL_FILE = path.join(DATA_DIR, 'cms-admin.json');
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

interface StoredAdminCredential {
  salt: string;
  hash: string;
  updatedAt: string;
}

function readStoredAdminCredential(): StoredAdminCredential | null {
  try {
    if (!fs.existsSync(ADMIN_CREDENTIAL_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(ADMIN_CREDENTIAL_FILE, 'utf-8'));
    if (typeof raw?.salt === 'string' && typeof raw?.hash === 'string') {
      return raw as StoredAdminCredential;
    }
  } catch {
    // ignore malformed credential file
  }
  return null;
}

function getServerAuthMode(): 'env' | 'claimed' | 'setup_required' {
  if (ENV_CMS_PASSCODE.length > 0) return 'env';
  if (readStoredAdminCredential()) return 'claimed';
  return 'setup_required';
}

function hashPasscodeScrypt(passcode: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derived };
}

function verifyPasscodeInput(candidate: string): boolean {
  const trimmed = candidate.trim();
  if (!trimmed) return false;

  if (ENV_CMS_PASSCODE.length > 0) {
    const a = crypto.createHash('sha256').update(trimmed).digest();
    const b = crypto.createHash('sha256').update(ENV_CMS_PASSCODE).digest();
    return crypto.timingSafeEqual(a, b);
  }

  const stored = readStoredAdminCredential();
  if (!stored) return false;

  const derived = crypto.scryptSync(trimmed, stored.salt, 64);
  const expected = Buffer.from(stored.hash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function issueSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + SESSION_TTL_MS }),
    'utf-8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return parsed?.role === 'admin' && typeof parsed?.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function isAuthorizedCmsRequest(req: Request): boolean {
  const authHeader =
    typeof req.headers.authorization === 'string' ? req.headers.authorization.trim() : '';
  if (authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifySessionToken(bearerToken)) return true;
  }

  const headerToken =
    typeof req.headers['x-cms-auth'] === 'string' ? req.headers['x-cms-auth'].trim() : '';
  if (headerToken && (verifySessionToken(headerToken) || verifyPasscodeInput(headerToken))) {
    return true;
  }

  return false;
}

function requireCmsAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthorizedCmsRequest(req)) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid CMS admin session required.',
    });
    return;
  }
  next();
}

function broadcastUpdate(data: unknown, version: string) {
  const payload = `data: ${JSON.stringify({ type: 'content_update', version, timestamp: Date.now(), data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function atomicWriteFileSync(targetPath: string, content: string | Buffer): void {
  const tempPath = `${targetPath}.tmp.${process.pid}.${Date.now()}`;
  fs.writeFileSync(tempPath, content);
  fs.renameSync(tempPath, targetPath);
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
  atomicWriteFileSync(DATA_FILE, JSON.stringify(DEFAULT_SITE_DATA, null, 2));
  return DEFAULT_SITE_DATA;
}

// Save content atomically to disk
function saveContentToDisk(data: any) {
  atomicWriteFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  // Sync atomically to src/data/siteContent.ts for permanent repository parity
  try {
    const tsCode = generateSiteContentTs(data);
    const tsPath = path.resolve(process.cwd(), 'src/data/siteContent.ts');
    atomicWriteFileSync(tsPath, tsCode);
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

function normalizePublicSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === 'https:' &&
      /^[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(parsed.hostname)
    ) {
      return parsed.origin;
    }
    if (parsed.protocol === 'https:' && parsed.hostname === 'supabase.com') {
      const match = parsed.pathname.match(/^\/dashboard\/project\/([a-z0-9-]+)/i);
      if (match?.[1]) {
        return `https://${match[1]}.supabase.co`;
      }
    }
  } catch {
    // ignore
  }
  return trimmed;
}

// 0. Public Client Config (only scoped browser-safe Supabase URL/Anon Key, never secrets)
app.get('/api/public-config', (_req: Request, res: Response) => {
  const supabaseUrl = normalizePublicSupabaseUrl(
    process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      ''
  );
  const supabaseAnonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    success: true,
    supabaseUrl,
    supabaseAnonKey,
    serverAuthMode: getServerAuthMode(),
  });
});

// 0b. Local Express Admin Auth Endpoints (used when Supabase is not configured)
app.get('/api/auth/status', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    success: true,
    mode: getServerAuthMode(),
    authenticated: isAuthorizedCmsRequest(req),
  });
});

app.post('/api/auth/setup', (req: Request, res: Response) => {
  const currentMode = getServerAuthMode();
  if (currentMode !== 'setup_required') {
    res.status(409).json({
      success: false,
      mode: currentMode,
      error: 'Admin passcode is already configured. Please enter your passcode to sign in.',
    });
    return;
  }

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (passcode.length < 6) {
    res.status(400).json({
      success: false,
      error: 'Please choose an admin passcode with at least 6 characters.',
    });
    return;
  }

  try {
    const { salt, hash } = hashPasscodeScrypt(passcode);
    atomicWriteFileSync(
      ADMIN_CREDENTIAL_FILE,
      JSON.stringify({ salt, hash, updatedAt: new Date().toISOString() }, null, 2)
    );
    const token = issueSessionToken();
    res.json({
      success: true,
      token,
      mode: 'claimed',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to store admin credentials.',
    });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const mode = getServerAuthMode();
  if (mode === 'setup_required') {
    res.status(400).json({
      success: false,
      mode,
      error: 'No admin passcode configured yet. Complete initial setup first.',
    });
    return;
  }

  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
  if (!verifyPasscodeInput(passcode)) {
    res.status(401).json({
      success: false,
      error: 'Invalid administrator passcode.',
    });
    return;
  }

  const token = issueSessionToken();
  res.json({
    success: true,
    token,
    mode,
  });
});

// 1. SSE Real-Time Stream Endpoint
app.get('/api/content/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  const initialContent = loadContentFromDisk();
  res.write(`data: ${JSON.stringify({ type: 'init', version: contentVersion, timestamp: Date.now(), data: initialContent })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
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

// 3. POST /api/content - Protected live CMS persistence
app.post('/api/content', requireCmsAuth, (req: Request, res: Response) => {
  const payload = req.body?.content || req.body?.data || req.body;
  if (!payload || typeof payload !== 'object' || !payload.hero || !Array.isArray(payload.caseStudies)) {
    res.status(400).json({
      success: false,
      error: 'Invalid payload: SiteData must contain hero and caseStudies array.',
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

// 4. Protected Codebase Save Endpoint
app.post('/api/save-content', requireCmsAuth, (req: Request, res: Response) => {
  if (req.body && typeof req.body.tsContent === 'string') {
    if (!req.body.tsContent.includes('export const CASE_STUDIES')) {
      res.status(400).json({ success: false, error: 'Invalid siteContent.ts payload.' });
      return;
    }
    try {
      const targetPath = path.resolve(process.cwd(), 'src/data/siteContent.ts');
      atomicWriteFileSync(targetPath, req.body.tsContent);
      contentVersion = Date.now().toString();
      broadcastUpdate(loadContentFromDisk(), contentVersion);
      res.json({
        success: true,
        bytes: req.body.tsContent.length,
        message: 'Successfully written to src/data/siteContent.ts',
      });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to save TypeScript content.' });
      return;
    }
  }

  if (req.body && req.body.data && typeof req.body.data === 'object') {
    try {
      const v = saveContentToDisk(req.body.data);
      res.json({ success: true, version: v });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Failed to save data payload.' });
      return;
    }
  }

  res.status(400).json({ success: false, error: 'Missing valid content in payload.' });
});

// 5. Protected & Allowlist-Validated Media Upload Handler
app.post('/api/upload-media', requireCmsAuth, (req: Request, res: Response) => {
  const customFileName = typeof req.headers['x-file-name'] === 'string' ? req.headers['x-file-name'] : '';

  // Case A: Binary stream upload with x-file-name
  if (customFileName) {
    const sanitized = path.basename(customFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitized).toLowerCase();
    if (!ALLOWED_UPLOAD_EXTS.has(ext)) {
      res.status(400).json({
        success: false,
        error: `Unsupported file extension "${ext}". Allowed: image/video formats only.`,
      });
      return;
    }

    const targetPath = path.resolve(UPLOADS_DIR, sanitized);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ success: false, error: 'Invalid upload file path.' });
      return;
    }
    const fileStream = fs.createWriteStream(targetPath);
    let receivedBytes = 0;
    let aborted = false;

    req.on('data', (chunk: Buffer) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_UPLOAD_BYTES && !aborted) {
        aborted = true;
        req.unpipe(fileStream);
        fileStream.destroy();
        fs.unlink(targetPath, () => {});
        if (!res.headersSent) {
          res.status(413).json({ success: false, error: 'Upload exceeds 50MB maximum limit.' });
        }
      }
    });

    req.on('error', (err) => {
      fileStream.destroy();
      fs.unlink(targetPath, () => {});
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    fileStream.on('finish', () => {
      if (aborted || res.headersSent) return;
      try {
        const stats = fs.statSync(targetPath);
        res.json({
          success: true,
          url: `/assets/uploads/${sanitized}`,
          size: stats.size,
          name: sanitized,
        });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err?.message || 'Upload stat failed.' });
      }
    });

    fileStream.on('error', (err) => {
      fs.unlink(targetPath, () => {});
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
      const rawName = typeof data.fileName === 'string' ? data.fileName : `media-${Date.now()}.webp`;
      const sanitized = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const ext = path.extname(sanitized).toLowerCase();
      if (!ALLOWED_UPLOAD_EXTS.has(ext)) {
        res.status(400).json({
          success: false,
          error: `Unsupported file extension "${ext}".`,
        });
        return;
      }

      const targetPath = path.resolve(UPLOADS_DIR, sanitized);
      if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
        res.status(400).json({ success: false, error: 'Invalid upload file path.' });
        return;
      }
      let fileBuffer: Buffer;
      if (typeof data.dataUrl === 'string' && data.dataUrl.includes(';base64,')) {
        const base64Data = data.dataUrl.split(';base64,').pop() || '';
        fileBuffer = Buffer.from(base64Data, 'base64');
      } else {
        fileBuffer = Buffer.from(String(data.base64 || ''), 'base64');
      }

      if (fileBuffer.length === 0 || fileBuffer.length > MAX_UPLOAD_BYTES) {
        res.status(400).json({ success: false, error: 'Invalid or oversized media payload.' });
        return;
      }

      atomicWriteFileSync(targetPath, fileBuffer);
      res.json({
        success: true,
        url: `/assets/uploads/${sanitized}`,
        size: fileBuffer.length,
        name: sanitized,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server upload error' });
    }
    return;
  }

  res.status(400).json({ success: false, error: 'No media file or base64 data provided' });
});

// 6. Bounds-Checked HTTP Range Video Streaming Middleware for /assets/uploads
app.use('/assets/uploads', (req: Request, res: Response, next: NextFunction) => {
  const fileName = path.basename((req.url || '').split('?')[0]);
  const filePath = path.resolve(UPLOADS_DIR, fileName);

  if (
    filePath.startsWith(UPLOADS_DIR + path.sep) &&
    fs.existsSync(filePath) &&
    fs.statSync(filePath).isFile()
  ) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
    };

    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');

    const stat = fs.statSync(filePath);
    const total = stat.size;
    const range = req.headers.range;

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!match) {
        res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
        return;
      }

      let start = match[1] ? parseInt(match[1], 10) : NaN;
      let end = match[2] ? parseInt(match[2], 10) : NaN;

      if (Number.isNaN(start) && !Number.isNaN(end)) {
        // Suffix byte range: bytes=-500
        start = Math.max(0, total - end);
        end = total - 1;
      } else if (!Number.isNaN(start) && Number.isNaN(end)) {
        end = total - 1;
      }

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 0 ||
        end >= total ||
        start > end
      ) {
        res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
        return;
      }

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
      res.setHeader('Content-Length', end - start + 1);
      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', () => {
        if (!res.headersSent) res.status(500).end();
        else res.end();
      });
      stream.pipe(res);
      return;
    }

    res.setHeader('Content-Length', total);
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).end();
      else res.end();
    });
    stream.pipe(res);
    return;
  }

  next();
});

// Serve other static files from public/assets
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
