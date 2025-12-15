import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import { PODCAST_EPISODES, SITE_URL } from './constants';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Only enable proxy if VITE_API_URL is explicitly set
    const proxyConfig = env.VITE_API_URL ? {
      '/api': {
        target: env.VITE_API_URL,
        changeOrigin: true,
      }
    } : undefined;
    
    const hostname = SITE_URL;

    const staticRoutes = [
      '/',
      '/episodes',
      '/contact',
      '/faq',
      '/about',
      '/youtube',
      '/instagram',
      '/social',
    ];

    const episodeRoutes = PODCAST_EPISODES.map((episode) => `/episodes/${episode.id}`);

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy API requests to backend in development (only if configured)
        proxy: proxyConfig
      },
      plugins: [
        react(),
        sitemap({
          hostname,
          dynamicRoutes: [...staticRoutes, ...episodeRoutes],
        }),
      ],
      build: {
        // Increase default 500 KiB warning threshold to reduce noisy warnings in CI/hosting logs
        chunkSizeWarningLimit: 1500,
      },
      // NOTE: API keys are NO LONGER injected into the frontend bundle
      // All sensitive keys (GEMINI_API_KEY) must be accessed server-side only
      // Use VITE_* prefixed env vars for public config only
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
