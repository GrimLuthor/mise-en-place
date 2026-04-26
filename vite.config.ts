import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/mise-en-place/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mise en Place',
        short_name: 'Mise en Place',
        description: 'Personal recipe gallery',
        theme_color: '#10b981',
        background_color: '#10b981',
        display: 'standalone',
        start_url: '/mise-en-place/',
        scope: '/mise-en-place/',
        icons: [
          { src: '/mise-en-place/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/mise-en-place/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/mise-en-place/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/mise-en-place/index.html',
      },
    }),
  ],
})
