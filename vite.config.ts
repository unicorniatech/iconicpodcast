import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy API requests to backend in development
        proxy: {
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
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
