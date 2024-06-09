import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteObfuscateFile } from 'vite-plugin-obfuscator';

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
    })
  ],
  build: {
    sourcemap: false,
  }
});
