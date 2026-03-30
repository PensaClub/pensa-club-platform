const forumController = require('express').Router();
const { Op } = require('sequelize');
const {
  forum_space, forum_space_member, forum_post, forum_comment,
  forum_reaction, forum_tag, forum_post_tag, forum_bookmark,
  forum_report, forum_poll, forum_poll_vote, forum_user_badge,
  forum_user_status, user_account, user_details, sequelize,
} = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth');
const forumEmailTemplates = require('../utils/forumEmailTemplates');
const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
const { checkAndAwardBadges, awardForumCredits, recalculateReputation } = require('../utils/forumGamification');
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

const getForumSetting = async (key, defaultValue = null) => {
  const { site_setting } = require('../sequelize/models/index');
  const setting = await site_setting.findOne({ where: { key: `forum_${key}` } });
  return setting ? setting.value : defaultValue;
};

const isForumFeatureEnabled = async (feature) => {
  const val = await getForumSetting(feature, 'true');
  return val === 'true' || val === true;
};

const countWords = (text) => {
  const plain = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (!plain) return 0;
  return plain.split(/\s+/).length;
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
  include: [
    { model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] },
    { model: forum_user_badge, as: 'forumBadges', attributes: ['badge', 'awardedAt'] },
  ],
};

// ============ PUBLIC ENDPOINTS ============

// GET /forum/feed
forumController.get('/feed', isAuth.allowGuest, validateQuery(forumFeedQuerySchema), async (req, res, next) => {
  try {
    let { page, limit, sort, spaceId, tag, type, search } = req.query;

    // Override limit with postsPerPage setting
    const ppp = parseInt(await getForumSetting('postsPerPage', '0'), 10);
    if (ppp > 0) limit = ppp;

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
          attributes: ['id', 'content', 'authorId'],
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

// GET /forum/trending-tags
forumController.get('/trending-tags', isAuth.allowGuest, async (req, res, next) => {
  try {
    const tags = await forum_tag.findAll({
      order: [['usageCount', 'DESC']],
      limit: 20,
      attributes: ['id', 'name', 'slug', 'usageCount'],
    });
    res.json({ tags });
  } catch (err) {
    next(err);
  }
});

// GET /forum/recent-articles — last 5 published articles
forumController.get('/recent-articles', isAuth.allowGuest, async (req, res, next) => {
  try {
    const { article, mainImage } = require('../sequelize/models/index');
    const articles = await article.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'slug', 'summary', 'createdAt'],
      include: [{
        model: mainImage,
        as: 'mainImage',
        attributes: ['thumbnail', 'sources'],
      }],
    });
    const mapped = articles.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      imageUrl: a.mainImage?.thumbnail || (Array.isArray(a.mainImage?.sources) ? a.mainImage.sources[0] : null),
      createdAt: a.createdAt,
    }));
    res.json({ articles: mapped });
  } catch (err) {
    console.error('Recent articles error:', err.message);
    res.json({ articles: [] });
  }
});

// GET /forum/upcoming-seminars — next 3 seminars
forumController.get('/upcoming-seminars', isAuth.allowGuest, async (req, res, next) => {
  try {
    const { seminar } = require('../sequelize/models/index');
    const seminars = await seminar.findAll({
      where: {
        isPublished: true,
        status: { [Op.in]: ['scheduled', 'live'] },
        scheduledDate: { [Op.gte]: new Date() },
      },
      order: [['scheduledDate', 'ASC']],
      limit: 3,
      attributes: ['id', 'title', 'slug', 'scheduledDate', 'location', 'isOnline', 'thumbnailUrl'],
    });
    res.json({ seminars });
  } catch (err) {
    res.json({ seminars: [] });
  }
});

// GET /forum/recommended-courses — 3 published courses
forumController.get('/recommended-courses', isAuth.allowGuest, async (req, res, next) => {
  try {
    const { course } = require('../sequelize/models/index');
    const courses = await course.findAll({
      where: { status: 'active' },
      order: [sequelize.fn('RANDOM')],
      limit: 3,
      attributes: ['id', 'name', 'slug', 'thumbnailUrl', 'shortDescription'],
    });
    const mapped = courses.map(c => ({
      id: c.id,
      title: c.name,
      slug: c.slug,
      thumbnailUrl: c.thumbnailUrl,
      shortDescription: c.shortDescription,
    }));
    res.json({ courses: mapped });
  } catch (err) {
    console.error('Courses error:', err.message);
    res.json({ courses: [] });
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

// ============ GAMIFICATION ENDPOINTS ============

// GET /forum/leaderboard?period=weekly|monthly|all
forumController.get('/leaderboard', async (req, res, next) => {
  try {
    const period = req.query.period || 'all';
    let dateFilter = {};

    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { [Op.gte]: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { [Op.gte]: monthAgo } };
    }

    let leaders;

    if (period === 'all') {
      leaders = await forum_user_status.findAll({
        where: { reputationScore: { [Op.gt]: 0 } },
        order: [['reputationScore', 'DESC']],
        limit: 10,
        include: [{
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            { model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] },
            { model: forum_user_badge, as: 'forumBadges', attributes: ['badge', 'awardedAt'] },
          ],
        }],
      });

      leaders = leaders.map((s, i) => ({
        rank: i + 1,
        userId: s.userId,
        name: s.user?.details ? `${s.user.details.firstName || ''} ${s.user.details.lastName || ''}`.trim() : 'Потребител',
        avatar: s.user?.details?.imageURL || null,
        score: s.reputationScore,
        badges: (s.user?.forumBadges || []).map(b => b.badge),
      }));
    } else {
      // Period-based: aggregate from credits history
      const { user_credits_history } = require('../sequelize/models/index');
      const results = await user_credits_history.findAll({
        where: { sourceType: { [Op.like]: 'forum_%' }, ...dateFilter },
        attributes: [
          'userId',
          [sequelize.fn('SUM', sequelize.col('credits_amount')), 'periodScore'],
        ],
        group: ['userId'],
        order: [[sequelize.fn('SUM', sequelize.col('credits_amount')), 'DESC']],
        limit: 10,
        raw: true,
      });

      const userIds = results.map(r => r.userId);
      const users = await user_account.findAll({
        where: { id: userIds },
        attributes: ['id'],
        include: [
          { model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] },
          { model: forum_user_badge, as: 'forumBadges', attributes: ['badge'] },
        ],
      });

      const userMap = {};
      users.forEach(u => { userMap[u.id] = u; });

      leaders = results.map((r, i) => {
        const u = userMap[r.userId];
        return {
          rank: i + 1,
          userId: r.userId,
          name: u?.details ? `${u.details.firstName || ''} ${u.details.lastName || ''}`.trim() : 'Потребител',
          avatar: u?.details?.imageURL || null,
          score: parseInt(r.periodScore, 10) || 0,
          badges: (u?.forumBadges || []).map(b => b.badge),
        };
      });
    }

    res.json({ leaders, period });
  } catch (err) {
    next(err);
  }
});

// GET /forum/post-of-week
forumController.get('/post-of-week', async (req, res, next) => {
  try {
    const { site_setting } = require('../sequelize/models/index');
    const setting = await site_setting.findOne({ where: { key: 'forum_post_of_week' } });
    if (!setting || !setting.value) return res.json({ post: null });

    const postId = parseInt(setting.value, 10);
    if (!postId) return res.json({ post: null });

    const post = await forum_post.findOne({
      where: { id: postId, status: 'published' },
      attributes: ['id', 'title', 'slug', 'excerpt', 'coverImage', 'viewCount', 'commentCount', 'reactionCount', 'createdAt'],
      include: [{
        model: user_account,
        as: 'author',
        attributes: ['id'],
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'imageURL'] }],
      }],
    });

    res.json({ post: post || null });
  } catch (err) {
    next(err);
  }
});

// GET /forum/badges/:userId
forumController.get('/badges/:userId', async (req, res, next) => {
  try {
    const badges = await forum_user_badge.findAll({
      where: { userId: req.params.userId },
      attributes: ['badge', 'awardedAt'],
      order: [['awardedAt', 'DESC']],
    });
    const { BADGE_DEFINITIONS } = require('../utils/forumGamification');
    const enriched = badges.map(b => ({
      badge: b.badge,
      emoji: BADGE_DEFINITIONS[b.badge]?.emoji || '🏅',
      awardedAt: b.awardedAt,
    }));
    res.json({ badges: enriched });
  } catch (err) {
    next(err);
  }
});

// ============ AUTHENTICATED ENDPOINTS ============

// GET /forum/settings (public limits)
forumController.get('/settings', async (req, res, next) => {
  try {
    const { site_setting } = require('../sequelize/models/index');
    const numKeys = ['forum_maxPostLength', 'forum_maxCommentLength', 'forum_maxFileSize', 'forum_maxCommentFileSize', 'forum_cooldownSeconds'];
    const toggleKeys = ['forum_allowPolls', 'forum_allowFileUploads', 'forum_enableSpaces', 'forum_enableReactions', 'forum_enableBookmarks', 'forum_enableReports'];
    const allKeys = [...numKeys, ...toggleKeys];
    const settings = await site_setting.findAll({ where: { key: allKeys } });

    const result = {};
    for (const s of settings) {
      const k = s.key.replace('forum_', '');
      if (toggleKeys.includes(s.key)) {
        result[k] = s.value === 'true' || s.value === true;
      } else {
        result[k] = parseInt(s.value, 10) || 0;
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

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

// GET /forum/rules
forumController.get('/rules', isAuth, async (req, res, next) => {
  try {
    const { site_setting } = require('../sequelize/models/index');
    const ruleKeys = ['forum_rules_bg', 'forum_rules_en', 'forum_rules_de'];
    const settings = await site_setting.findAll({ where: { key: ruleKeys } });

    const rules = {};
    for (const s of settings) {
      rules[s.key.replace('forum_rules_', '')] = s.value;
    }

    res.json({ bg: rules.bg || '', en: rules.en || '', de: rules.de || '' });
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

    const { title, content, type, spaceId, tags, images, coverImage, videos, poll } = req.body;

    // Feature checks
    if (type === 'poll' && !(await isForumFeatureEnabled('allowPolls'))) {
      return res.status(403).json({ message: 'polls_disabled' });
    }
    if ((images?.length || videos?.length || coverImage) && !(await isForumFeatureEnabled('allowFileUploads'))) {
      return res.status(403).json({ message: 'file_uploads_disabled' });
    }

    // Word limit check
    const maxPostWords = parseInt(await getForumSetting('maxPostLength', '0'), 10);
    if (maxPostWords > 0 && countWords(content) > maxPostWords) {
      return res.status(400).json({ message: 'post_too_long', maxWords: maxPostWords });
    }

    // Status logic
    let postStatus = 'pending';

    const { user_account: userModel, mentor } = require('../sequelize/models/index');
    const userRecord = await userModel.findByPk(req.user.userId, { attributes: ['role'] });
    const isMentor = await mentor.findOne({ where: { userId: req.user.userId, status: 'active' }, attributes: ['id'] });
    const isAdminOrMod = userRecord?.role === 'admin' || userRecord?.role === 'moderator' || !!isMentor;

    // autoPublish setting overrides requireApproval for non-admin users
    const autoPublish = await isForumFeatureEnabled('autoPublish');

    if (isAdminOrMod) {
      postStatus = 'published';
    } else if (autoPublish) {
      postStatus = 'published';
    } else if (access.status?.role === 'vip' && !access.restricted && type !== 'article') {
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
      videos: videos || [],
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

    // Gamification (async, non-blocking)
    let newBadges = [];
    let creditsEarned = 0;
    if (postStatus === 'published') {
      try {
        newBadges = await checkAndAwardBadges(req.user.userId);
        creditsEarned = await awardForumCredits(req.user.userId, 'forum_post', post.id, post.title);
        recalculateReputation(req.user.userId).catch(() => {});
      } catch (e) { /* non-blocking */ }
    }

    // Real-time: broadcast new post to feed
    if (postStatus === 'published') {
      const io = req.app.get('io');
      if (io) {
        io.to('forum:feed').emit('forum:newPost', {
          post: { id: post.id, title: post.title, slug: post.slug, type: post.type, authorId: post.authorId },
        });
      }
    }

    res.status(201).json({ post, newBadges, creditsEarned, message: postStatus === 'pending' ? 'post_pending_approval' : 'post_published' });
  } catch (err) {
    next(err);
  }
});

// PUT /forum/posts/:id
forumController.put('/posts/:id', isAuth, validateBody(forumPostUpdateSchema), async (req, res, next) => {
  try {
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (Number(post.authorId) !== Number(req.user.userId)) return res.status(403).json({ message: 'Not your post' });

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
    if (Number(post.authorId) !== Number(req.user.userId)) return res.status(403).json({ message: 'Not your post' });

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
    const post = await forum_post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.isLocked) return res.status(403).json({ message: 'post_locked' });

    const { content, parentId, images, mentionedUsers, quotedCommentId } = req.body;

    // Feature check: file uploads
    if (images?.length && !(await isForumFeatureEnabled('allowFileUploads'))) {
      return res.status(403).json({ message: 'file_uploads_disabled' });
    }

    // Word limit check
    const maxCommentWords = parseInt(await getForumSetting('maxCommentLength', '0'), 10);
    if (maxCommentWords > 0 && content && countWords(content) > maxCommentWords) {
      return res.status(400).json({ message: 'comment_too_long', maxWords: maxCommentWords });
    }

    // Must have content or images
    if (!content?.trim() && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Comment must have text or images' });
    }

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

    // Notify post author about new comment
    const { user_notification, admin_notification, user_account: ua } = require('../sequelize/models/index');
    const { sendPushToUser } = require('../utils/pushNotifications');
    if (post.authorId !== req.user.userId) {
      // Check if author is admin/moderator
      const authorAccount = await ua.findByPk(post.authorId, { attributes: ['role'] });
      const isAdminAuthor = authorAccount?.role === 'admin' || authorAccount?.role === 'moderator';

      if (isAdminAuthor) {
        await admin_notification.create({
          type: 'forum_comment',
          title: 'Нов коментар на вашата публикация',
          message: `Нов коментар на "${post.title}"`,
          data: { postSlug: post.slug, commentId: comment.id },
        }).catch(() => {});
      } else {
        await user_notification.create({
          userId: post.authorId,
          type: 'forum_comment',
          title: 'Нов коментар на вашата публикация',
          message: `Нов коментар на "${post.title}"`,
          data: { postSlug: post.slug, commentId: comment.id },
        }).catch(() => {});
      }
      // Push notification
      sendPushToUser(post.authorId, {
        title: 'Нов коментар',
        body: `Нов коментар на "${post.title}"`,
        url: `/academy/community/${post.slug}`,
      }).catch(() => {});
    }

    // Notify parent comment author about reply
    if (parentId) {
      const parentComment = await forum_comment.findByPk(parentId, { attributes: ['authorId'] });
      if (parentComment && parentComment.authorId !== req.user.userId && parentComment.authorId !== post.authorId) {
        await user_notification.create({
          userId: parentComment.authorId,
          type: 'forum_reply',
          title: 'Нов отговор на вашия коментар',
          message: `Отговориха на коментара ви в "${post.title}"`,
          data: { postSlug: post.slug, commentId: comment.id },
        }).catch(() => {});
      }
    }

    // Send notifications for @mentions
    if (mentionedUsers && mentionedUsers.length > 0) {
      for (const mentionedUserId of mentionedUsers) {
        if (mentionedUserId !== req.user.userId && mentionedUserId !== post.authorId) {
          await user_notification.create({
            userId: mentionedUserId,
            type: 'forum_mention',
            title: 'Споменаха ви във форума',
            message: `Споменаха ви в коментар на "${post.title}"`,
            data: { postSlug: post.slug, commentId: comment.id },
          }).catch(() => {});
        }
      }
    }

    // Email notifications (async, non-blocking)
    if (await isForumFeatureEnabled('emailNotifications')) {
      const commenter = await user_account.findByPk(req.user.userId, {
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        attributes: ['id', 'email'],
      });
      const commenterName = commenter?.details
        ? `${commenter.details.firstName || ''} ${commenter.details.lastName || ''}`.trim() || 'Потребител'
        : 'Потребител';
      const plainContent = (content || '').replace(/<[^>]+>/g, '').trim();

      // Email to post author
      if (post.authorId !== req.user.userId) {
        const postAuthor = await user_account.findByPk(post.authorId, {
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
          attributes: ['id', 'email'],
        });
        if (postAuthor?.email) {
          const authorName = postAuthor.details
            ? `${postAuthor.details.firstName || ''} ${postAuthor.details.lastName || ''}`.trim()
            : '';
          const template = forumEmailTemplates.newComment({
            userName: authorName, commenterName, postTitle: post.title,
            commentPreview: plainContent, postSlug: post.slug,
          });
          forwardEmailsViaZoho({
            userEmail: 'info@pensa.club', subject: template.subject,
            body: '', toAddresses: postAuthor.email, formattedBody: template.html,
          }).catch(err => console.error('Forum email error:', err.message));
        }
      }

      // Email to parent comment author (reply)
      if (parentId) {
        const parentComment = await forum_comment.findByPk(parentId, { attributes: ['authorId'] });
        if (parentComment && parentComment.authorId !== req.user.userId && parentComment.authorId !== post.authorId) {
          const parentAuthor = await user_account.findByPk(parentComment.authorId, {
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
            attributes: ['id', 'email'],
          });
          if (parentAuthor?.email) {
            const parentName = parentAuthor.details
              ? `${parentAuthor.details.firstName || ''} ${parentAuthor.details.lastName || ''}`.trim()
              : '';
            const template = forumEmailTemplates.newReply({
              userName: parentName, replierName: commenterName, postTitle: post.title,
              replyPreview: plainContent, postSlug: post.slug,
            });
            forwardEmailsViaZoho({
              userEmail: 'info@pensa.club', subject: template.subject,
              body: '', toAddresses: parentAuthor.email, formattedBody: template.html,
            }).catch(err => console.error('Forum email error:', err.message));
          }
        }
      }
    }

    // Gamification
    let newBadges = [];
    let creditsEarned = 0;
    try {
      newBadges = await checkAndAwardBadges(req.user.userId);
      creditsEarned = await awardForumCredits(req.user.userId, 'forum_comment', comment.id, post.title);
      recalculateReputation(req.user.userId).catch(() => {});
    } catch (e) { /* non-blocking */ }

    // Reload with author
    const full = await forum_comment.findByPk(comment.id, { include: [authorInclude] });

    // Real-time: emit new comment to post room
    const io = req.app.get('io');
    if (io) {
      io.to(`forum:post:${post.id}`).emit('forum:newComment', { comment: full, postId: post.id });
      // Notify post author
      if (post.authorId !== req.user.userId) {
        io.to(`user:${post.authorId}`).emit('notification:new', {
          type: 'forum_comment',
          title: post.title,
          postSlug: post.slug,
        });
      }
    }

    res.status(201).json({ comment: full, newBadges, creditsEarned });
  } catch (err) {
    next(err);
  }
});

// PUT /forum/comments/:id
forumController.put('/comments/:id', isAuth, validateBody(forumCommentUpdateSchema), async (req, res, next) => {
  try {
    const comment = await forum_comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (Number(comment.authorId) !== Number(req.user.userId)) {
      return res.status(403).json({ message: 'Not your comment' });
    }

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

    // Owner or admin can delete
    const { user_account: userModel } = require('../sequelize/models/index');
    const reqUser = await userModel.findByPk(req.user.userId, { attributes: ['role'] });
    const isOwner = Number(comment.authorId) === Number(req.user.userId);
    const isAdminUser = reqUser?.role === 'admin' || reqUser?.role === 'moderator';

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ message: 'Not your comment' });
    }

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
    if (!(await isForumFeatureEnabled('enableReactions'))) {
      return res.status(403).json({ message: 'reactions_disabled' });
    }

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

    // Gamification: check badges for reactor + content author
    try {
      checkAndAwardBadges(req.user.userId).catch(() => {});
      const target = targetType === 'post'
        ? await forum_post.findByPk(targetId, { attributes: ['authorId'] })
        : await forum_comment.findByPk(targetId, { attributes: ['authorId'] });
      if (target && target.authorId !== req.user.userId) {
        checkAndAwardBadges(target.authorId).catch(() => {});
        recalculateReputation(target.authorId).catch(() => {});
      }
    } catch (e) { /* non-blocking */ }

    res.json({ action: 'added', emoji });
  } catch (err) {
    next(err);
  }
});

// POST /forum/bookmarks/:postId
forumController.post('/bookmarks/:postId', isAuth, async (req, res, next) => {
  try {
    if (!(await isForumFeatureEnabled('enableBookmarks'))) {
      return res.status(403).json({ message: 'bookmarks_disabled' });
    }

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
      order: [['created_at', 'DESC']],
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
    if (!(await isForumFeatureEnabled('enableReports'))) {
      return res.status(403).json({ message: 'reports_disabled' });
    }

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
      const setting = await site_setting.findOne({ where: { key: { [Op.in]: ['forum_maxReportsBeforeHide', 'forum_reports_to_auto_hide'] } }, order: [['key', 'DESC']] });
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
    if (!(await isForumFeatureEnabled('enableSpaces'))) {
      return res.status(403).json({ message: 'spaces_disabled' });
    }

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
