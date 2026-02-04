import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - always needed
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts - only for /gielda and /dane sections
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'chartjs-plugin-datalabels'],
          // Maps - only for /mapa page
          'vendor-maps': ['mapbox-gl'],
          // Firebase - only for auth features
          'vendor-firebase': ['firebase'],
          // Animation - used throughout but can be separate
          'vendor-motion': ['framer-motion'],
          // UI components
          'vendor-ui': ['radix-ui', 'sonner', 'lucide-react'],
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
