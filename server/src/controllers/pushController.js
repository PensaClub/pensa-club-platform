const pushController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { getVapidPublicKey } = require('../utils/pushNotifications');

// GET /push/vapid-key — public key for client subscription
pushController.get('/vapid-key', (req, res) => {
  const key = getVapidPublicKey();
  if (!key) return res.status(503).json({ message: 'Push notifications not configured' });
  res.json({ publicKey: key });
});

// POST /push/subscribe — save push subscription
pushController.post('/subscribe', isAuth, async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'Invalid subscription' });
    }

    const { push_subscription } = require('../sequelize/models/index');

    const [sub, created] = await push_subscription.findOrCreate({
      where: { endpoint },
      defaults: {
        userId: req.user.userId,
        endpoint,
        keysP256dh: keys.p256dh,
        keysAuth: keys.auth,
      },
    });

    if (!created) {
      // Update existing subscription (might be different user)
      sub.userId = req.user.userId;
      sub.keysP256dh = keys.p256dh;
      sub.keysAuth = keys.auth;
      await sub.save();
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /push/unsubscribe — remove push subscription
pushController.delete('/unsubscribe', isAuth, async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'endpoint required' });

    const { push_subscription } = require('../sequelize/models/index');
    await push_subscription.destroy({ where: { endpoint, userId: req.user.userId } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = pushController;
