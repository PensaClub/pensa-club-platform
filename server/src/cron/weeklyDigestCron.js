/**
 * Weekly Newsletter Digest — sends to subscribers every Monday at 10:00
 * Collects new content from the last 7 days + upcoming events for next 7 days.
 * Filters per subscriber preferences.
 */
const cron = require('node-cron');

const CATEGORY_CONFIG = [
  { key: 'seminars', emoji: '🎓', title: 'Нови семинари' },
  { key: 'courses', emoji: '📚', title: 'Нови курсове' },
  { key: 'articles', emoji: '📰', title: 'Нови статии' },
  { key: 'initiatives', emoji: '🚀', title: 'Нови инициативи' },
  { key: 'clubs', emoji: '🏠', title: 'Нови клубове' },
];

const startWeeklyDigestCron = () => {
  cron.schedule('0 10 * * 1', async () => {
    console.log('[Weekly Digest] Running...');
    try {
      const { Op } = require('sequelize');
      const {
        subscriber, subscriber_preference,
        article, mainImage,
        seminar, course,
        initiative, image,
        Club,
        newsletter,
      } = require('../sequelize/models/index');
      const { weeklyDigest } = require('../utils/newsletterTemplates');
      const { forwardEmailsViaZoho } = require('../utils/zohoEmails');

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);

      const weekLabel = `${weekAgo.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })} – ${new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}`;

      // ── Collect new content ──

      const allSections = {};

      // Seminars
      try {
        const newSeminars = await seminar.findAll({
          where: { isPublished: true, createdAt: { [Op.gte]: weekAgo } },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'slug', 'shortDescription', 'scheduledDate'],
          limit: 5,
        });
        allSections.seminars = newSeminars.map(s => ({
          title: s.title,
          meta: s.scheduledDate ? new Date(s.scheduledDate).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '',
          url: `https://pensa.club/academy/seminars/${s.slug || s.id}`,
        }));
      } catch (e) { console.error('[Weekly Digest] seminars error:', e.message); allSections.seminars = []; }

      // Courses
      try {
        const newCourses = await course.findAll({
          where: { status: 'active', createdAt: { [Op.gte]: weekAgo } },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'name', 'slug', 'shortDescription'],
          limit: 5,
        });
        allSections.courses = newCourses.map(c => ({
          title: c.name,
          meta: c.shortDescription ? c.shortDescription.substring(0, 80) : '',
          url: `https://pensa.club/academy/courses/${c.slug || c.id}`,
        }));
      } catch (e) { console.error('[Weekly Digest] courses error:', e.message); allSections.courses = []; }

      // Articles
      try {
        const newArticles = await article.findAll({
          where: { createdAt: { [Op.gte]: weekAgo } },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'slug', 'summary'],
          limit: 5,
        });
        allSections.articles = newArticles.map(a => ({
          title: a.title,
          meta: a.summary ? a.summary.substring(0, 80) : '',
          url: `https://pensa.club/articles/${a.slug || a.id}`,
        }));
      } catch (e) { console.error('[Weekly Digest] articles error:', e.message); allSections.articles = []; }

      // Initiatives
      try {
        const newInitiatives = await initiative.findAll({
          where: { createdAt: { [Op.gte]: weekAgo } },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'title', 'slug', 'shortDescription'],
          limit: 5,
        });
        allSections.initiatives = newInitiatives.map(i => ({
          title: i.title,
          meta: '',
          url: `https://pensa.club/initiatives/${i.slug || i.id}`,
        }));
      } catch (e) { console.error('[Weekly Digest] initiatives error:', e.message); allSections.initiatives = []; }

      // Clubs
      try {
        const newClubs = await Club.findAll({
          where: { status: 'active', createdAt: { [Op.gte]: weekAgo } },
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'name', 'slug'],
          limit: 5,
        });
        allSections.clubs = newClubs.map(c => ({
          title: c.name,
          meta: '',
          url: `https://pensa.club/clubs/${c.slug || c.id}`,
        }));
      } catch (e) { console.error('[Weekly Digest] clubs error:', e.message); allSections.clubs = []; }

      // ── Upcoming events (next 7 days) ──

      let upcoming = [];
      try {
        const upcomingSeminars = await seminar.findAll({
          where: {
            isPublished: true,
            scheduledDate: { [Op.between]: [new Date(), weekAhead] },
          },
          order: [['scheduledDate', 'ASC']],
          attributes: ['id', 'title', 'slug', 'scheduledDate'],
          limit: 5,
        });
        upcoming = upcomingSeminars.map(s => ({
          title: s.title,
          date: new Date(s.scheduledDate).toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
          url: `https://pensa.club/academy/seminars/${s.slug || s.id}`,
        }));
      } catch (e) { console.error('[Weekly Digest] upcoming error:', e.message); }

      // ── Check if there's any content ──

      const hasContent = Object.values(allSections).some(s => s.length > 0) || upcoming.length > 0;
      if (!hasContent) {
        console.log('[Weekly Digest] No new content this week, skipping.');
        return;
      }

      // ── Get active subscribers with preferences ──

      const subscribers = await subscriber.findAll({
        where: { status: 'active' },
        include: [{
          model: subscriber_preference,
          as: 'preferences',
          attributes: ['category', 'enabled'],
        }],
      });

      if (subscribers.length === 0) {
        console.log('[Weekly Digest] No subscribers, skipping.');
        return;
      }

      console.log(`[Weekly Digest] Sending to ${subscribers.length} subscribers...`);

      let sent = 0;
      let newsletterRecord;

      try {
        newsletterRecord = await newsletter.create({
          title: `Седмично от Pensa Club — ${weekLabel}`,
          subject: `📬 Седмично от Pensa Club — ${weekLabel}`,
          body: '',
          type: 'weekly_digest',
          status: 'sending',
          sentAt: new Date(),
        });
      } catch { /* ignore */ }

      for (const sub of subscribers) {
        try {
          const enabledCategories = new Set(
            (sub.preferences || [])
              .filter(p => p.enabled)
              .map(p => p.category)
          );

          // If no preferences set, include all
          const includeAll = enabledCategories.size === 0;

          const filteredSections = CATEGORY_CONFIG
            .filter(cfg => includeAll || enabledCategories.has(cfg.key))
            .map(cfg => ({
              emoji: cfg.emoji,
              title: cfg.title,
              items: allSections[cfg.key] || [],
            }))
            .filter(s => s.items.length > 0);

          if (filteredSections.length === 0 && upcoming.length === 0) continue;

          const template = weeklyDigest({
            subscriberName: sub.name,
            weekLabel,
            sections: filteredSections,
            upcoming,
            unsubscribeToken: sub.unsubscribeToken,
          });

          await forwardEmailsViaZoho({
            userEmail: 'info@pensa.club',
            subject: template.subject,
            body: '',
            toAddresses: sub.email,
            formattedBody: template.html,
          });

          sent++;

          // Rate limit — 1.5s between emails
          if (sent < subscribers.length) {
            await new Promise(r => setTimeout(r, 1500));
          }
        } catch (err) {
          console.error(`[Weekly Digest] Error sending to ${sub.email}:`, err.message);
        }
      }

      if (newsletterRecord) {
        await newsletterRecord.update({ status: 'sent', sentCount: sent });
      }

      console.log(`[Weekly Digest] Done. Sent ${sent}/${subscribers.length} emails.`);
    } catch (err) {
      console.error('[Weekly Digest] Error:', err);
    }
  }, {
    timezone: 'Europe/Sofia',
  });

  console.log('[Weekly Digest] Cron scheduled (Monday 10:00 Sofia)');
};

module.exports = { startWeeklyDigestCron };
