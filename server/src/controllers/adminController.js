const adminController = require('express').Router();
const { user_account } = require('../sequelize/models/index');

const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

adminController.post('/change-role', isAuth, rbac.checkPermission('approve_record'), async (req, res) => {
  const { email, role } = req.body;
  const allowedRoles = ['admin', 'user', 'guest'];
  try {
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role.' });
    if (email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot change role of the admin account.' });

    const emailExists = await user_account.findOne({ where: { email } });

    if (!emailExists) return res.status(404).json({ message: 'User not found.' });

    await user_account.update({ role }, { where: { email } });

    res.status(200).json({ message: 'Role changed successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = adminController;
