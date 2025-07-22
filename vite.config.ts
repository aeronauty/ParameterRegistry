import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for GitLab Pages
  build: {
    outDir: 'dist', // Build to dist directory
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large libraries into their own chunks
          vendor: ['react', 'react-dom'],
          plotly: ['plotly.js', 'react-plotly.js'],
          grid: ['ag-grid-community', 'ag-grid-react'],
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit for plotly.js
  },
  server: {
    port: 3000,
  },
  publicDir: 'public' // Keep data files in public directory
})
