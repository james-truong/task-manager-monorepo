import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configure dev server for SPA routing
  server: {
    // Fallback to index.html for any route that doesn't match a file
    // This allows React Router to handle all routes during development
    historyApiFallback: true
  },
  // Configure preview server (npm run preview) for SPA routing
  preview: {
    historyApiFallback: true
  },
  // Configure Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true
  }
})
