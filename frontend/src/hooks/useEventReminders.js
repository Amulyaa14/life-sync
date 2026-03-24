import { useEffect } from 'react';
import api from '../api/axios';
import useNotifications from './useNotifications';

const STORAGE_PREFIX = 'lifesync_event_reminder';
const TWO_MINUTES = 2 * 60 * 1000;

const parseTimeToDate = (timeString) => {
    if (!timeString) return null;

    const now = new Date();
    const date = new Date(now);
    date.setSeconds(0, 0);

    const hhmm24 = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm24) {
        const hours = Number.parseInt(hhmm24[1], 10);
        const minutes = Number.parseInt(hhmm24[2], 10);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    const hhmm12 = timeString.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (!hhmm12) return null;

    let hours = Number.parseInt(hhmm12[1], 10);
    const minutes = Number.parseInt(hhmm12[2] || '0', 10);
    const meridiem = hhmm12[3].toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    date.setHours(hours, minutes, 0, 0);
    return date;
};

const notificationKey = (eventId, triggerAt) => `${STORAGE_PREFIX}:${eventId}:${triggerAt}`;

const wasNotified = (eventId, triggerAt) => localStorage.getItem(notificationKey(eventId, triggerAt)) === '1';
const markNotified = (eventId, triggerAt) => localStorage.setItem(notificationKey(eventId, triggerAt), '1');

const useEventReminders = (enabled) => {
    const { sendNotification, requestPermission } = useNotifications();

    useEffect(() => {
        if (!enabled) return undefined;

        let isCancelled = false;
        const timers = [];

        const scheduleReminders = async () => {
            if (!('Notification' in window)) return;
            await requestPermission();

            const [scheduleRes, taskRes] = await Promise.all([
                api.get('/schedule'),
                api.get('/tasks'),
            ]);

            if (isCancelled) return;

            const blocks = scheduleRes.data?.blocks || [];
            const pendingTasks = (taskRes.data || []).filter((task) => !task.completed);

            blocks.forEach((block, index) => {
                const start = parseTimeToDate(block.startTime);
                if (!start) return;

                const reminderConfig = block.reminder || {};
                if (reminderConfig.enabled === false) return;

                const minutesBefore = Number.parseInt(reminderConfig.minutesBefore, 10);
                const offsetMinutes = Number.isNaN(minutesBefore) || minutesBefore < 0 ? 10 : minutesBefore;

                const eventId = `${index}:${block.title}`;
                const reminderAt = start.getTime() - offsetMinutes * 60 * 1000;
                const now = Date.now();

                if (reminderAt > now) {
                    const reminderKey = `${new Date(reminderAt).toDateString()}:${offsetMinutes}min`;
                    if (!wasNotified(eventId, reminderKey)) {
                        const timeoutId = window.setTimeout(async () => {
                            if (wasNotified(eventId, reminderKey)) return;
                            await sendNotification('Upcoming Event', {
                                body: `${block.title} starts at ${block.startTime} (${offsetMinutes} min reminder)`,
                                tag: `event-reminder-${eventId}`,
                            });
                            markNotified(eventId, reminderKey);
                        }, reminderAt - now);

                        timers.push(timeoutId);
                    }
                }

                const startIn = start.getTime() - now;
                const startKey = `${start.toDateString()}:start`;
                if (startIn >= 0 && startIn <= TWO_MINUTES && !wasNotified(eventId, startKey)) {
                    sendNotification('Event Starting Now', {
                        body: `${block.title} is starting now.`,
                        tag: `event-start-${eventId}`,
                    });
                    markNotified(eventId, startKey);
                }
            });

            if (pendingTasks.length > 0) {
                const now = new Date();
                const summaryTime = new Date(now);
                summaryTime.setHours(20, 0, 0, 0);

                if (summaryTime.getTime() > Date.now()) {
                    const summaryKey = `${summaryTime.toDateString()}:tasks-summary`;
                    if (!wasNotified('tasks', summaryKey)) {
                        const timeoutId = window.setTimeout(async () => {
                            if (wasNotified('tasks', summaryKey)) return;
                            await sendNotification('Daily Task Reminder', {
                                body: `You still have ${pendingTasks.length} pending task(s).`,
                                tag: 'tasks-summary',
                            });
                            markNotified('tasks', summaryKey);
                        }, summaryTime.getTime() - Date.now());
                        timers.push(timeoutId);
                    }
                }
            }
        };

        scheduleReminders().catch((error) => {
            console.error('Failed to schedule reminders:', error);
        });

        return () => {
            isCancelled = true;
            timers.forEach((timerId) => window.clearTimeout(timerId));
        };
    }, [enabled, requestPermission, sendNotification]);
};

export default useEventReminders;
