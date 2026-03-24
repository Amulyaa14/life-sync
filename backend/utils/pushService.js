const webPush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const hasVapidConfig = () => {
    return Boolean(
        process.env.VAPID_PUBLIC_KEY &&
        process.env.VAPID_PRIVATE_KEY &&
        process.env.VAPID_SUBJECT
    );
};

const configureVapid = () => {
    if (!hasVapidConfig()) return false;

    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    return true;
};

const sendPushToUser = async (userId, payload) => {
    if (!configureVapid()) {
        return { sent: 0, skipped: true, reason: 'VAPID_NOT_CONFIGURED' };
    }

    const subscriptions = await PushSubscription.findAll({ where: { userId } });
    if (subscriptions.length === 0) {
        return { sent: 0, skipped: true, reason: 'NO_SUBSCRIPTIONS' };
    }

    let sent = 0;

    for (const subscriptionRecord of subscriptions) {
        try {
            await webPush.sendNotification(
                subscriptionRecord.subscription,
                JSON.stringify(payload)
            );
            sent += 1;
        } catch (error) {
            const statusCode = error && error.statusCode;
            const isExpired = statusCode === 404 || statusCode === 410;

            if (isExpired) {
                await subscriptionRecord.destroy();
                continue;
            }

            console.error('Push send failed:', error.message);
        }
    }

    return { sent, skipped: false };
};

module.exports = {
    hasVapidConfig,
    sendPushToUser,
};
