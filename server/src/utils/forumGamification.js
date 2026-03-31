/**
 * Forum Gamification — badges, credits, reputation
 */

const { Op } = require('sequelize');

const getForumSetting = async (key, defaultValue = null) => {
  const { site_setting } = require('../sequelize/models/index');
  const setting = await site_setting.findOne({ where: { key: `forum_${key}` } });
  return setting ? setting.value : defaultValue;
};

const BADGE_DEFINITIONS = {
  first_post:           { emoji: '📝', milestone: 'posts >= 1' },
  first_comment:        { emoji: '💬', milestone: 'comments >= 1' },
  contributor_10:       { emoji: '⭐', milestone: 'posts >= 10' },
  helper_25:            { emoji: '🤝', milestone: 'comments >= 25' },
  veteran_50:           { emoji: '🏆', milestone: 'posts >= 50' },
  popular_post:         { emoji: '🔥', milestone: 'post with 50+ reactions' },
  conversation_starter: { emoji: '💡', milestone: 'post with 20+ comments' },
  post_of_week:         { emoji: '👑', milestone: 'awarded post of week' },
  reactor_100:          { emoji: '⚡', milestone: 'reactions given >= 100' },
  bookmarked_10:        { emoji: '📌', milestone: 'bookmarks received >= 10' },
};

const CREDIT_AMOUNTS = {
  forum_post: 5,
  forum_comment: 2,
  forum_post_of_week: 25,
  forum_popular_post: 10,
};

const CREDIT_SETTING_MAP = {
  forum_post: 'creditsForPost',
  forum_comment: 'creditsForComment',
  forum_post_of_week: 'creditsForPostOfWeek',
  forum_popular_post: 'creditsForPopularPost',
};

/**
 * Get credit amount from site_settings, fallback to CREDIT_AMOUNTS
 */
const getCreditAmount = async (sourceType) => {
  const settingKey = CREDIT_SETTING_MAP[sourceType];
  if (!settingKey) return CREDIT_AMOUNTS[sourceType] || 0;

  try {
    const { site_setting } = require('../sequelize/models/index');
    const setting = await site_setting.findOne({ where: { key: `forum_${settingKey}` } });
    if (setting) {
      const val = parseInt(setting.value, 10);
      return isNaN(val) ? CREDIT_AMOUNTS[sourceType] : val;
    }
  } catch (e) { /* fallback */ }
  return CREDIT_AMOUNTS[sourceType] || 0;
};

/**
 * Check if user is admin, moderator or mentor (they don't earn credits/badges)
 */
const isPrivilegedUser = async (userId) => {
  const { user_account, mentor } = require('../sequelize/models/index');
  const user = await user_account.findByPk(userId, { attributes: ['role'] });
  if (user?.role === 'admin' || user?.role === 'moderator') return true;
  const isMentor = await mentor.findOne({ where: { userId, status: 'active' }, attributes: ['id'] });
  return !!isMentor;
};

/**
 * Auto-promote user to 'student' role if they are a regular 'user'
 * Required to earn credits (Academy credits system needs student role)
 */
const ensureStudentRole = async (userId) => {
  const { user_account } = require('../sequelize/models/index');
  const user = await user_account.findByPk(userId, { attributes: ['id', 'role'] });
  if (user && user.role === 'user') {
    await user.update({ role: 'student' });
  }
};

/**
 * Check milestones and award new badges
 * @returns {string[]} Array of newly awarded badge keys
 */
const checkAndAwardBadges = async (userId) => {
  // Admins, moderators and mentors don't earn badges
  if (await isPrivilegedUser(userId)) return [];

  const {
    forum_post, forum_comment, forum_reaction, forum_bookmark,
    forum_user_badge,
  } = require('../sequelize/models/index');

  const newBadges = [];

  // Counts
  const postCount = await forum_post.count({ where: { authorId: userId, status: 'published' } });
  const commentCount = await forum_comment.count({ where: { authorId: userId, status: 'visible' } });
  const reactionsGiven = await forum_reaction.count({ where: { userId } });

  // Read badge thresholds from settings (fallback to defaults)
  const contributorThreshold = parseInt(await getForumSetting('badgePostsForContributor', '10'), 10) || 10;
  const helperThreshold = parseInt(await getForumSetting('badgeCommentsForHelper', '25'), 10) || 25;
  const veteranThreshold = parseInt(await getForumSetting('badgePostsForVeteran', '50'), 10) || 50;
  const popularThreshold = parseInt(await getForumSetting('badgeReactionsForPopular', '50'), 10) || 50;
  const conversationThreshold = parseInt(await getForumSetting('badgeCommentsForConversation', '20'), 10) || 20;
  const reactorThreshold = parseInt(await getForumSetting('badgeReactionsGivenForReactor', '100'), 10) || 100;
  const bookmarkThreshold = parseInt(await getForumSetting('badgeBookmarksForValuable', '10'), 10) || 10;

  // Posts with high reactions / comments
  const popularPost = await forum_post.findOne({
    where: { authorId: userId, status: 'published', reactionCount: { [Op.gte]: popularThreshold } },
    attributes: ['id'],
  });
  const conversationPost = await forum_post.findOne({
    where: { authorId: userId, status: 'published', commentCount: { [Op.gte]: conversationThreshold } },
    attributes: ['id'],
  });

  // Bookmarks received (sum of bookmarkCount on user's posts)
  const bookmarksResult = await forum_post.sum('bookmarkCount', {
    where: { authorId: userId, status: 'published' },
  });
  const bookmarksReceived = bookmarksResult || 0;

  // Badge checks
  const checks = [
    { badge: 'first_post', condition: postCount >= 1 },
    { badge: 'first_comment', condition: commentCount >= 1 },
    { badge: 'contributor_10', condition: postCount >= contributorThreshold },
    { badge: 'helper_25', condition: commentCount >= helperThreshold },
    { badge: 'veteran_50', condition: postCount >= veteranThreshold },
    { badge: 'popular_post', condition: !!popularPost },
    { badge: 'conversation_starter', condition: !!conversationPost },
    { badge: 'reactor_100', condition: reactionsGiven >= reactorThreshold },
    { badge: 'bookmarked_10', condition: bookmarksReceived >= bookmarkThreshold },
  ];

  for (const { badge, condition } of checks) {
    if (!condition) continue;
    const [, created] = await forum_user_badge.findOrCreate({
      where: { userId, badge },
      defaults: { userId, badge, awardedAt: new Date() },
    });
    if (created) newBadges.push(badge);
  }

  return newBadges;
};

/**
 * Award forum credits (idempotent per sourceType+sourceId)
 * @returns {number} credits awarded (0 if already awarded)
 */
const awardForumCredits = async (userId, sourceType, sourceId, sourceTitle) => {
  // Admins, moderators and mentors don't earn credits
  if (await isPrivilegedUser(userId)) return 0;

  // Always read from settings, fallback to CREDIT_AMOUNTS defaults
  const finalAmount = await getCreditAmount(sourceType);

  // 0 means credits disabled for this action
  if (finalAmount <= 0) return 0;

  // Auto-promote 'user' to 'student' so they can earn credits
  await ensureStudentRole(userId);

  const { user_credits, user_credits_history } = require('../sequelize/models/index');

  // Idempotency check
  const existing = await user_credits_history.findOne({
    where: { userId, sourceType, sourceId },
  });
  if (existing) return 0;

  // Get or create user credits
  const [credits] = await user_credits.findOrCreate({
    where: { userId },
    defaults: { userId, totalCredits: 0 },
  });

  const creditsBefore = credits.totalCredits;
  const creditsAfter = creditsBefore + finalAmount;

  // Update total
  credits.totalCredits = creditsAfter;

  // Update level
  if (creditsAfter > 300) credits.level = 'master';
  else if (creditsAfter > 150) credits.level = 'advanced';
  else if (creditsAfter > 50) credits.level = 'intermediate';
  else credits.level = 'beginner';

  await credits.save();

  // Create history entry
  await user_credits_history.create({
    userId,
    creditsAmount: finalAmount,
    creditsBefore,
    creditsAfter,
    sourceType,
    sourceId,
    sourceTitle,
    category: 'Форум общност',
    description: `${sourceType}: ${sourceTitle}`,
  });

  return finalAmount;
};

/**
 * Recalculate reputation score for a user
 */
const recalculateReputation = async (userId) => {
  // Admins, moderators and mentors don't have reputation score
  if (await isPrivilegedUser(userId)) return 0;

  const {
    forum_post, forum_comment, forum_user_badge, forum_user_status,
  } = require('../sequelize/models/index');

  const postCount = await forum_post.count({ where: { authorId: userId, status: 'published' } });
  const commentCount = await forum_comment.count({ where: { authorId: userId, status: 'visible' } });

  // Sum reactions received on user's posts
  const postReactions = await forum_post.sum('reactionCount', {
    where: { authorId: userId, status: 'published' },
  }) || 0;

  // Sum reactions received on user's comments
  const commentReactions = await forum_comment.sum('reactionCount', {
    where: { authorId: userId, status: 'visible' },
  }) || 0;

  const reactionsReceived = postReactions + commentReactions;

  // Bookmarks received
  const bookmarksReceived = await forum_post.sum('bookmarkCount', {
    where: { authorId: userId, status: 'published' },
  }) || 0;

  // Post of week count
  const postOfWeekCount = await forum_user_badge.count({
    where: { userId, badge: 'post_of_week' },
  });

  // Warning count
  const status = await forum_user_status.findOne({ where: { userId }, attributes: ['warningCount'] });
  const warnings = status?.warningCount || 0;

  // Formula
  const score = (postCount * 10) + (commentCount * 3) + (reactionsReceived * 2)
    + (bookmarksReceived * 5) + (postOfWeekCount * 50) - (warnings * 20);

  await forum_user_status.update(
    { reputationScore: Math.max(0, score) },
    { where: { userId } }
  );

  return Math.max(0, score);
};

module.exports = {
  BADGE_DEFINITIONS,
  CREDIT_AMOUNTS,
  checkAndAwardBadges,
  awardForumCredits,
  recalculateReputation,
};
