// public/web-push-sw.js

self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { body: event.data.text() };
        }
    }

    const title = data.title || '🔔 Notifikasi Baru';
    const body = data.body || 'Anda mendapat pesan baru.';
    const url = data.url || '/admin';

    const options = {
        body: body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        data: {
            url: url
        },
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const clickUrl = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Jika ada tab dashboard admin yang sudah terbuka, gunakan tab itu
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('/admin') && 'focus' in client) {
                    client.navigate(clickUrl);
                    return client.focus();
                }
            }
            // Jika tidak ada tab terbuka, buka tab baru
            if (clients.openWindow) {
                return clients.openWindow(clickUrl);
            }
        })
    );
});
