import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get API target from env or default
  const apiTarget = env.VITE_API_BASE_URL || 'https://omnichannel-staging.xontel.net'
  // Remove /api suffix if present for proxy target
  const proxyTarget = apiTarget.replace(/\/api\/?$/, '')

  return {
  base: '/web/',

  server: {
    description: 'Modern chat application with real-time messaging',
    theme_color: '#0f172a',
    background_color: '#020817',
  includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    host: '0.0.0.0', 
    port: 5173,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },

    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        ws: true, // proxy WebSocket connections (wss://localhost → wss://backend)
        secure: false,
      },
      '/media': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    // basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/web/', // Explicitly set base
      manifest: {
        name: 'Telsip Chat',
        short_name: 'Telsip',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/web/',
        start_url: '/web/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Force the service worker to use the /web/ prefix for scripts
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        importScripts: ['/web/sw-notifications.js'],
        navigateFallback: '/web/index.html',
        navigateFallbackAllowlist: [/^\/web\//],
        // importScripts: ['sw-notifications.js?v=2'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@app': path.resolve(__dirname, './src/app'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@store': path.resolve(__dirname, './src/store'),
      '@theme': path.resolve(__dirname, './src/theme'),
    },
  },
  } // close defineConfig callback
})