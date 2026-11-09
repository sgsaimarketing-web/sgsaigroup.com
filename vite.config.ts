import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function cmsBackendPlugin(): Plugin {
  return {
    name: 'cms-backend-plugin',
    configureServer(server) {
      // 1. Save Content to src/data/siteContent.ts
      server.middlewares.use('/api/save-content', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ available: true, path: 'src/data/siteContent.ts' }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (typeof data.tsContent === 'string' && data.tsContent.trim().length > 0) {
                const targetPath = path.resolve(import.meta.dirname, 'src/data/siteContent.ts');
                fs.writeFileSync(targetPath, data.tsContent, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    bytes: data.tsContent.length,
                    message: 'Successfully written to src/data/siteContent.ts',
                  })
                );
                return;
              }
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Missing tsContent in payload' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });

      // 2. Upload Media to /public/assets/uploads/ for public visitor streaming
      server.middlewares.use('/api/upload-media', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ available: true, uploadDir: '/public/assets/uploads' }));
          return;
        }

        if (req.method === 'POST') {
          const targetDir = path.resolve(import.meta.dirname, 'public/assets/uploads');
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          // Case A: Stream binary file (videos, raw uploads with x-file-name)
          const customFileName = req.headers['x-file-name'] as string;
          if (customFileName) {
            const sanitized = customFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
            const targetPath = path.join(targetDir, sanitized);
            const fileStream = fs.createWriteStream(targetPath);

            req.on('error', (err) => {
              fileStream.destroy();
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });

            req.on('aborted', () => {
              fileStream.destroy();
            });

            fileStream.on('finish', () => {
              if (res.headersSent) return;
              const stats = fs.statSync(targetPath);
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  url: `/assets/uploads/${sanitized}`,
                  size: stats.size,
                  name: sanitized,
                })
              );
            });

            fileStream.on('error', (err) => {
              if (res.headersSent) return;
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            });

            req.pipe(fileStream);
            return;
          }

          // Case B: JSON payload (Base64 dataUrls, snapshots, canvas WebP posters)
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const fileName = (data.fileName || `media-${Date.now()}.webp`).replace(/[^a-zA-Z0-9._-]/g, '_');
              const targetPath = path.join(targetDir, fileName);

              let fileBuffer: Buffer;
              if (data.dataUrl && data.dataUrl.includes(';base64,')) {
                const base64Data = data.dataUrl.split(';base64,').pop();
                fileBuffer = Buffer.from(base64Data, 'base64');
              } else if (data.base64) {
                fileBuffer = Buffer.from(data.base64, 'base64');
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Missing dataUrl or base64 data' }));
                return;
              }

              fs.writeFileSync(targetPath, fileBuffer);
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  url: `/assets/uploads/${fileName}`,
                  size: fileBuffer.length,
                  name: fileName,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server upload error' }));
            }
          });
          return;
        }

        next();
      });

      // 3. Serve /assets/uploads static files with HTTP Range (seeking) support
      server.middlewares.use('/assets/uploads', (req, res, next) => {
        const targetDir = path.resolve(import.meta.dirname, 'public/assets/uploads');
        const fileName = path.basename((req.url || '').split('?')[0]);
        const filePath = path.join(targetDir, fileName);

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
            res.statusCode = 206;
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
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cmsBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
