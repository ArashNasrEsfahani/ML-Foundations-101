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
 * Not part of the production build (Vercel/offline use localStorage only).
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

export default defineConfig({
  base: './',
  plugins: [react(), saveServer(), viteSingleFile()],
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
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 8000,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
  },
} as never);
