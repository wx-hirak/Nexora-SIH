import { fileURLToPath } from 'url'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawTarget =
    env.VITE_API_URL ||
    env.VITE_API_BACKEND_URL ||
    env.VITE_API_BASE_URL ||
    'http://localhost:3001'
  const backendTarget = rawTarget.replace(/\/+$/, '')

  const apiProxy = {
    '/auth': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
    },
    '/shipments': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
    },
    '/vehicles': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
    },
    '/routes': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
    },
    '/incidents': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
    },
    '/api': {
      target: backendTarget,
      changeOrigin: true,
      secure: false,
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: apiProxy,
    },
    preview: {
      port: 4173,
      proxy: apiProxy,
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('leaflet')) {
                return 'vendor-leaflet';
              }
              if (id.includes('@tanstack') || id.includes('axios') || id.includes('zustand')) {
                return 'vendor-query';
              }
            }
          },
        },
      },
    },
  }
})
