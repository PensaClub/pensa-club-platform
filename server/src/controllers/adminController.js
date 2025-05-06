const adminController = require('express').Router();
const { user_account, user_ads } = require('../sequelize/models/index');
const eventEmitter = require('../utils/eventEmitter.js');

const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

adminController.post('/change-role', isAuth, rbac.checkPermission('account', 'update'), async (req, res, next) => {
    const { email, role, roleChangeComment } = req.body;
    const allowedRoles = ['admin', 'moderator', 'user', 'guest', 'limited'];
    try {
        if (!allowedRoles.includes(role)) return res.status(400).json({ message: 'Invalid role.' });
        if (email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot change role of the admin account.' });

        if (roleChangeComment) {
            if (roleChangeComment.length > 1000) return res.status(400).json({ message: 'Maximum comment length limit of 1000 characters is reached.' });
        }

        const emailExists = await user_account.findOne({ where: { email } });

        if (!emailExists) return res.status(404).json({ message: 'User not found.' });

        await user_account.update({ role, role_change_comment: roleChangeComment }, { where: { email } });

        eventEmitter.emit('userCacheUpdate', { type: 'users', data: { role, roleChangeComment }, adId: null, userId: emailExists.id, action: 'account' });

        res.status(200).json({ message: 'Role changed successfully.' });
    } catch (err) {
        next(err);
    }
});

adminController.delete('/delete-account/:userEmail', isAuth, rbac.checkPermission('account', 'delete'), async (req, res, next) => {
    try {
        const { userEmail } = req.params;

        const user = await user_account.findOne({ where: { email: userEmail } });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (user.email === process.env.ADMIN_EMAIL) return res.status(400).json({ message: 'Cannot delete that admin account.' });

        await user_account.destroy({ where: { email: userEmail } });

        eventEmitter.emit('userCacheUpdate', { type: 'users', data: null, adId: null, userId: user.id, action: 'account-delete' });

        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

adminController.patch('/delete-comment/', isAuth, rbac.checkPermission('comment', 'delete'), async (req, res, next) => {
    try {
        const { email, adId } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        if (email !== req.user.email && req.user.role !== 'admin') return res.status(403).json({ message: 'You are not authorized to delete this comment.' });

        const user = await user_account.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (adId === '') {
            user.role_change_comment = null;
            await user.save();

            eventEmitter.emit('userCacheUpdate', { type: 'users', data: { roleChangeComment: null }, adId: null, userId: user.id, action: 'account' });

            return res.status(200).json({ message: 'Comment deleted successfully.' });
        }

        await user_ads.update({ admin_comment: null }, { where: { ad_id: adId } });

        eventEmitter.emit('userCacheUpdate', { type: 'ads', data: { adminComment: null }, adId, userId: user.id });

        res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = adminController;
