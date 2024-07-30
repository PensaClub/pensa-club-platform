const adminController = require('express').Router();
const { user_account } = require('../sequelize/models/index');
const eventEmitter = require('../utils/eventEmitter.js');

const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

adminController.post('/change-role', isAuth, rbac.checkPermission('approve_record'), async (req, res, next) => {
  const { email, role, roleChangeComment } = req.body;
  const allowedRoles = ['admin', 'user', 'guest'];
  try {
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    if (email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot change role of the admin account.' });

    if (roleChangeComment) {
      if (roleChangeComment.length < 10) return res.status(400).json({ message: 'Comment must be at least 10 characters long.' });
      if (roleChangeComment.length > 1000) return res.status(400).json({ message: 'Maximum comment length limit of 1000 characters is reached.' });
    }

    const emailExists = await user_account.findOne({ where: { email } });

    if (!emailExists) return res.status(404).json({ message: 'User not found.' });

    await user_account.update({ role, role_change_comment: roleChangeComment }, { where: { email } });

    res.status(200).json({ message: 'Role changed successfully.' });
  } catch (err) {
    next(err);
  }
});

adminController.delete('/delete-account/:userEmail', isAuth, rbac.checkPermission('delete_account'), async (req, res, next) => {
  try {
    const { userEmail } = req.params;

    const user = await user_account.findOne({ where: { email: userEmail } });

    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot delete that admin account.' });

    await user_account.destroy({ where: { email: userEmail } });

    eventEmitter.emit('accountUpdated', {
      updates: {
        'account-delete': null,
      },
      userId: user.id,
    });

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

adminController.delete('/delete-comment/', isAuth, rbac.checkPermission('delete_record'), async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
});

module.exports = adminController;
