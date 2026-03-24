/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL('/')));

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { title: 'Life Sync', body: event.data.text() };
    }

    const title = payload.title || 'Life Sync Reminder';
    const options = {
        body: payload.body || 'You have an upcoming event.',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        data: {
            url: '/',
            ...payload,
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil((async () => {
        const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        const sameClient = allClients.find((client) => client.url.includes(self.location.origin));

        if (sameClient) {
            await sameClient.focus();
            await sameClient.navigate(targetUrl);
            return;
        }

        await clients.openWindow(targetUrl);
    })());
});
