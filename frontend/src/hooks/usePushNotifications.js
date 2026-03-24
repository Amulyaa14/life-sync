import { useEffect, useState } from 'react';
import api from '../api/axios';
import useNotifications from './useNotifications';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};

const usePushNotifications = (enabled) => {
    const { requestPermission } = useNotifications();
    const [isPushActive, setIsPushActive] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const syncSubscription = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
                if (!isCancelled) setIsPushActive(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (!enabled) {
                if (existingSubscription) {
                    await api.delete('/notifications/subscription', {
                        data: { endpoint: existingSubscription.endpoint },
                    });

                    await existingSubscription.unsubscribe();
                }

                if (!isCancelled) setIsPushActive(false);
                return;
            }

            const permission = await requestPermission();
            if (permission !== 'granted') {
                if (!isCancelled) setIsPushActive(false);
                return;
            }

            let publicKey = null;
            try {
                const { data } = await api.get('/notifications/public-key');
                publicKey = data.publicKey;
            } catch {
                if (!isCancelled) setIsPushActive(false);
                return;
            }

            if (!publicKey) {
                if (!isCancelled) setIsPushActive(false);
                return;
            }

            const subscription = existingSubscription || await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            await api.post('/notifications/subscription', { subscription });

            if (!isCancelled) setIsPushActive(true);
        };

        syncSubscription().catch((error) => {
            console.error('Push sync failed:', error);
            if (!isCancelled) setIsPushActive(false);
        });

        return () => {
            isCancelled = true;
        };
    }, [enabled, requestPermission]);

    return isPushActive;
};

export default usePushNotifications;
