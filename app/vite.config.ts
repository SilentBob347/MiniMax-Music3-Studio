import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/v1': {
          target: 'http://127.0.0.1:8765',
          changeOrigin: true,
        },
        '/setup': {
          target: 'http://127.0.0.1:8765',
          changeOrigin: true,
        },
        '/engine': {
          target: 'http://127.0.0.1:8765',
          changeOrigin: true,
        },
        '/health': {
          target: 'http://127.0.0.1:8765',
          changeOrigin: true,
        },
        '/mcp': {
          target: 'http://127.0.0.1:8765',
          changeOrigin: true,
        },
        // There is deliberately no proxy for the retired ACE Node service:
        // the studio talks to the native Rust server only, so a stray legacy
        // request fails loudly in development instead of silently 500-ing.
      },
    },
    build: {
      // Tailwind's palette is oklch(); WebView2 before 111 (the last one for
      // Windows 7 and 8.1 is 109) drops those colours and every surface turns
      // transparent. Lightning CSS writes a plain colour first for it.
      cssTarget: 'chrome100',
      cssMinify: 'lightningcss',
      rollupOptions: {
        // the visualiser's own window is a second page
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          visualizer: path.resolve(import.meta.dirname, 'visualizer.html'),
        },
      },
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      }
    }
  };
});
