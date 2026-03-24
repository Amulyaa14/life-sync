const express = require('express');
const router = express.Router();
const {
    getPushPublicKey,
    savePushSubscription,
    removePushSubscription,
    sendTestPush,
} = require('../controllers/notificationController');

router.get('/public-key', getPushPublicKey);
router.post('/subscription', savePushSubscription);
router.delete('/subscription', removePushSubscription);
router.post('/test', sendTestPush);

module.exports = router;
