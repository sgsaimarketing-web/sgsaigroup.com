import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function excludeNonPublicAssetsPlugin(): Plugin {
  return {
    name: 'exclude-non-public-assets',
    apply: 'build',
    closeBundle() {
      const rootDir = import.meta.dirname;
      const distDir = path.resolve(rootDir, 'dist');

      // 1. Never ship internal AI Studio prompt/diagnostic screenshots in production dist/
      const distAiStudioDir = path.resolve(distDir, 'assets', 'aistudio');
      if (fs.existsSync(distAiStudioDir)) {
        fs.rmSync(distAiStudioDir, { recursive: true, force: true });
      }

      // 2. Strip unreferenced local upload debug PNGs from production dist/
      const distUploadsDir = path.resolve(distDir, 'assets', 'uploads');
      if (fs.existsSync(distUploadsDir)) {
        const siteContentPath = path.resolve(rootDir, 'src', 'data', 'siteContent.ts');
        const dataJsonPath = path.resolve(rootDir, 'data', 'site-content.json');
        const combinedRefs =
          (fs.existsSync(siteContentPath) ? fs.readFileSync(siteContentPath, 'utf8') : '') +
          (fs.existsSync(dataJsonPath) ? fs.readFileSync(dataJsonPath, 'utf8') : '');

        for (const entry of fs.readdirSync(distUploadsDir)) {
          if (!combinedRefs.includes(`/assets/uploads/${entry}`)) {
            fs.rmSync(path.resolve(distUploadsDir, entry), { recursive: true, force: true });
          }
        }

        if (fs.readdirSync(distUploadsDir).length === 0) {
          fs.rmdirSync(distUploadsDir);
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), excludeNonPublicAssetsPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/motion')) {
              return 'vendor-ui';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            return undefined;
          },
        },
      },
    },
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
