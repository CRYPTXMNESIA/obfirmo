/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// Precache only essential assets
precacheAndRoute(self.__WB_MANIFEST.filter(asset => !asset.url.endsWith('.map')));

// App Shell-style routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// CacheFirst strategy for static assets
registerRoute(
  ({ url }) => url.origin === self.location.origin && /\.(?:png|jpg|jpeg|svg|gif|css|js)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100 }),
    ],
  })
);

// StaleWhileRevalidate strategy for API requests or other dynamic content
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.json'),
  new StaleWhileRevalidate({
    cacheName: 'dynamic-content',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Allow skipWaiting via message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Additional custom service worker logic can go here
