import { useEffect, useCallback } from 'react';

const useNotifications = () => {
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    const sendNotification = useCallback((title, options = {}) => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return;
        }

        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/vite.svg',
                ...options
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new Notification(title, {
                        icon: '/vite.svg',
                        ...options
                    });
                }
            });
        }
    }, []);

    return { sendNotification };
};

export default useNotifications;
