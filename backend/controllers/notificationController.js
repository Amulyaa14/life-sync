const PushSubscription = require('../models/PushSubscription');
const { hasVapidConfig, sendPushToUser } = require('../utils/pushService');

exports.getPushPublicKey = (req, res) => {
    if (!hasVapidConfig()) {
        return res.status(503).json({
            message: 'Push is not configured on server.',
            configured: false,
        });
    }

    return res.json({
        publicKey: process.env.VAPID_PUBLIC_KEY,
        configured: true,
    });
};

exports.savePushSubscription = async (req, res) => {
    try {
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ message: 'Invalid subscription payload.' });
        }

        const [record, created] = await PushSubscription.findOrCreate({
            where: { endpoint: subscription.endpoint },
            defaults: {
                userId: req.user.id,
                endpoint: subscription.endpoint,
                subscription,
            },
        });

        if (!created) {
            record.userId = req.user.id;
            record.subscription = subscription;
            await record.save();
        }

        return res.status(201).json({ message: 'Subscription saved.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.removePushSubscription = async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ message: 'Endpoint is required.' });
        }

        await PushSubscription.destroy({ where: { userId: req.user.id, endpoint } });
        return res.json({ message: 'Subscription removed.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.sendTestPush = async (req, res) => {
    try {
        const result = await sendPushToUser(req.user.id, {
            title: 'Life Sync Notification Test',
            body: 'Push notifications are active on this device.',
            type: 'push-test',
        });

        return res.json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
