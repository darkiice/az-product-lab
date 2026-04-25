// Mileo service worker — minimal, just enough to support
// background notifications and a click handler that opens the app.

const SW_VERSION = 'mileo-sw-v1';

self.addEventListener('install', (event) => {
  // Activate immediately so the page can use this SW on first load.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Bring the user back to Mileo when they tap a notification.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL('Mileo.html', self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('Mileo.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// If a push provider ever sends one (server push not configured here, but
// future-proofing), display a generic "Mileo wants you" notification.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || 'Mileo wants you 🦙';
  const body = data.body || 'Time to lace up — your plan is waiting.';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: 'mileo-icon-512.png',
      badge: 'mileo-icon-192.png',
      tag: 'mileo-daily',
      renotify: true
    })
  );
});
