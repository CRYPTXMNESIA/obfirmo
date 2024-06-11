import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteObfuscateFile } from 'vite-plugin-obfuscator';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Obfirmo',
        short_name: 'Obfirmo',
        description: 'Obfirmo: Minimalistic Password Management',
        theme_color: '#0b0d11',
        background_color: '#0b0d11',
        display: 'standalone',
        icons: [
          {
            src: '/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true
      }
    }),
    viteObfuscateFile({
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      debugProtection: true,
      sourceMap: false,
      disableConsoleOutput: true,
      stringArray: true,
      rotateStringArray: true
    }),
    legacy({
      targets: [
        'defaults',
        'not IE 11',
        'iOS >= 10',
        'last 2 versions',
        'Firefox ESR',
        '> 1%',
        'maintained node versions',
        'Safari >= 10',
        'Android >= 4.4',
        'Chrome >= 30',
        'Firefox >= 30',
        'Edge >= 15',
        'Opera >= 20',
        'Samsung >= 5'
      ],
    })
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@vitejs/plugin-legacy', 'vite-plugin-obfuscator'],
  },
});
