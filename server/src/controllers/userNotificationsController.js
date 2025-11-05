// server/src/controllers/userNotificationsController.js

const userNotificationsController = require('express').Router();
const { user_notification, user_account, user_details } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');

// ===============================
// GET /api/user-notifications
// Вземи всички notifications за текущия user
// ===============================
userNotificationsController.get('/', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const whereClause = { userId };
    if (unreadOnly === 'true') {
      whereClause.read = false;
    }

    const notifications = await user_notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const unreadCount = await user_notification.count({
      where: { userId, read: false }
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    });

  } catch (err) {
    console.error('❌ [GET USER NOTIFICATIONS] Error:', err);
    next(err);
  }
});

// ===============================
// PATCH /api/user-notifications/:id/read
// Маркирай notification като прочетена
// ===============================
userNotificationsController.patch('/:id/read', isAuth, async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.userId;

    const notification = await user_notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update({ read: true });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (err) {
    console.error('❌ [MARK NOTIFICATION READ] Error:', err);
    next(err);
  }
});

// ===============================
// PATCH /api/user-notifications/mark-all-read
// Маркирай всички като прочетени
// ===============================
userNotificationsController.patch('/mark-all-read', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await user_notification.update(
      { read: true },
      { where: { userId, read: false } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (err) {
    console.error('❌ [MARK ALL READ] Error:', err);
    next(err);
  }
});

// ===============================
// DELETE /api/user-notifications/:id
// Изтрий notification
// ===============================
userNotificationsController.delete('/:id', isAuth, async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.userId;

    const notification = await user_notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (err) {
    console.error('❌ [DELETE NOTIFICATION] Error:', err);
    next(err);
  }
});

module.exports = userNotificationsController;