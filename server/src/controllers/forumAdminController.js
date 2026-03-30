const forumAdminController = require('express').Router();
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { validateBody } = require('../middlewares/validateRequest');
const {
  forumPunishmentSchema,
  forumPostStatusSchema,
  forumCommentStatusSchema,
  forumSpaceCreateSchema,
  forumSpaceUpdateSchema,
} = require('../schemas/forumSchemas');
const {
  forum_post, forum_comment, forum_space, forum_space_member,
  forum_reaction, forum_tag, forum_report, forum_user_status,
  forum_punishment_log, forum_user_badge, forum_bookmark,
  user_account, user_details, site_setting, sequelize,
} = require('../sequelize/models/index');

const adminAuth = [isAuth, rbac.checkPermission('siteSettings', 'read')];

// Helper: generate slug from name
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0400-\u04FF-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper: user include for lists
const userInclude = {
  model: user_account,
  as: 'author',
  attributes: ['id', 'email', 'role'],
  include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
};

// ─── 1. GET /forum/admin/dashboard ──────────────────────────────────────────────
forumAdminController.get('/dashboard', ...adminAuth, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [postCount, commentCount, spaceCount, pendingPosts, pendingSpaces, pendingReports, userCount, totalViews, activeToday] = await Promise.all([
      forum_post.count({ where: { status: 'published' } }),
      forum_comment.count({ where: { status: 'visible' } }),
      forum_space.count({ where: { status: 'active' } }),
      forum_post.count({ where: { status: 'pending' } }),
      forum_space.count({ where: { status: 'pending' } }),
      forum_report.count({ where: { status: 'pending' } }),
      forum_user_status.count(),
      forum_post.sum('viewCount') || 0,
      forum_post.count({ where: { created_at: { [Op.gte]: today } } }),
    ]);

    // Recent 5 posts
    const recentPosts = await forum_post.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'slug', 'status', 'type', 'createdAt'],
      include: [{
        model: user_account, as: 'author', attributes: ['id', 'email'],
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
      }],
    });

    // Recent 5 reports
    const recentReports = await forum_report.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{
        model: user_account, as: 'reporter', attributes: ['id', 'email'],
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
      }],
    });

    // Top 5 active users (most posts in last 30 days)
    const topActiveUsers = await forum_post.findAll({
      attributes: [
        'authorId',
        [sequelize.fn('COUNT', sequelize.col('forum_post.id')), 'postCount'],
      ],
      where: { created_at: { [Op.gte]: thirtyDaysAgo }, status: 'published' },
      include: [{
        model: user_account,
        as: 'author',
        attributes: ['id', 'email'],
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
      }],
      group: ['authorId', 'author.id', 'author.details.id'],
      order: [[sequelize.literal('"postCount"'), 'DESC']],
      limit: 5,
      subQuery: false,
    });

    // Top 5 commented posts
    const topCommentedPosts = await forum_post.findAll({
      attributes: ['id', 'title', 'slug', 'commentCount', 'authorId'],
      where: { status: 'published' },
      include: [{
        model: user_account,
        as: 'author',
        attributes: ['id', 'email'],
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
      }],
      order: [['commentCount', 'DESC']],
      limit: 5,
    });

    res.json({
      stats: { postCount, commentCount, spaceCount, userCount, totalViews: totalViews || 0, activeToday },
      pending: { posts: pendingPosts, spaces: pendingSpaces, reports: pendingReports },
      topActiveUsers,
      topCommentedPosts,
      recentPosts,
      recentReports,
    });
  } catch (err) {
    next(err);
  }
});

// ─── 2. GET /forum/admin/posts ──────────────────────────────────────────────────
forumAdminController.get('/posts', ...adminAuth, async (req, res, next) => {
  try {
    const { status, spaceId, type, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (spaceId) where.spaceId = Number(spaceId);
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await forum_post.findAndCountAll({
      where,
      include: [
        userInclude,
        { model: forum_space, as: 'space', attributes: ['id', 'name', 'slug'] },
        { model: forum_tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    res.json({ posts: rows, total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ─── 3. PUT /forum/admin/posts/:id/status ───────────────────────────────────────
forumAdminController.put('/posts/:id/status', ...adminAuth, validateBody(forumPostStatusSchema), async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const wasNotPublished = post.status !== 'published';
    post.status = req.body.status;
    if (req.body.status === 'published' && wasNotPublished) {
      post.publishedAt = new Date();
    }
    await post.save();

    // Gamification: award credits on approval
    if (req.body.status === 'published' && wasNotPublished) {
      try {
        const { checkAndAwardBadges, awardForumCredits, recalculateReputation } = require('../utils/forumGamification');
        await checkAndAwardBadges(post.authorId);
        await awardForumCredits(post.authorId, 'forum_post', post.id, post.title);
        await recalculateReputation(post.authorId);
      } catch (e) { /* non-blocking */ }
    }

    res.json({ message: 'Post status updated', post });
  } catch (err) {
    next(err);
  }
});

// ─── 4. PUT /forum/admin/posts/:id/pin ──────────────────────────────────────────
forumAdminController.put('/posts/:id/pin', ...adminAuth, async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ message: post.isPinned ? 'Post pinned' : 'Post unpinned', isPinned: post.isPinned });
  } catch (err) {
    next(err);
  }
});

// ─── 5. PUT /forum/admin/posts/:id/lock ─────────────────────────────────────────
forumAdminController.put('/posts/:id/lock', ...adminAuth, async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({ message: post.isLocked ? 'Post locked' : 'Post unlocked', isLocked: post.isLocked });
  } catch (err) {
    next(err);
  }
});

// ─── 6. DELETE /forum/admin/posts/:id ───────────────────────────────────────────
forumAdminController.delete('/posts/:id', ...adminAuth, async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── 7. POST /forum/admin/posts/:id/post-of-week ───────────────────────────────
forumAdminController.post('/posts/:id/post-of-week', ...adminAuth, async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Store as site setting
    const [setting, created] = await site_setting.findOrCreate({
      where: { key: 'forum_post_of_week' },
      defaults: { value: String(post.id), type: 'number', category: 'forum', description: 'Current post of the week' },
    });
    if (!created) {
      setting.value = String(post.id);
      await setting.save();
    }

    // Gamification: award badge + credits to post author
    try {
      const { checkAndAwardBadges, awardForumCredits, recalculateReputation } = require('../utils/forumGamification');
      await forum_user_badge.findOrCreate({
        where: { userId: post.authorId, badge: 'post_of_week' },
        defaults: { userId: post.authorId, badge: 'post_of_week', awardedAt: new Date() },
      });
      await awardForumCredits(post.authorId, 'forum_post_of_week', post.id, post.title);
      await recalculateReputation(post.authorId);
    } catch (e) { /* non-blocking */ }

    res.json({ message: 'Post of the week set', postId: post.id });
  } catch (err) {
    next(err);
  }
});

// ─── 8. POST /forum/admin/posts/bulk-action ─────────────────────────────────────
forumAdminController.post('/posts/bulk-action', ...adminAuth, async (req, res, next) => {
  try {
    const { action, postIds } = req.body;
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ message: 'postIds array is required' });
    }
    if (!['approve', 'hide', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'action must be one of: approve, hide, delete' });
    }

    let affected = 0;
    if (action === 'approve') {
      [affected] = await forum_post.update(
        { status: 'published', publishedAt: new Date() },
        { where: { id: { [Op.in]: postIds } } }
      );
    } else if (action === 'hide') {
      [affected] = await forum_post.update(
        { status: 'hidden' },
        { where: { id: { [Op.in]: postIds } } }
      );
    } else if (action === 'delete') {
      affected = await forum_post.destroy({ where: { id: { [Op.in]: postIds } } });
    }

    res.json({ message: `Bulk ${action} completed`, affected });
  } catch (err) {
    next(err);
  }
});

// ─── 9. GET /forum/admin/comments ───────────────────────────────────────────────
forumAdminController.get('/comments', ...adminAuth, async (req, res, next) => {
  try {
    const { status, postId, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (postId) where.postId = Number(postId);
    if (search) {
      where.content = { [Op.iLike]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await forum_comment.findAndCountAll({
      where,
      include: [
        userInclude,
        { model: forum_post, as: 'post', attributes: ['id', 'title', 'slug'] },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    res.json({ comments: rows, total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ─── 10. PUT /forum/admin/comments/:id/status ──────────────────────────────────
forumAdminController.put('/comments/:id/status', ...adminAuth, validateBody(forumCommentStatusSchema), async (req, res, next) => {
  try {
    const comment = await forum_comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.status = req.body.status;
    await comment.save();

    res.json({ message: 'Comment status updated', comment });
  } catch (err) {
    next(err);
  }
});

// ─── 11. DELETE /forum/admin/comments/:id ───────────────────────────────────────
forumAdminController.delete('/comments/:id', ...adminAuth, async (req, res, next) => {
  try {
    const comment = await forum_comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── 12. GET /forum/admin/spaces ────────────────────────────────────────────────
forumAdminController.get('/spaces', ...adminAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const spaces = await forum_space.findAll({
      where,
      include: [
        {
          model: user_account,
          as: 'creator',
          attributes: ['id', 'email'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
        },
      ],
      order: [['sortOrder', 'ASC'], ['created_at', 'DESC']],
    });

    res.json({ spaces });
  } catch (err) {
    next(err);
  }
});

// ─── 13. POST /forum/admin/spaces ───────────────────────────────────────────────
forumAdminController.post('/spaces', ...adminAuth, validateBody(forumSpaceCreateSchema), async (req, res, next) => {
  try {
    const { name, description, icon, color, coverImage } = req.body;
    const adminId = Number(req.user.userId);

    let slug = slugify(name);
    // Ensure slug uniqueness
    const existing = await forum_space.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const space = await forum_space.create({
      name,
      slug,
      description: description || null,
      icon: icon || null,
      color: color || '#14b8a6',
      coverImage: coverImage || null,
      createdBy: adminId,
      status: 'active',
    });

    res.status(201).json({ message: 'Space created', space });
  } catch (err) {
    next(err);
  }
});

// ─── 14. PUT /forum/admin/spaces/:id ────────────────────────────────────────────
forumAdminController.put('/spaces/:id', ...adminAuth, validateBody(forumSpaceUpdateSchema), async (req, res, next) => {
  try {
    const space = await forum_space.findByPk(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found' });

    const { name, description, icon, color, coverImage, status, sortOrder, isDefault } = req.body;

    if (name !== undefined) {
      space.name = name;
      let slug = slugify(name);
      const existing = await forum_space.findOne({ where: { slug, id: { [Op.ne]: space.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
      space.slug = slug;
    }
    if (description !== undefined) space.description = description;
    if (icon !== undefined) space.icon = icon;
    if (color !== undefined) space.color = color;
    if (coverImage !== undefined) space.coverImage = coverImage;
    if (status !== undefined) space.status = status;
    if (sortOrder !== undefined) space.sortOrder = sortOrder;
    if (isDefault !== undefined) space.isDefault = isDefault;

    await space.save();
    res.json({ message: 'Space updated', space });
  } catch (err) {
    next(err);
  }
});

// ─── 15. DELETE /forum/admin/spaces/:id ─────────────────────────────────────────
forumAdminController.delete('/spaces/:id', ...adminAuth, async (req, res, next) => {
  try {
    const space = await forum_space.findByPk(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found' });

    space.status = 'archived';
    await space.save();

    res.json({ message: 'Space archived', space });
  } catch (err) {
    next(err);
  }
});

// ─── 16. PUT /forum/admin/spaces/:id/approve ────────────────────────────────────
forumAdminController.put('/spaces/:id/approve', ...adminAuth, async (req, res, next) => {
  try {
    const space = await forum_space.findByPk(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found' });
    if (space.status !== 'pending') {
      return res.status(400).json({ message: 'Space is not pending approval' });
    }

    space.status = 'active';
    await space.save();

    res.json({ message: 'Space approved', space });
  } catch (err) {
    next(err);
  }
});

// ─── 17. PUT /forum/admin/spaces/:id/moderator ─────────────────────────────────
forumAdminController.put('/spaces/:id/moderator', ...adminAuth, async (req, res, next) => {
  try {
    const { userId, action } = req.body; // action: 'assign' or 'remove'
    if (!userId || !['assign', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'userId and action (assign/remove) are required' });
    }

    const space = await forum_space.findByPk(req.params.id);
    if (!space) return res.status(404).json({ message: 'Space not found' });

    if (action === 'assign') {
      const [member, created] = await forum_space_member.findOrCreate({
        where: { spaceId: space.id, userId: Number(userId) },
        defaults: { spaceId: space.id, userId: Number(userId), role: 'moderator' },
      });
      if (!created) {
        member.role = 'moderator';
        await member.save();
      }
      res.json({ message: 'Moderator assigned', member });
    } else {
      const member = await forum_space_member.findOne({
        where: { spaceId: space.id, userId: Number(userId) },
      });
      if (!member) return res.status(404).json({ message: 'Member not found in space' });

      member.role = 'member';
      await member.save();
      res.json({ message: 'Moderator role removed', member });
    }
  } catch (err) {
    next(err);
  }
});

// ─── 18. GET /forum/admin/reports ───────────────────────────────────────────────
forumAdminController.get('/reports', ...adminAuth, async (req, res, next) => {
  try {
    const { status, reason, targetType, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (targetType) where.targetType = targetType;

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await forum_report.findAndCountAll({
      where,
      include: [
        {
          model: user_account,
          as: 'reporter',
          attributes: ['id', 'email'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
        },
        {
          model: user_account,
          as: 'reviewer',
          attributes: ['id', 'email'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    // Enrich reports with target content
    const enriched = await Promise.all(rows.map(async (report) => {
      const r = report.toJSON();
      if (r.targetType === 'post') {
        const post = await forum_post.findByPk(r.targetId, {
          attributes: ['id', 'title', 'slug', 'authorId', 'content', 'status'],
          include: [{ model: user_account, as: 'author', attributes: ['id', 'email'],
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }] }],
        });
        r.targetContent = post ? { title: post.title, slug: post.slug, status: post.status, authorId: post.authorId, authorName: `${post.author?.details?.firstName || ''} ${post.author?.details?.lastName || ''}`.trim(), authorEmail: post.author?.email } : null;
      } else if (r.targetType === 'comment') {
        const comment = await forum_comment.findByPk(r.targetId, {
          attributes: ['id', 'content', 'authorId', 'postId', 'status'],
          include: [
            { model: user_account, as: 'author', attributes: ['id', 'email'],
              include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }] },
            { model: forum_post, as: 'post', attributes: ['id', 'title', 'slug'] },
          ],
        });
        r.targetContent = comment ? { content: comment.content, status: comment.status, postTitle: comment.post?.title, postSlug: comment.post?.slug, authorId: comment.authorId, authorName: `${comment.author?.details?.firstName || ''} ${comment.author?.details?.lastName || ''}`.trim(), authorEmail: comment.author?.email } : null;
      }
      return r;
    }));

    res.json({ reports: enriched, total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ─── 19. PUT /forum/admin/reports/:id ───────────────────────────────────────────
forumAdminController.put('/reports/:id', ...adminAuth, async (req, res, next) => {
  try {
    const report = await forum_report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const { status, actionTaken } = req.body;
    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be reviewed or dismissed' });
    }

    report.status = status;
    report.reviewedBy = Number(req.user.userId);
    await report.save();

    // Optional: apply action on the reported content
    if (status === 'reviewed' && actionTaken) {
      if (report.targetType === 'post') {
        const post = await forum_post.findByPk(report.targetId);
        if (post && ['hidden', 'rejected'].includes(actionTaken)) {
          post.status = actionTaken;
          await post.save();
        }
      } else if (report.targetType === 'comment') {
        const comment = await forum_comment.findByPk(report.targetId);
        if (comment && ['hidden', 'deleted'].includes(actionTaken)) {
          comment.status = actionTaken;
          await comment.save();
        }
      }
    }

    res.json({ message: 'Report reviewed', report });
  } catch (err) {
    next(err);
  }
});

// ─── 20. GET /forum/admin/users ─────────────────────────────────────────────────
forumAdminController.get('/users', ...adminAuth, async (req, res, next) => {
  try {
    const { search, role, isBanned, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // If filtering by forum role or ban status, query from forum_user_status side
    const hasForumFilter = role || isBanned !== undefined;

    if (hasForumFilter) {
      const statusWhere = {};
      if (role) statusWhere.role = role;
      if (isBanned !== undefined) statusWhere.isBanned = isBanned === 'true';

      const userIncWhere = {};
      if (search) {
        userIncWhere[Op.or] = [
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows, count } = await forum_user_status.findAndCountAll({
        where: statusWhere,
        include: [{
          model: user_account,
          as: 'user',
          attributes: ['id', 'email', 'role', 'createdAt'],
          where: Object.keys(userIncWhere).length > 0 ? userIncWhere : undefined,
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
        }],
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset,
      });

      // Reshape to match expected format
      const users = rows.map(s => ({
        ...s.user.toJSON(),
        forumStatus: { id: s.id, role: s.role, isBanned: s.isBanned, banType: s.banType, banReason: s.banReason, banExpiresAt: s.banExpiresAt, warningCount: s.warningCount, vipGrantedAt: s.vipGrantedAt },
      }));

      return res.json({ users, total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) });
    }

    // No forum filter — search users, left-join forum status
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        sequelize.where(
          sequelize.col('details.first_name'),
          { [Op.iLike]: `%${search}%` }
        ),
        sequelize.where(
          sequelize.col('details.last_name'),
          { [Op.iLike]: `%${search}%` }
        ),
      ];
    }

    const { rows, count } = await user_account.findAndCountAll({
      where: userWhere,
      attributes: ['id', 'email', 'role', 'createdAt'],
      include: [
        { model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
      subQuery: false,
    });

    // Fetch forum statuses for the returned user IDs
    const userIds = rows.map(u => u.id);
    const statuses = userIds.length > 0
      ? await forum_user_status.findAll({ where: { userId: { [Op.in]: userIds } } })
      : [];
    const statusMap = {};
    for (const s of statuses) statusMap[s.userId] = s;

    const users = rows.map(u => ({
      ...u.toJSON(),
      forumStatus: statusMap[u.id] || null,
    }));

    res.json({ users, total: count, page: Number(page), totalPages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ─── 21. GET /forum/admin/users/:id ─────────────────────────────────────────────
forumAdminController.get('/users/:id', ...adminAuth, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    const user = await user_account.findByPk(userId, {
      attributes: ['id', 'email', 'role', 'createdAt'],
      include: [
        { model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL', 'region'] },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const forumStatus = await forum_user_status.findOne({ where: { userId } });

    const punishmentHistory = await forum_punishment_log.findAll({
      where: { userId },
      include: [
        {
          model: user_account,
          as: 'admin',
          attributes: ['id', 'email'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const [postCount, commentCount, reportCount] = await Promise.all([
      forum_post.count({ where: { authorId: userId } }),
      forum_comment.count({ where: { authorId: userId } }),
      sequelize.query(
        `SELECT COUNT(*) as count FROM forum_reports r
         LEFT JOIN forum_posts p ON r.target_type = 'post' AND r.target_id = p.id
         LEFT JOIN forum_comments c ON r.target_type = 'comment' AND r.target_id = c.id
         WHERE COALESCE(p.author_id, c.author_id) = :userId`,
        { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
      ).then(r => parseInt(r[0]?.count || 0)),
    ]);

    res.json({ user, forumStatus, punishmentHistory, reportCount, stats: { postCount, commentCount } });
  } catch (err) {
    next(err);
  }
});

// ─── Helper: get or create forum_user_status ────────────────────────────────────
async function getOrCreateStatus(userId) {
  const [status] = await forum_user_status.findOrCreate({
    where: { userId },
    defaults: { userId, role: 'user' },
  });
  return status;
}

// ─── Helper: create punishment log ──────────────────────────────────────────────
async function createPunishmentLog({ userId, adminId, action, reason, duration, expiresAt, relatedPostId, relatedCommentId }) {
  return forum_punishment_log.create({
    userId,
    adminId,
    action,
    reason,
    duration: duration || null,
    expiresAt: expiresAt || null,
    relatedPostId: relatedPostId || null,
    relatedCommentId: relatedCommentId || null,
  });
}

// Punishment levels: warning=1, mute=2, restrict=2, temp_ban=3, perm_ban=4
const PUNISHMENT_LEVEL = { warning: 1, mute: 2, restrict: 2, temp_ban: 3, perm_ban: 4 };

// ─── Helper: revoke VIP on punishment level 2+ ─────────────────────────────────
async function revokeVipIfNeeded(status, adminId, action) {
  if (PUNISHMENT_LEVEL[action] >= 2 && status.role === 'vip') {
    status.role = 'user';
    status.vipGrantedAt = null;
    status.vipGrantedBy = null;
    // Log the VIP revocation
    await createPunishmentLog({
      userId: status.userId,
      adminId,
      action: 'vip_revoke',
      reason: `VIP revoked due to ${action}`,
    });
  }
}

// ─── 22. POST /forum/admin/users/:id/warn ───────────────────────────────────────
forumAdminController.post('/users/:id/warn', ...adminAuth, validateBody(forumPunishmentSchema), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);
    const { reason, relatedPostId, relatedCommentId } = req.body;

    const status = await getOrCreateStatus(userId);
    status.warningCount += 1;
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'warning', reason, relatedPostId, relatedCommentId,
    });

    // Auto-escalation: 3 warnings in 30 days → auto mute 3 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentWarnings = await forum_punishment_log.count({
      where: {
        userId,
        action: 'warning',
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
    });

    let autoMuted = false;
    if (recentWarnings >= 3) {
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      status.isBanned = true;
      status.banType = 'mute';
      status.banReason = 'Auto-mute: 3 warnings in 30 days';
      status.banExpiresAt = expiresAt;
      status.bannedBy = adminId;

      await revokeVipIfNeeded(status, adminId, 'mute');
      await status.save();

      await createPunishmentLog({
        userId, adminId, action: 'mute', reason: 'Auto-mute: 3 warnings in 30 days',
        duration: 3, expiresAt,
      });
      autoMuted = true;
    }

    res.json({ message: 'Warning issued', warningCount: status.warningCount, autoMuted });
  } catch (err) {
    next(err);
  }
});

// ─── 23. POST /forum/admin/users/:id/mute ───────────────────────────────────────
forumAdminController.post('/users/:id/mute', ...adminAuth, validateBody(forumPunishmentSchema), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);
    const { reason, duration, relatedPostId, relatedCommentId } = req.body;

    if (!duration) return res.status(400).json({ message: 'Duration (days) is required for mute' });

    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    const status = await getOrCreateStatus(userId);
    status.isBanned = true;
    status.banType = 'mute';
    status.banReason = reason;
    status.banExpiresAt = expiresAt;
    status.bannedBy = adminId;

    await revokeVipIfNeeded(status, adminId, 'mute');
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'mute', reason, duration, expiresAt, relatedPostId, relatedCommentId,
    });

    res.json({ message: 'User muted', expiresAt });
  } catch (err) {
    next(err);
  }
});

// ─── 24. POST /forum/admin/users/:id/restrict ──────────────────────────────────
forumAdminController.post('/users/:id/restrict', ...adminAuth, validateBody(forumPunishmentSchema), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);
    const { reason, duration, relatedPostId, relatedCommentId } = req.body;

    if (!duration) return res.status(400).json({ message: 'Duration (days) is required for restrict' });

    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    const status = await getOrCreateStatus(userId);
    status.isBanned = true;
    status.banType = 'restricted';
    status.banReason = reason;
    status.banExpiresAt = expiresAt;
    status.bannedBy = adminId;

    await revokeVipIfNeeded(status, adminId, 'restrict');
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'restrict', reason, duration, expiresAt, relatedPostId, relatedCommentId,
    });

    res.json({ message: 'User restricted', expiresAt });
  } catch (err) {
    next(err);
  }
});

// ─── 25. POST /forum/admin/users/:id/ban ────────────────────────────────────────
forumAdminController.post('/users/:id/ban', ...adminAuth, validateBody(forumPunishmentSchema), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);
    const { reason, duration, relatedPostId, relatedCommentId } = req.body;

    if (!duration) return res.status(400).json({ message: 'Duration (days) is required for temp ban' });

    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    const status = await getOrCreateStatus(userId);
    status.isBanned = true;
    status.banType = 'temp_ban';
    status.banReason = reason;
    status.banExpiresAt = expiresAt;
    status.bannedBy = adminId;

    await revokeVipIfNeeded(status, adminId, 'temp_ban');
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'temp_ban', reason, duration, expiresAt, relatedPostId, relatedCommentId,
    });

    res.json({ message: 'User temporarily banned', expiresAt });
  } catch (err) {
    next(err);
  }
});

// ─── 26. POST /forum/admin/users/:id/permban ───────────────────────────────────
forumAdminController.post('/users/:id/permban', ...adminAuth, validateBody(forumPunishmentSchema), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);
    const { reason, relatedPostId, relatedCommentId } = req.body;

    const status = await getOrCreateStatus(userId);
    status.isBanned = true;
    status.banType = 'perm_ban';
    status.banReason = reason;
    status.banExpiresAt = null;
    status.bannedBy = adminId;

    await revokeVipIfNeeded(status, adminId, 'perm_ban');
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'perm_ban', reason, relatedPostId, relatedCommentId,
    });

    res.json({ message: 'User permanently banned' });
  } catch (err) {
    next(err);
  }
});

// ─── 27. POST /forum/admin/users/:id/unban ──────────────────────────────────────
forumAdminController.post('/users/:id/unban', ...adminAuth, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);
    const { reason } = req.body || {};

    const status = await forum_user_status.findOne({ where: { userId } });
    if (!status) return res.status(404).json({ message: 'User forum status not found' });
    if (!status.isBanned) return res.status(400).json({ message: 'User is not banned' });

    status.isBanned = false;
    status.banType = null;
    status.banReason = null;
    status.banExpiresAt = null;
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'unban', reason: reason || 'Unbanned by admin',
    });

    res.json({ message: 'User unbanned' });
  } catch (err) {
    next(err);
  }
});

// ─── 28. POST /forum/admin/users/:id/vip ────────────────────────────────────────
forumAdminController.post('/users/:id/vip', ...adminAuth, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);

    const status = await getOrCreateStatus(userId);
    status.role = 'vip';
    status.vipGrantedAt = new Date();
    status.vipGrantedBy = 'admin';
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'vip_grant', reason: req.body?.reason || 'VIP granted by admin',
    });

    res.json({ message: 'VIP granted' });
  } catch (err) {
    next(err);
  }
});

// ─── 29. DELETE /forum/admin/users/:id/vip ──────────────────────────────────────
forumAdminController.delete('/users/:id/vip', ...adminAuth, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const adminId = Number(req.user.userId);

    const status = await forum_user_status.findOne({ where: { userId } });
    if (!status) return res.status(404).json({ message: 'User forum status not found' });
    if (status.role !== 'vip') return res.status(400).json({ message: 'User is not VIP' });

    status.role = 'user';
    status.vipGrantedAt = null;
    status.vipGrantedBy = null;
    await status.save();

    await createPunishmentLog({
      userId, adminId, action: 'vip_revoke', reason: req.body?.reason || 'VIP revoked by admin',
    });

    res.json({ message: 'VIP revoked' });
  } catch (err) {
    next(err);
  }
});

// ─── 30. GET /forum/admin/rules ─────────────────────────────────────────────────
forumAdminController.get('/rules', ...adminAuth, async (req, res, next) => {
  try {
    const ruleKeys = ['forum_rules_bg', 'forum_rules_en', 'forum_rules_de', 'forum_rules_version'];
    const settings = await site_setting.findAll({ where: { key: { [Op.in]: ruleKeys } } });

    const rules = {};
    for (const s of settings) {
      rules[s.key] = s.value;
    }

    res.json({
      bg: rules.forum_rules_bg || '',
      en: rules.forum_rules_en || '',
      de: rules.forum_rules_de || '',
      version: rules.forum_rules_version || '1',
    });
  } catch (err) {
    next(err);
  }
});

// ─── 31. PUT /forum/admin/rules ─────────────────────────────────────────────────
forumAdminController.put('/rules', ...adminAuth, async (req, res, next) => {
  try {
    const { bg, en, de } = req.body;
    if (!bg && !en && !de) {
      return res.status(400).json({ message: 'At least one language rule text is required' });
    }

    const updates = [];
    if (bg !== undefined) updates.push({ key: 'forum_rules_bg', value: bg });
    if (en !== undefined) updates.push({ key: 'forum_rules_en', value: en });
    if (de !== undefined) updates.push({ key: 'forum_rules_de', value: de });

    for (const { key, value } of updates) {
      const [setting, created] = await site_setting.findOrCreate({
        where: { key },
        defaults: { value, type: 'text', category: 'forum', description: `Forum rules (${key.split('_').pop()})` },
      });
      if (!created) {
        setting.value = value;
        await setting.save();
      }
    }

    res.json({ message: 'Rules updated' });
  } catch (err) {
    next(err);
  }
});

// ─── 32. POST /forum/admin/rules/reset-acceptance ───────────────────────────────
forumAdminController.post('/rules/reset-acceptance', ...adminAuth, async (req, res, next) => {
  try {
    // Reset all users' rulesAcceptedAt
    await forum_user_status.update(
      { rulesAcceptedAt: null },
      { where: {} }
    );

    // Increment rules version
    const [versionSetting, created] = await site_setting.findOrCreate({
      where: { key: 'forum_rules_version' },
      defaults: { value: '2', type: 'number', category: 'forum', description: 'Forum rules version' },
    });
    if (!created) {
      const currentVersion = parseInt(versionSetting.value, 10) || 1;
      versionSetting.value = String(currentVersion + 1);
      await versionSetting.save();
    }

    res.json({ message: 'Rules acceptance reset', newVersion: versionSetting.value });
  } catch (err) {
    next(err);
  }
});

// ─── 33. GET /forum/admin/settings ──────────────────────────────────────────────
forumAdminController.get('/settings', ...adminAuth, async (req, res, next) => {
  try {
    const settings = await site_setting.findAll({
      where: { key: { [Op.like]: 'forum_%' } },
      order: [['key', 'ASC']],
    });

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

// ─── 34. PUT /forum/admin/settings ──────────────────────────────────────────────
forumAdminController.put('/settings', ...adminAuth, async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'settings object is required' });
    }

    for (const [key, value] of Object.entries(settings)) {
      // Only allow forum_* keys
      if (!key.startsWith('forum_')) continue;

      const [setting, created] = await site_setting.findOrCreate({
        where: { key },
        defaults: { value: String(value), type: typeof value === 'boolean' ? 'boolean' : 'string', category: 'forum' },
      });
      if (!created) {
        setting.value = String(value);
        await setting.save();
      }
    }

    res.json({ message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
});

// ─── 35. GET /forum/admin/export/:type ──────────────────────────────────────────
forumAdminController.get('/export/:type', ...adminAuth, async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!['users', 'banned', 'vip', 'posts', 'comments', 'reports'].includes(type)) {
      return res.status(400).json({ message: 'Export type must be one of: users, banned, vip, posts, comments, reports' });
    }

    let csvHeader = '';
    let csvRows = [];

    if (type === 'users') {
      csvHeader = 'ID,Email,First Name,Last Name,Forum Role,Is Banned,Ban Type,Warning Count,Created At';
      const statuses = await forum_user_status.findAll({
        include: [{
          model: user_account,
          as: 'user',
          attributes: ['id', 'email', 'createdAt'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        }],
      });
      csvRows = statuses.map(s => {
        const u = s.user;
        const d = u?.details;
        return [
          u?.id, u?.email, d?.firstName || '', d?.lastName || '',
          s.role, s.isBanned, s.banType || '', s.warningCount, u?.createdAt,
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });
    } else if (type === 'banned') {
      csvHeader = 'ID,Email,First Name,Last Name,Ban Type,Ban Reason,Ban Expires At,Banned By';
      const statuses = await forum_user_status.findAll({
        where: { isBanned: true },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
          },
          {
            model: user_account,
            as: 'bannedByUser',
            attributes: ['id', 'email'],
          },
        ],
      });
      csvRows = statuses.map(s => {
        const u = s.user;
        const d = u?.details;
        return [
          u?.id, u?.email, d?.firstName || '', d?.lastName || '',
          s.banType, s.banReason || '', s.banExpiresAt ? new Date(s.banExpiresAt).toLocaleString('bg-BG') : 'перманентен',
          s.bannedByUser?.email || '',
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });
    } else if (type === 'vip') {
      csvHeader = 'ID,Email,First Name,Last Name,VIP Granted At,VIP Granted By';
      const statuses = await forum_user_status.findAll({
        where: { role: 'vip' },
        include: [{
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        }],
      });
      csvRows = statuses.map(s => {
        const u = s.user;
        const d = u?.details;
        return [
          u?.id, u?.email, d?.firstName || '', d?.lastName || '',
          s.vipGrantedAt ? new Date(s.vipGrantedAt).toLocaleString('bg-BG') : '', s.vipGrantedBy || '',
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });
    } else if (type === 'posts') {
      csvHeader = 'ID,Title,Author Email,Type,Status,Space,Views,Comments,Reactions,Created At,Published At';
      const posts = await forum_post.findAll({
        include: [
          { model: user_account, as: 'author', attributes: ['id', 'email'] },
          { model: forum_space, as: 'space', attributes: ['id', 'name'] },
        ],
        order: [['created_at', 'DESC']],
      });
      const fmtDate = (d) => d ? new Date(d).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      csvRows = posts.map(p => {
        return [
          p.id, p.title, p.author?.email || '', p.type, p.status,
          p.space?.name || '', p.viewCount, p.commentCount, p.reactionCount,
          fmtDate(p.createdAt), fmtDate(p.publishedAt),
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });
    } else if (type === 'comments') {
      csvHeader = 'ID,Author Email,Post Title,Content,Status,Reactions,Created At';
      const fmtDate = (d) => d ? new Date(d).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const comments = await forum_comment.findAll({
        include: [
          { model: user_account, as: 'author', attributes: ['id', 'email'] },
          { model: forum_post, as: 'post', attributes: ['id', 'title'] },
        ],
        order: [['created_at', 'DESC']],
      });
      csvRows = comments.map(c => {
        return [
          c.id, c.author?.email || '', c.post?.title || '', (c.content || '').substring(0, 100),
          c.status, c.reactionCount, fmtDate(c.createdAt),
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });
    } else if (type === 'reports') {
      csvHeader = 'ID,Reporter Email,Target Type,Target ID,Reason,Description,Status,Created At';
      const fmtDate = (d) => d ? new Date(d).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const reports = await forum_report.findAll({
        include: [{ model: user_account, as: 'reporter', attributes: ['id', 'email'] }],
        order: [['created_at', 'DESC']],
      });
      csvRows = reports.map(r => {
        return [
          r.id, r.reporter?.email || '', r.targetType, r.targetId,
          r.reason, (r.description || '').substring(0, 100), r.status, fmtDate(r.createdAt),
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });
    }

    // Generate PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="forum-${type}-${new Date().toISOString().slice(0, 10)}.pdf"`);
    doc.pipe(res);

    // Register font for Cyrillic
    const path = require('path');
    const fontPath = path.join(__dirname, '..', 'fonts', 'DejaVuSans.ttf');
    const fs = require('fs');
    const hasFont = fs.existsSync(fontPath);
    if (hasFont) doc.registerFont('CyrFont', fontPath);
    const font = hasFont ? 'CyrFont' : 'Helvetica';

    // Logo + Foundation header
    const logoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'homePage', 'logo-2.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 30, 20, { width: 60 });
      doc.moveDown(3.5);
    }
    doc.font(font).fontSize(12).text('Pensa Foundation', { align: 'center' });
    doc.fontSize(8).fillColor('#555').text('Sofia, 18B Cherni Vrah Blvd., 1421 | Tel: +877777421, +359894371779', { align: 'center' });
    doc.moveDown(0.8);

    // Title
    doc.fillColor('#222').font(font).fontSize(13).text(`Forum Export: ${type.toUpperCase()}`, { align: 'center' });
    doc.fontSize(8).fillColor('#666').text(`Generated: ${new Date().toLocaleString('bg-BG')}`, { align: 'center' });
    doc.moveDown(0.5);

    // Parse headers
    const headers = csvHeader.split(',');
    const rows = csvRows.map(r => {
      const matches = r.match(/"([^"]*)"/g) || [];
      return matches.map(m => m.replace(/^"|"$/g, ''));
    });

    // Calculate column widths
    const pageWidth = doc.page.width - 60;
    const colWidths = headers.map((h, i) => {
      const maxContent = Math.max(h.length, ...rows.map(r => (r[i] || '').length));
      return Math.min(Math.max(maxContent * 5.5, 40), 160);
    });
    const totalW = colWidths.reduce((a, b) => a + b, 0);
    const scale = pageWidth / totalW;
    const scaledWidths = colWidths.map(w => Math.floor(w * scale));

    // Draw table
    const startX = 30;
    let y = doc.y + 5;
    const rowHeight = 20;

    // Header row
    doc.fontSize(7).font(font);
    let x = startX;
    headers.forEach((h, i) => {
      doc.rect(x, y, scaledWidths[i], rowHeight).fillAndStroke('#8b2040', '#666');
      doc.fillColor('#fff').text(h, x + 2, y + 5, { width: scaledWidths[i] - 4, height: rowHeight - 4, ellipsis: true });
      x += scaledWidths[i];
    });
    y += rowHeight;

    // Data rows
    rows.forEach((row, ri) => {
      if (y + rowHeight > doc.page.height - 30) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: 30 });
        y = 30;
      }

      const bgColor = ri % 2 === 0 ? '#fff' : '#f5f3f0';
      x = startX;
      doc.fontSize(6.5).font(font);

      row.forEach((cell, ci) => {
        if (ci >= scaledWidths.length) return;
        doc.rect(x, y, scaledWidths[ci], rowHeight).fillAndStroke(bgColor, '#ccc');
        doc.fillColor('#222').text(cell || '', x + 2, y + 5, { width: scaledWidths[ci] - 4, height: rowHeight - 4, ellipsis: true });
        x += scaledWidths[ci];
      });
      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    next(err);
  }
});

module.exports = forumAdminController;
