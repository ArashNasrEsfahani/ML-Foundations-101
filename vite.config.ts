import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'node:fs';
import path from 'node:path';

const SAVE_ROUTE = '/__ml101_save';

/**
 * Dev-only save mirror. localStorage is scoped per exact origin, so a changed
 * port or cleared browser data reads as lost progress. This keeps a copy in
 * .ml101-save.json beside the project, which the app reconciles on boot.
 * Not part of any production build (hosted/offline use localStorage only).
 */
function saveServer(): Plugin {
  const file = path.resolve(process.cwd(), '.ml101-save.json');
  return {
    name: 'ml101-save-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(SAVE_ROUTE, (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('content-type', 'application/json');
          res.setHeader('cache-control', 'no-store');
          try {
            res.end(fs.readFileSync(file, 'utf8'));
          } catch {
            // no save on disk yet — a normal state, not an error worth logging
            res.end('null');
          }
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 5_000_000) req.destroy();
          });
          req.on('end', () => {
            try {
              JSON.parse(body);
              fs.writeFileSync(file, body, 'utf8');
              res.statusCode = 204;
            } catch {
              res.statusCode = 400;
            }
            res.end();
          });
          return;
        }
        res.statusCode = 405;
        res.end();
      });
    },
  };
}

/**
 * Two build targets:
 *
 *   vite build                  → dist/         normal split assets, for hosting
 *   vite build --mode offline   → dist-offline/ one self-contained index.html
 *
 * Hosting wants separate, content-hashed files so the browser can cache them
 * between visits; the offline copy wants everything inlined so it runs from a
 * double-click. Inlining ~3.5 MB into the HTML would defeat caching entirely on
 * a real deploy, which is why single-file is opt-in rather than the default.
 */
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';

  return {
    // relative base keeps the offline file working from file:// — and is
    // harmless when hosted, because routing is hash-based
    base: './',
    plugins: [react(), saveServer(), ...(offline ? [viteSingleFile()] : [])],
    server: {
      // dual-stack: this machine resolves `localhost` to ::1, while 127.0.0.1 is
      // IPv4 — binding only one of them makes the app unreachable at the other,
      // and each address is a separate localStorage origin.
      host: '::',
      port: 5173,
      // never drift to another port: the origin change would orphan localStorage
      strictPort: true,
    },
    preview: { host: '::', port: 4173, strictPort: true },
    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      // offline: inline everything. hosted: keep images as cacheable files.
      assetsInlineLimit: offline ? 100_000_000 : 4096,
      chunkSizeWarningLimit: 8000,
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.spec.ts'],
    },
  };
}) as never;
