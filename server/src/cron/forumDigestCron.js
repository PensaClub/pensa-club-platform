/**
 * Forum Weekly Digest — sends top posts email every Monday at 10:00
 */
const cron = require('node-cron');

const startForumDigestCron = () => {
  cron.schedule('0 10 * * 1', async () => {
    console.log('[Forum Digest] Running weekly digest...');
    try {
      const { Op } = require('sequelize');
      const {
        forum_post, user_account, user_details, site_setting,
      } = require('../sequelize/models/index');
      const forumEmailTemplates = require('../utils/forumEmailTemplates');
      const { forwardEmailsViaZoho } = require('../utils/zohoEmails');

      // Check if email notifications are enabled
      const emailSetting = await site_setting.findOne({ where: { key: 'forum_emailNotifications' } });
      if (emailSetting && emailSetting.value === 'false') {
        console.log('[Forum Digest] Email notifications disabled, skipping.');
        return;
      }

      // Get top 5 posts from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const topPosts = await forum_post.findAll({
        where: {
          status: 'published',
          createdAt: { [Op.gte]: weekAgo },
        },
        order: [
          ['reactionCount', 'DESC'],
          ['commentCount', 'DESC'],
          ['viewCount', 'DESC'],
        ],
        limit: 5,
        attributes: ['id', 'title', 'slug', 'commentCount', 'reactionCount', 'viewCount', 'authorId'],
        include: [{
          model: user_account,
          as: 'author',
          attributes: ['id'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        }],
      });

      if (topPosts.length === 0) {
        console.log('[Forum Digest] No posts this week, skipping.');
        return;
      }

      const postsData = topPosts.map(p => ({
        title: p.title,
        slug: p.slug,
        commentCount: p.commentCount,
        reactionCount: p.reactionCount,
        authorName: p.author?.details
          ? `${p.author.details.firstName || ''} ${p.author.details.lastName || ''}`.trim()
          : 'Потребител',
      }));

      const weekLabel = `${weekAgo.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })} – ${new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`;

      // Get all users with student role (forum participants)
      const recipients = await user_account.findAll({
        where: { role: { [Op.in]: ['student', 'user'] }, finished: true },
        attributes: ['id', 'email'],
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
      });

      console.log(`[Forum Digest] Sending to ${recipients.length} users...`);

      let sent = 0;
      for (const user of recipients) {
        try {
          const userName = user.details
            ? `${user.details.firstName || ''} ${user.details.lastName || ''}`.trim()
            : '';
          const template = forumEmailTemplates.weeklyDigest({
            userName,
            topPosts: postsData,
            weekLabel,
          });

          await forwardEmailsViaZoho({
            userEmail: 'info@pensa.club',
            subject: template.subject,
            body: '',
            toAddresses: user.email,
            formattedBody: template.html,
          });
          sent++;
        } catch (err) {
          console.error(`[Forum Digest] Error sending to ${user.email}:`, err.message);
        }
      }

      console.log(`[Forum Digest] Done. Sent ${sent}/${recipients.length} emails.`);
    } catch (err) {
      console.error('[Forum Digest] Error:', err);
    }
  }, {
    timezone: 'Europe/Sofia',
  });

  console.log('[Forum Digest] Cron scheduled (Monday 10:00 Sofia)');
};

module.exports = { startForumDigestCron };
