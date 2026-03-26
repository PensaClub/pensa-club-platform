const forumController = require('express').Router();
const { Op } = require('sequelize');
const {
  forum_space, forum_space_member, forum_post, forum_comment,
  forum_reaction, forum_tag, forum_post_tag, forum_bookmark,
  forum_report, forum_poll, forum_poll_vote, forum_user_badge,
  forum_user_status, user_account, user_details, sequelize,
} = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth');
const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  forumPostCreateSchema, forumPostUpdateSchema,
  forumCommentCreateSchema, forumCommentUpdateSchema,
  forumReactionSchema, forumReportSchema,
  forumSpaceSuggestSchema, forumPollVoteSchema,
  forumFeedQuerySchema,
} = require('../schemas/forumSchemas');

// ============ Helpers ============

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-а-яёіїєґ]/gi, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 300);
};

const generateUniqueSlug = async (title, existingId = null) => {
  let slug = generateSlug(title);
  if (!slug) slug = 'post';
  let candidate = slug;
  let counter = 1;
  while (true) {
    const where = { slug: candidate };
    if (existingId) where.id = { [Op.ne]: existingId };
    const existing = await forum_post.findOne({ where, attributes: ['id'] });
    if (!existing) return candidate;
    candidate = `${slug}-${counter++}`;
  }
};

const generateExcerpt = (html) => {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.substring(0, 490) + (text.length > 490 ? '...' : '');
};

const getOrCreateForumStatus = async (userId) => {
  let status = await forum_user_status.findOne({ where: { userId } });
  if (!status) {
    status = await forum_user_status.create({ userId });
  }
  return status;
};

const checkForumAccess = async (userId, action = 'read') => {
  if (!userId && action === 'read') return { allowed: true };
  if (!userId) return { allowed: false, reason: 'auth_required' };

  const status = await getOrCreateForumStatus(userId);

  // Check expired bans
  if (status.isBanned && status.banExpiresAt && new Date(status.banExpiresAt) < new Date()) {
    await status.update({ isBanned: false, banType: null, banReason: null, banExpiresAt: null, bannedBy: null });
    return { allowed: true, status };
  }

  if (status.isBanned) {
    if (action === 'read' && status.banType !== 'temp_ban' && status.banType !== 'perm_ban') {
      return { allowed: true, status }; // muted/restricted can still read
    }
    if (status.banType === 'temp_ban' || status.banType === 'perm_ban') {
      return { allowed: false, reason: 'banned', status };
    }
    if (status.banType === 'mute' && (action === 'post' || action === 'comment')) {
      return { allowed: false, reason: 'muted', status };
    }
    if (status.banType === 'restricted' && action !== 'read') {
      // restricted users can post but goes to pending
      return { allowed: true, restricted: true, status };
    }
  }

  return { allowed: true, status };
};

// Author include for posts/comments
const authorInclude = {
  model: user_account,
  as: 'author',
  attributes: ['id', 'email'],
  include: [{
    model: user_details,
    as: 'details',
    attributes: ['firstName', 'lastName', 'profilePicture'],
  }],
};

// ============ PUBLIC ENDPOINTS ============

// GET /forum/feed
forumController.get('/feed', isAuth.allowGuest, validateQuery(forumFeedQuerySchema), async (req, res, next) => {
  try {
    const { page, limit, sort, spaceId, tag, type, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: 'published' };
    if (spaceId) where.spaceId = spaceId;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let order;
    switch (sort) {
      case 'popular': order = [['reactionCount', 'DESC'], ['commentCount', 'DESC']]; break;
      case 'newest': order = [['createdAt', 'DESC']]; break;
      default: order = [['isPinned', 'DESC'], ['lastActivityAt', 'DESC NULLS LAST']];
    }

    const include = [
      authorInclude,
      { model: forum_space, as: 'space', attributes: ['id', 'name', 'slug', 'icon', 'color'] },
      { model: forum_tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ];

    let tagFilter = null;
    if (tag) {
      tagFilter = await forum_tag.findOne({ where: { slug: tag }, attributes: ['id'] });
      if (!tagFilter) return res.json({ posts: [], pagination: { total: 0, page, limit, pages: 0 } });
    }

    let queryOptions = { where, order, limit, offset, include, distinct: true };

    if (tagFilter) {
      queryOptions.include = [
        ...include,
        {
          model: forum_tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] },
          where: { id: tagFilter.id },
          required: true,
        },
      ];
      // Remove duplicate tags include
      queryOptions.include = queryOptions.include.filter((inc, i) =>
        !(inc.as === 'tags' && i < queryOptions.include.length - 1 && queryOptions.include[i + 1]?.as === 'tags')
      );
    }

    const { count, rows } = await forum_post.findAndCountAll(queryOptions);

    // Add user-specific data if authenticated
    let bookmarkedIds = [];
    let userReactions = {};
    if (req.user?.userId) {
      const bookmarks = await forum_bookmark.findAll({
        where: { userId: req.user.userId, postId: rows.map(p => p.id) },
        attributes: ['postId'],
      });
      bookmarkedIds = bookmarks.map(b => b.postId);

      const reactions = await forum_reaction.findAll({
        where: { userId: req.user.userId, targetType: 'post', targetId: rows.map(p => p.id) },
        attributes: ['targetId', 'emoji'],
      });
      reactions.forEach(r => { userReactions[r.targetId] = r.emoji; });
    }

    const posts = rows.map(post => ({
      ...post.toJSON(),
      isBookmarked: bookmarkedIds.includes(post.id),
      userReaction: userReactions[post.id] || null,
    }));

    res.json({
      posts,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /forum/posts/:slug
forumController.get('/posts/:slug', isAuth.allowGuest, async (req, res, next) => {
  try {
    const post = await forum_post.findOne({
      where: { slug: req.params.slug, status: 'published' },
      include: [
        authorInclude,
        { model: forum_space, as: 'space', attributes: ['id', 'name', 'slug', 'icon', 'color'] },
        { model: forum_tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: forum_poll, as: 'poll', include: [{ model: forum_poll_vote, as: 'votes', attributes: ['userId', 'optionId'] }] },
      ],
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Increment view count
    await post.increment('viewCount');

    // Get comments tree
    const comments = await forum_comment.findAll({
      where: { postId: post.id, status: 'visible' },
      include: [
        authorInclude,
        {
          model: forum_comment,
          as: 'quotedComment',
          attributes: ['id', 'content'],
          include: [{ ...authorInclude }],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Get reactions for this post
    const postReactions = await forum_reaction.findAll({
      where: { targetType: 'post', targetId: post.id },
      attributes: ['emoji', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['emoji'],
      raw: true,
    });

    // Get comment reactions
    const commentIds = comments.map(c => c.id);
    const commentReactions = commentIds.length > 0 ? await forum_reaction.findAll({
      where: { targetType: 'comment', targetId: commentIds },
      attributes: ['targetId', 'emoji', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['targetId', 'emoji'],
      raw: true,
    }) : [];

    // User-specific data
    let userBookmarked = false;
    let userPostReaction = null;
    let userCommentReactions = {};
    let userPollVotes = [];

    if (req.user?.userId) {
      const bookmark = await forum_bookmark.findOne({ where: { userId: req.user.userId, postId: post.id } });
      userBookmarked = !!bookmark;

      const postReaction = await forum_reaction.findOne({ where: { userId: req.user.userId, targetType: 'post', targetId: post.id } });
      userPostReaction = postReaction?.emoji || null;

      if (commentIds.length > 0) {
        const cReactions = await forum_reaction.findAll({
          where: { userId: req.user.userId, targetType: 'comment', targetId: commentIds },
        });
        cReactions.forEach(r => { userCommentReactions[r.targetId] = r.emoji; });
      }

      if (post.poll) {
        const votes = await forum_poll_vote.findAll({
          where: { pollId: post.poll.id, userId: req.user.userId },
          attributes: ['optionId'],
        });
        userPollVotes = votes.map(v => v.optionId);
      }
    }

    // Build comment reactions map
    const commentReactionsMap = {};
    commentReactions.forEach(r => {
      if (!commentReactionsMap[r.targetId]) commentReactionsMap[r.targetId] = [];
      commentReactionsMap[r.targetId].push({ emoji: r.emoji, count: parseInt(r.count) });
    });

    const commentsWithReactions = comments.map(c => ({
      ...c.toJSON(),
      reactions: commentReactionsMap[c.id] || [],
      userReaction: userCommentReactions[c.id] || null,
    }));

    res.json({
      post: {
        ...post.toJSON(),
        reactions: postReactions,
        isBookmarked: userBookmarked,
        userReaction: userPostReaction,
        userPollVotes,
      },
      comments: commentsWithReactions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /forum/spaces
forumController.get('/spaces', isAuth.allowGuest, async (req, res, next) => {
  try {
    const spaces = await forum_space.findAll({
      where: { status: 'active' },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description', 'icon', 'color', 'coverImage', 'memberCount', 'postCount', 'isDefault'],
    });

    // If logged in, mark joined spaces
    let joinedIds = [];
    if (req.user?.userId) {
      const memberships = await forum_space_member.findAll({
        where: { userId: req.user.userId },
        attributes: ['spaceId'],
      });
      joinedIds = memberships.map(m => m.spaceId);
    }

    res.json({
      spaces: spaces.map(s => ({
        ...s.toJSON(),
        isJoined: joinedIds.includes(s.id),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /forum/spaces/:slug
forumController.get('/spaces/:slug', isAuth.allowGuest, async (req, res, next) => {
  try {
    const space = await forum_space.findOne({
      where: { slug: req.params.slug, status: 'active' },
    });
    if (!space) return res.status(404).json({ message: 'Space not found' });

    res.json({ space });
  } catch (err) {
    next(err);
  }
});

// GET /forum/tags
forumController.get('/tags', isAuth.allowGuest, async (req, res, next) => {
  try {
    const tags = await forum_tag.findAll({
      order: [['usageCount', 'DESC']],
      limit: 50,
    });
    res.json({ tags });
  } catch (err) {
    next(err);
  }
});

// GET /forum/stats
forumController.get('/stats', isAuth.allowGuest, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [postCount, commentCount, spaceCount, activeUsersResult] = await Promise.all([
      forum_post.count({ where: { status: 'published' } }),
      forum_comment.count({ where: { status: 'visible' } }),
      forum_space.count({ where: { status: 'active' } }),
      sequelize.query(`
        SELECT COUNT(DISTINCT author_id) as count FROM (
          SELECT author_id FROM forum_posts WHERE status = 'published' AND created_at > :since
          UNION
          SELECT author_id FROM forum_comments WHERE status = 'visible' AND created_at > :since
        ) AS active_users
      `, { replacements: { since: thirtyDaysAgo }, type: sequelize.QueryTypes.SELECT }),
    ]);

    res.json({
      posts: postCount,
      comments: commentCount,
      spaces: spaceCount,
      activeUsers: parseInt(activeUsersResult[0]?.count || 0),
    });
  } catch (err) {
    next(err);
  }
});

// GET /forum/search
forumController.get('/search', isAuth.allowGuest, async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q || q.length < 2) return res.json({ results: [], pagination: { total: 0 } });

    const offset = (page - 1) * limit;
    const { count, rows } = await forum_post.findAndCountAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { content: { [Op.iLike]: `%${q}%` } },
        ],
      },
      include: [authorInclude],
      order: [['lastActivityAt', 'DESC NULLS LAST']],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      results: rows,
      pagination: { total: count, page: Number(page), limit: Number(limit), pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// ============ AUTHENTICATED ENDPOINTS ============

// GET /forum/my/status
forumController.get('/my/status', isAuth, async (req, res, next) => {
  try {
    const status = await getOrCreateForumStatus(req.user.userId);
    const badges = await forum_user_badge.findAll({ where: { userId: req.user.userId } });
    res.json({ status, badges });
  } catch (err) {
    next(err);
  }
});

// POST /forum/rules/accept
forumController.post('/rules/accept', isAuth, async (req, res, next) => {
  try {
    const status = await getOrCreateForumStatus(req.user.userId);
    await status.update({ rulesAcceptedAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /forum/posts
forumController.post('/posts', isAuth, validateBody(forumPostCreateSchema), async (req, res, next) => {
  try {
    const access = await checkForumAccess(req.user.userId, 'post');
    if (!access.allowed) return res.status(403).json({ message: access.reason });

    // Check rules accepted
    if (!access.status?.rulesAcceptedAt) {
      return res.status(403).json({ message: 'rules_not_accepted' });
    }

    const { title, content, type, spaceId, tags, images, coverImage, poll } = req.body;

    // Determine status
    let postStatus = 'pending';
    if (access.status?.role === 'vip' && !access.restricted && type !== 'article') {
      postStatus = 'published';
    }

    const slug = await generateUniqueSlug(title);
    const excerpt = generateExcerpt(content);
    const now = new Date();

    const post = await forum_post.create({
      title, slug, content, excerpt,
      authorId: req.user.userId,
      spaceId: spaceId || null,
      type, status: postStatus,
      images: images || [],
      coverImage: coverImage || null,
      lastActivityAt: now,
      publishedAt: postStatus === 'published' ? now : null,
    });

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName) || tagName.toLowerCase();
        const [tag] = await forum_tag.findOrCreate({
          where: { slug: tagSlug },
          defaults: { name: tagName, slug: tagSlug },
        });
        await forum_post_tag.create({ postId: post.id, tagId: tag.id });
        await tag.increment('usageCount');
      }
    }

    // Handle poll
    if (type === 'poll' && poll) {
      await forum_poll.create({
        postId: post.id,
        question: poll.question,
        options: poll.options.map(o => ({ ...o, voteCount: 0 })),
        isMultipleChoice: poll.isMultipleChoice || false,
        expiresAt: poll.expiresAt || null,
      });
    }

    // Update space post count
    if (spaceId) {
      await forum_space.increment('postCount', { where: { id: spaceId } });
    }

    res.status(201).json({ post, message: postStatus === 'pending' ? 'post_pending_approval' : 'post_published' });
  } catch (err) {
    next(err);
  }
});

// PUT /forum/posts/:id
forumController.put('/posts/:id', isAuth, validateBody(forumPostUpdateSchema), async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.userId) return res.status(403).json({ message: 'Not your post' });

    const { title, content, tags, images, coverImage, spaceId } = req.body;
    const updates = { editedAt: new Date() };
    if (title) { updates.title = title; updates.slug = await generateUniqueSlug(title, post.id); }
    if (content) { updates.content = content; updates.excerpt = generateExcerpt(content); }
    if (images !== undefined) updates.images = images;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (spaceId !== undefined) updates.spaceId = spaceId;

    await post.update(updates);

    // Update tags if provided
    if (tags) {
      await forum_post_tag.destroy({ where: { postId: post.id } });
      for (const tagName of tags) {
        const tagSlug = generateSlug(tagName) || tagName.toLowerCase();
        const [tag] = await forum_tag.findOrCreate({
          where: { slug: tagSlug },
          defaults: { name: tagName, slug: tagSlug },
        });
        await forum_post_tag.create({ postId: post.id, tagId: tag.id });
      }
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// DELETE /forum/posts/:id
forumController.delete('/posts/:id', isAuth, async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.user.userId) return res.status(403).json({ message: 'Not your post' });

    await post.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /forum/posts/:id/comments
forumController.post('/posts/:id/comments', isAuth, validateBody(forumCommentCreateSchema), async (req, res, next) => {
  try {
    const access = await checkForumAccess(req.user.userId, 'comment');
    if (!access.allowed) return res.status(403).json({ message: access.reason });
    if (!access.status?.rulesAcceptedAt) return res.status(403).json({ message: 'rules_not_accepted' });

    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.isLocked) return res.status(403).json({ message: 'post_locked' });

    const { content, parentId, images, mentionedUsers, quotedCommentId } = req.body;

    const comment = await forum_comment.create({
      postId: post.id,
      authorId: req.user.userId,
      parentId: parentId || null,
      content,
      images: images || [],
      mentionedUsers: mentionedUsers || [],
      quotedCommentId: quotedCommentId || null,
    });

    // Update cached counts
    await post.increment('commentCount');
    await post.update({ lastActivityAt: new Date() });

    // Send notifications for @mentions
    if (mentionedUsers && mentionedUsers.length > 0) {
      const { user_notification } = require('../sequelize/models/index');
      for (const mentionedUserId of mentionedUsers) {
        if (mentionedUserId !== req.user.userId) {
          await user_notification.create({
            userId: mentionedUserId,
            type: 'forum_mention',
            title: 'Споменаха ви във форума',
            message: `Споменаха ви в коментар на "${post.title}"`,
            data: { postSlug: post.slug, commentId: comment.id },
          }).catch(() => {}); // Ignore if notification model doesn't support this type
        }
      }
    }

    // Reload with author
    const full = await forum_comment.findByPk(comment.id, { include: [authorInclude] });
    res.status(201).json({ comment: full });
  } catch (err) {
    next(err);
  }
});

// PUT /forum/comments/:id
forumController.put('/comments/:id', isAuth, validateBody(forumCommentUpdateSchema), async (req, res, next) => {
  try {
    const comment = await forum_comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId !== req.user.userId) return res.status(403).json({ message: 'Not your comment' });

    await comment.update({ content: req.body.content, isEdited: true });
    res.json({ comment });
  } catch (err) {
    next(err);
  }
});

// DELETE /forum/comments/:id
forumController.delete('/comments/:id', isAuth, async (req, res, next) => {
  try {
    const comment = await forum_comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId !== req.user.userId) return res.status(403).json({ message: 'Not your comment' });

    const post = await forum_post.findByPk(comment.postId);
    await comment.update({ status: 'deleted', content: '[Изтрит коментар]' });
    if (post) await post.decrement('commentCount');

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /forum/reactions
forumController.post('/reactions', isAuth, validateBody(forumReactionSchema), async (req, res, next) => {
  try {
    const { targetType, targetId, emoji } = req.body;

    // Check restricted
    const access = await checkForumAccess(req.user.userId, 'react');
    if (access.status?.isBanned && access.status?.banType === 'restricted') {
      return res.status(403).json({ message: 'restricted' });
    }

    const existing = await forum_reaction.findOne({
      where: { userId: req.user.userId, targetType, targetId },
    });

    if (existing) {
      if (existing.emoji === emoji) {
        // Remove reaction
        await existing.destroy();
        if (targetType === 'post') await forum_post.decrement('reactionCount', { where: { id: targetId } });
        else await forum_comment.decrement('reactionCount', { where: { id: targetId } });
        return res.json({ action: 'removed' });
      }
      // Change reaction
      await existing.update({ emoji });
      return res.json({ action: 'changed', emoji });
    }

    await forum_reaction.create({ userId: req.user.userId, targetType, targetId, emoji });
    if (targetType === 'post') await forum_post.increment('reactionCount', { where: { id: targetId } });
    else await forum_comment.increment('reactionCount', { where: { id: targetId } });

    res.json({ action: 'added', emoji });
  } catch (err) {
    next(err);
  }
});

// POST /forum/bookmarks/:postId
forumController.post('/bookmarks/:postId', isAuth, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);
    const existing = await forum_bookmark.findOne({ where: { userId: req.user.userId, postId } });

    if (existing) {
      await existing.destroy();
      await forum_post.decrement('bookmarkCount', { where: { id: postId } });
      return res.json({ action: 'removed' });
    }

    await forum_bookmark.create({ userId: req.user.userId, postId });
    await forum_post.increment('bookmarkCount', { where: { id: postId } });
    res.json({ action: 'added' });
  } catch (err) {
    next(err);
  }
});

// GET /forum/bookmarks
forumController.get('/bookmarks', isAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await forum_bookmark.findAndCountAll({
      where: { userId: req.user.userId },
      include: [{ model: forum_post, as: 'post', include: [authorInclude] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      bookmarks: rows,
      pagination: { total: count, page: Number(page), limit: Number(limit), pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// POST /forum/posts/:id/share
forumController.post('/posts/:id/share', isAuth, async (req, res, next) => {
  try {
    await forum_post.increment('shareCount', { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /forum/reports
forumController.post('/reports', isAuth, validateBody(forumReportSchema), async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    // Prevent duplicate reports
    const existing = await forum_report.findOne({
      where: { reporterId: req.user.userId, targetType, targetId },
    });
    if (existing) return res.status(400).json({ message: 'already_reported' });

    await forum_report.create({
      reporterId: req.user.userId, targetType, targetId, reason,
      description: description || null,
    });

    // Check auto-hide threshold
    const reportCount = await forum_report.count({ where: { targetType, targetId } });
    // Read threshold from settings
    const { site_setting } = require('../sequelize/models/index');
    let threshold = 3;
    try {
      const setting = await site_setting.findOne({ where: { key: 'forum_reports_to_auto_hide' } });
      if (setting) threshold = parseInt(setting.value) || 3;
    } catch (e) {}

    if (reportCount >= threshold) {
      if (targetType === 'post') {
        await forum_post.update({ status: 'hidden' }, { where: { id: targetId } });
      } else {
        await forum_comment.update({ status: 'hidden' }, { where: { id: targetId } });
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /forum/spaces/suggest
forumController.post('/spaces/suggest', isAuth, validateBody(forumSpaceSuggestSchema), async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const slug = generateSlug(name) || name.toLowerCase().replace(/\s+/g, '-');

    const existing = await forum_space.findOne({ where: { slug } });
    if (existing) return res.status(400).json({ message: 'space_name_taken' });

    const space = await forum_space.create({
      name, slug, description,
      icon: icon || '💬',
      createdBy: req.user.userId,
      status: 'pending',
    });

    res.status(201).json({ space, message: 'space_pending_approval' });
  } catch (err) {
    next(err);
  }
});

// POST /forum/spaces/:id/join
forumController.post('/spaces/:id/join', isAuth, async (req, res, next) => {
  try {
    const spaceId = parseInt(req.params.id);
    const existing = await forum_space_member.findOne({ where: { spaceId, userId: req.user.userId } });
    if (existing) return res.status(400).json({ message: 'already_joined' });

    await forum_space_member.create({ spaceId, userId: req.user.userId });
    await forum_space.increment('memberCount', { where: { id: spaceId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /forum/spaces/:id/leave
forumController.delete('/spaces/:id/leave', isAuth, async (req, res, next) => {
  try {
    const spaceId = parseInt(req.params.id);
    const deleted = await forum_space_member.destroy({ where: { spaceId, userId: req.user.userId } });
    if (deleted) await forum_space.decrement('memberCount', { where: { id: spaceId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /forum/polls/:id/vote
forumController.post('/polls/:id/vote', isAuth, validateBody(forumPollVoteSchema), async (req, res, next) => {
  try {
    const poll = await forum_poll.findByPk(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'poll_expired' });
    }

    const { optionIds } = req.body;
    if (!poll.isMultipleChoice && optionIds.length > 1) {
      return res.status(400).json({ message: 'single_choice_only' });
    }

    // Remove existing votes
    await forum_poll_vote.destroy({ where: { pollId: poll.id, userId: req.user.userId } });

    // Add new votes
    for (const optionId of optionIds) {
      await forum_poll_vote.create({ pollId: poll.id, userId: req.user.userId, optionId });
    }

    // Recalculate
    const totalVotes = await forum_poll_vote.count({ where: { pollId: poll.id } });
    const options = poll.options.map(opt => {
      const count = forum_poll_vote.count({ where: { pollId: poll.id, optionId: opt.id } });
      return { ...opt, voteCount: count };
    });

    await poll.update({ totalVotes });

    res.json({ success: true, totalVotes });
  } catch (err) {
    next(err);
  }
});

// GET /forum/my/posts
forumController.get('/my/posts', isAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await forum_post.findAndCountAll({
      where: { authorId: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({ posts: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

// GET /forum/my/comments
forumController.get('/my/comments', isAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await forum_comment.findAndCountAll({
      where: { authorId: req.user.userId, status: { [Op.ne]: 'deleted' } },
      include: [{ model: forum_post, as: 'post', attributes: ['id', 'title', 'slug'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({ comments: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
});

// GET /forum/my/spaces
forumController.get('/my/spaces', isAuth, async (req, res, next) => {
  try {
    const memberships = await forum_space_member.findAll({
      where: { userId: req.user.userId },
      include: [{
        model: forum_space, as: 'space',
        attributes: ['id', 'name', 'slug', 'icon', 'color', 'memberCount', 'postCount'],
        where: { status: 'active' },
      }],
    });

    res.json({ spaces: memberships.map(m => ({ ...m.space.toJSON(), role: m.role })) });
  } catch (err) {
    next(err);
  }
});

module.exports = forumController;
