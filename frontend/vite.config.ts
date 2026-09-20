import { fileURLToPath } from 'url'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawTarget = env.VITE_API_BACKEND_URL || env.VITE_API_BASE_URL || 'http://localhost:3001'
  const backendTarget = rawTarget.replace(/\/+$/, '')

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
      proxy: {
        '/auth': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/vehicles': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/incidents': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/shipments': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/roads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/routes': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/alerts': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/weather': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/kpis': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/snapshot': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/demo': {
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
    },
  }
})
