import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Set base path for GitHub Pages; local dev still serves from root
  base: process.env.NODE_ENV === 'production' ? '/mahjong-connect/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})