import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'path'

// Sentry plugin - only added when auth token is available
const sentryPlugin: PluginOption = process.env.SENTRY_AUTH_TOKEN
  ? sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
    })
  : null

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sentryPlugin,
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React - always needed
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          // Charts - only for /gielda and /dane sections
          if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs-2') || id.includes('node_modules/chartjs-plugin-datalabels')) {
            return 'vendor-charts';
          }
          // Maps - only for /mapa page
          if (id.includes('node_modules/mapbox-gl')) {
            return 'vendor-maps';
          }
          // Firebase - only for auth features
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
          // Animation - used throughout but can be separate
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // UI components
          if (id.includes('node_modules/radix-ui') || id.includes('node_modules/sonner') || id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://pollar.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
