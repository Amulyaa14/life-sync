const Schedule = require('../models/Schedule');
const { sendPushToUser } = require('./pushService');

const scheduledTimers = new Map();

const toDateOnlyString = (dateValue) => {
    const date = new Date(dateValue);
    return date.toISOString().split('T')[0];
};

const parseTimeForDate = (dateOnly, timeString) => {
    if (!timeString || typeof timeString !== 'string') return null;

    const date = new Date(dateOnly);
    date.setHours(0, 0, 0, 0);

    const hhmm = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!hhmm) return null;

    const hours = Number.parseInt(hhmm[1], 10);
    const minutes = Number.parseInt(hhmm[2], 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

    date.setHours(hours, minutes, 0, 0);
    return date;
};

const getReminderMinutes = (block) => {
    const reminder = block && block.reminder ? block.reminder : {};

    if (reminder.enabled === false) return null;

    const value = Number.parseInt(reminder.minutesBefore, 10);
    if (Number.isNaN(value) || value < 0) return 10;

    return value;
};

const makeTimerKey = (scheduleId, blockIndex) => `${scheduleId}:${blockIndex}`;

const clearScheduleTimers = (scheduleId) => {
    for (const [key, timer] of scheduledTimers.entries()) {
        if (key.startsWith(`${scheduleId}:`)) {
            clearTimeout(timer);
            scheduledTimers.delete(key);
        }
    }
};

const scheduleSingleReminder = (schedule, block, blockIndex) => {
    const startAt = parseTimeForDate(schedule.date, block.startTime);
    if (!startAt) return;

    const minutesBefore = getReminderMinutes(block);
    if (minutesBefore === null) return;

    const triggerAt = new Date(startAt.getTime() - minutesBefore * 60 * 1000);
    const delay = triggerAt.getTime() - Date.now();

    if (delay <= 0) return;

    const timerKey = makeTimerKey(schedule.id, blockIndex);

    const timer = setTimeout(async () => {
        try {
            await sendPushToUser(schedule.userId, {
                title: 'Upcoming Event',
                body: `${block.title} starts at ${block.startTime}`,
                type: 'event-reminder',
                scheduleId: schedule.id,
                blockIndex,
                startTime: block.startTime,
                minutesBefore,
            });
        } catch (error) {
            console.error('Scheduled reminder failed:', error.message);
        } finally {
            scheduledTimers.delete(timerKey);
        }
    }, delay);

    scheduledTimers.set(timerKey, timer);
};

const rescheduleScheduleReminders = async (schedule) => {
    if (!schedule || !schedule.id) return;

    clearScheduleTimers(schedule.id);

    const blocks = Array.isArray(schedule.blocks) ? schedule.blocks : [];
    blocks.forEach((block, index) => scheduleSingleReminder(schedule, block, index));
};

const initializeTodayReminders = async () => {
    const today = toDateOnlyString(new Date());

    const schedules = await Schedule.findAll({ where: { date: today } });
    for (const schedule of schedules) {
        await rescheduleScheduleReminders(schedule);
    }
};

module.exports = {
    initializeTodayReminders,
    rescheduleScheduleReminders,
};
