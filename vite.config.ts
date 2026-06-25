import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function serverlessApiPlugin() {
  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = parsedUrl.pathname;
          // Get the filename (e.g., /api/farmers -> farmers)
          const endpoint = pathname.replace(/^\/api\//, '').split('/')[0];

          const apiDir = path.resolve(__dirname, './api');
          const fileCandidates = [`${endpoint}.ts`, `${endpoint}.js`].map(f => path.join(apiDir, f));
          const actualFile = fileCandidates.find(f => fs.existsSync(f));

          if (!actualFile) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `API endpoint ${endpoint} not found` }));
            return;
          }

          // Parse body for write methods
          let body = null;
          if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString();
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch (e) {
                body = rawBody;
              }
            }
          }

          // Parse query params
          const query = {};
          parsedUrl.searchParams.forEach((value, key) => {
            query[key] = value;
          });

          // Augment Request object
          const extendedReq = req;
          extendedReq.query = query;
          extendedReq.body = body;

          // Augment Response object
          const extendedRes = res;
          extendedRes.status = (code) => {
            res.statusCode = code;
            return extendedRes;
          };
          extendedRes.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          extendedRes.send = (data) => {
            if (typeof data === 'object') {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } else {
              res.end(data);
            }
          };

          // Load typescript handler via Vite's module loader
          const module = await server.ssrLoadModule(actualFile);
          if (typeof module.default === 'function') {
            await module.default(extendedReq, extendedRes);
          } else {
            throw new Error(`Default export not found in API module ${endpoint}`);
          }
        } catch (err) {
          console.error(`Error handling API request ${req.url}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    }
  }
}

export default defineConfig(({ mode }) => {
  // Load .env files and populate process.env for node functions
  const env = loadEnv(mode, process.cwd(), '');
  for (const key in env) {
    process.env[key] = env[key];
  }

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
      serverlessApiPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      },
    },
    server: {
      allowedHosts: true,
      host: '127.0.0.1',
      hmr: {
        protocol: 'wss',
        clientPort: 443,
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
