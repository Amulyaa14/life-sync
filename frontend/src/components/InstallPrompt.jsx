import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'lifeSyncInstallPromptDismissedAt';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;
const INSTALL_READY_EVENT = 'lifesync-install-ready';

let cachedInstallPrompt = null;

if (typeof window !== 'undefined' && !window.__lifeSyncInstallListenerAttached) {
    window.__lifeSyncInstallListenerAttached = true;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        cachedInstallPrompt = event;
        window.dispatchEvent(new Event(INSTALL_READY_EVENT));
    });
}

const isStandaloneMode = () => {
    const displayStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = window.navigator && window.navigator.standalone === true;
    return displayStandalone || iosStandalone;
};

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(cachedInstallPrompt);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setIsInstalled(isStandaloneMode());

        const lastDismissedAt = Number.parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
        if (!Number.isNaN(lastDismissedAt) && Date.now() - lastDismissedAt < DISMISS_TTL_MS) {
            setDismissed(true);
        }

        const handleInstallReady = () => {
            if (cachedInstallPrompt) {
                setDeferredPrompt(cachedInstallPrompt);
            }
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            cachedInstallPrompt = null;
            localStorage.removeItem(DISMISS_KEY);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setIsInstalled(isStandaloneMode());
            }
        };

        window.addEventListener(INSTALL_READY_EVENT, handleInstallReady);
        window.addEventListener('appinstalled', handleInstalled);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener(INSTALL_READY_EVENT, handleInstallReady);
            window.removeEventListener('appinstalled', handleInstalled);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const dismissPrompt = () => {
        setDismissed(true);
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
    };

    const onInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        cachedInstallPrompt = null;
    };

    if (isInstalled || dismissed) return null;
    if (!deferredPrompt) return null;

    return (
        <div className="fixed left-4 right-4 bottom-24 md:bottom-6 md:left-auto md:right-6 z-[70] pointer-events-auto max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                        <Download size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-text">Install Life Sync</h3>
                        <p className="text-sm text-text-muted">Install in one click and open Life Sync like a native app.</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="p-1 rounded-md text-text-muted hover:text-text"
                    aria-label="Dismiss install prompt"
                    onClick={dismissPrompt}
                >
                    <X size={16} />
                </button>
            </div>

            <button
                type="button"
                className="mt-4 w-full bg-primary-600 enabled:hover:bg-primary-700 text-white rounded-xl py-2.5 font-medium"
                onClick={onInstall}
            >
                Install App
            </button>
        </div>
    );
};

export default InstallPrompt;
