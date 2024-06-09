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
        'defaults',  // Default browserslist configuration
        'not IE 11', // Exclude IE 11
        'iOS >= 10', // iOS 10 and above
        'last 2 versions', // Last 2 versions of all major browsers
        'Firefox ESR', // Firefox Extended Support Release
        '> 1%', // Browsers with more than 1% market share
        'maintained node versions', // Supported Node.js versions
        'Safari >= 10', // Safari 10 and above
        'Android >= 4.4', // Android 4.4 and above
        'Chrome >= 30', // Chrome 30 and above
        'Firefox >= 30', // Firefox 30 and above
        'Edge >= 15', // Edge 15 and above
        'Opera >= 20', // Opera 20 and above
        'Samsung >= 5' // Samsung browser 5 and above
      ],
    })
  ],
  build: {
    sourcemap: false,
  }
});
