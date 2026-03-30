/**
 * Push Notifications via web-push
 */
const webpush = require('web-push');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:pensa.club@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);
}

/**
 * Send push notification to a specific user (all their subscriptions)
 */
const sendPushToUser = async (userId, { title, body, url, icon }) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.log('[Push] VAPID keys not configured, skipping');
    return;
  }

  const { push_subscription } = require('../sequelize/models/index');
  const subscriptions = await push_subscription.findAll({ where: { userId } });
  console.log(`[Push] Found ${subscriptions.length} subscriptions for user ${userId}`);

  const payload = JSON.stringify({
    title: title || 'DigiBridge Общност',
    body: body || '',
    url: url || '/academy/community',
    icon: icon || '/logo.png',
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keysP256dh, auth: sub.keysAuth },
      }, payload);
      console.log(`[Push] Sent to user ${userId}`);
    } catch (err) {
      console.error(`[Push] Error for user ${userId}:`, err.statusCode, err.body || err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        await sub.destroy();
        console.log(`[Push] Removed expired subscription for user ${userId}`);
      }
    }
  }
};

/**
 * Get VAPID public key for client
 */
const getVapidPublicKey = () => VAPID_PUBLIC || null;

module.exports = { sendPushToUser, getVapidPublicKey };
