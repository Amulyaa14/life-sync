import { useEffect, useCallback } from 'react';

const useNotifications = () => {
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return 'unsupported';
        if (Notification.permission === 'granted') return 'granted';
        if (Notification.permission === 'denied') return 'denied';
        return Notification.requestPermission();
    }, []);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    const sendNotification = useCallback(async (title, options = {}) => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return;
        }

        const permission = Notification.permission === 'default'
            ? await requestPermission()
            : Notification.permission;

        if (permission !== 'granted') return;

        const notificationOptions = {
            icon: '/icons/icon-192.svg',
            badge: '/icons/icon-192.svg',
            ...options,
        };

        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.showNotification(title, notificationOptions);
                return;
            }
        }

        new Notification(title, notificationOptions);
    }, [requestPermission]);

    return { sendNotification, requestPermission };
};

export default useNotifications;
