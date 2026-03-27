const forumAdminController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

// Skeleton — full implementation in Phase 6
// All routes require admin/mentor auth

// GET /forum/admin/dashboard
forumAdminController.get('/dashboard', isAuth, rbac.checkPermission('siteSettings', 'read'), async (req, res, next) => {
  try {
    const {
      forum_post, forum_comment, forum_space, forum_report,
      forum_user_status, sequelize,
    } = require('../sequelize/models/index');
    const { Op } = require('sequelize');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [postCount, commentCount, spaceCount, pendingPosts, pendingSpaces, pendingReports] = await Promise.all([
      forum_post.count({ where: { status: 'published' } }),
      forum_comment.count({ where: { status: 'visible' } }),
      forum_space.count({ where: { status: 'active' } }),
      forum_post.count({ where: { status: 'pending' } }),
      forum_space.count({ where: { status: 'pending' } }),
      forum_report.count({ where: { status: 'pending' } }),
    ]);

    res.json({
      stats: { postCount, commentCount, spaceCount },
      pending: { posts: pendingPosts, spaces: pendingSpaces, reports: pendingReports },
    });
  } catch (err) {
    next(err);
  }
});

// Placeholder for remaining admin endpoints (Phase 6)
forumAdminController.all('*', (req, res) => {
  res.status(501).json({ message: 'Admin endpoint not yet implemented — coming in Phase 6' });
});

module.exports = forumAdminController;
