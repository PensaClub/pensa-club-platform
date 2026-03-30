// Service Worker for Push Notifications — DigiBridge Community

self.addEventListener('push', (event) => {
  let data = { title: 'DigiBridge Общност', body: '', url: '/academy/community' };

  try {
    data = event.data.json();
  } catch (e) {
    data.body = event.data?.text() || '';
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/academy/community' },
    vibrate: [100, 50, 100],
    tag: 'forum-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = event.notification.data?.url || '/academy/community';
  const fullUrl = new URL(path, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(path) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(fullUrl);
    })
  );
});
