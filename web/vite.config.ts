import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@flashcard-rpg/shared': path.resolve(__dirname, '../shared/src'),
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    // This ensures environment variables work in the browser
    'process.env': {}
  },
  server: {
    port: 3000,
    open: true
  }
})