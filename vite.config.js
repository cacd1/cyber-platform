import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      },
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'قسم أمن المعلومات - University of Babylon',
        short_name: 'Cyber Sec',
        description: 'Official learning platform for First Year Cybersecurity Students',
        theme_color: '#0a0f1c',
        background_color: '#0a0f1c',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.png',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/png'
          },
          {
            src: 'favicon.png', // Ideally should be 192x192, using favicon for now as placeholder if user hasn't provided one
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon.png', // Ideally should be 512x512
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/app-check'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
