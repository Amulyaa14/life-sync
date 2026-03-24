import React, { useState } from 'react';
import { Settings as SettingsIcon, BellRing, Moon, Sun, Monitor, Save } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';

const Settings = () => {
    const { sendNotification } = useNotifications();
    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem('lifeSyncPrefs');
        if (saved) return JSON.parse(saved);
        return {
            notifications: true,
            theme: 'System',
            sleepGoal: 8,
            waterGoal: 8
        };
    });

    const handleSave = () => {
        localStorage.setItem('lifeSyncPrefs', JSON.stringify(preferences));
        window.dispatchEvent(new CustomEvent('lifesync-preferences-updated', { detail: preferences }));

        const root = document.documentElement;
        if (preferences.theme === 'Dark') {
            root.classList.add('dark');
        } else if (preferences.theme === 'Light') {
            root.classList.remove('dark');
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        if (preferences.notifications) {
            sendNotification('Settings Saved!', { body: 'Your preferences have been updated.' });
        } else {
            alert('Settings Saved!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-text mb-8">Settings</h1>

            <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-sm border border-border space-y-6">

                {/* Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center space-x-4 min-w-0">
                        <div className="p-3 bg-primary-100 text-primary-600 rounded-xl"><BellRing size={24} /></div>
                        <div>
                            <h3 className="text-lg font-medium text-text">Push Notifications</h3>
                            <p className="text-sm text-text-muted">Receive reminders for tasks, water, and sleep.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={preferences.notifications} onChange={e => setPreferences({ ...preferences, notifications: e.target.checked })} />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                </div>

                {/* Theme */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center space-x-4 min-w-0">
                        <div className="p-3 bg-secondary-50 text-secondary-600 rounded-xl"><Monitor size={24} /></div>
                        <div>
                            <h3 className="text-lg font-medium text-text">App Theme</h3>
                            <p className="text-sm text-text-muted">Select your preferred color scheme.</p>
                        </div>
                    </div>
                    <select
                        className="px-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={preferences.theme}
                        onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                    >
                        <option>System</option>
                        <option>Light</option>
                        <option>Dark</option>
                    </select>
                </div>

                {/* Goals */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center space-x-4 min-w-0">
                        <div className="p-3 bg-success-50 text-success-600 rounded-xl"><Sun size={24} /></div>
                        <div>
                            <h3 className="text-lg font-medium text-text">Daily Goals</h3>
                            <p className="text-sm text-text-muted">Adjust your target health metrics.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-xs text-text-muted mb-1">Water (Glasses)</label>
                            <input type="number" min="1" max="20" className="w-20 px-3 py-2 bg-surface border border-border rounded-lg text-text" value={preferences.waterGoal} onChange={e => setPreferences({ ...preferences, waterGoal: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs text-text-muted mb-1">Sleep (Hrs)</label>
                            <input type="number" min="1" max="14" className="w-20 px-3 py-2 bg-surface border border-border rounded-lg text-text" value={preferences.sleepGoal} onChange={e => setPreferences({ ...preferences, sleepGoal: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 transition text-white rounded-lg font-medium shadow-sm">
                        <Save size={18} className="mr-2" /> Save Preferences
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Settings;
