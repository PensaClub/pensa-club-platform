/**
 * Monthly Report Cron — runs on the 1st of every month at 09:00 Sofia time.
 * Aggregates the previous month's activity (new content + top seminars /
 * articles / courses + upcoming items) and delivers a digest email to
 * subscribers who have the `platform` preference enabled.
 */
const cron = require('node-cron');

const startMonthlyReportCron = () => {
    cron.schedule(
        '0 9 1 * *',
        async () => {
            console.log('[Monthly Report] Running...');
            try {
                const { Op } = require('sequelize');
                const models = require('../sequelize/models/index');
                const { newsletter, notification_queue } = models;
                const {
                    monthlyReport,
                    formatMonthLabel,
                } = require('../utils/newsletterTemplates');
                const monthlyAggregator = require('../utils/monthlyReportAggregator');
                const { sendNewsletterToAll } = require('../utils/newsletterSender');

                // Previous-month range + next-month range for "upcoming"
                const { from, to } = monthlyAggregator.getPreviousMonthRange();
                const nextRange = monthlyAggregator.getNextMonthRange();
                const monthLabel = formatMonthLabel(from);

                // Data aggregation (limit defaults to 3 — admin can override via run-now)
                const [stats, topSeminars, topArticles, topCourses, upcoming] =
                    await Promise.all([
                        monthlyAggregator.getMonthlyStats(from, to),
                        monthlyAggregator.getTopSeminarsByAttendance(from, to, 3),
                        monthlyAggregator.getTopArticlesByViews(from, to, 3),
                        monthlyAggregator.getTopCoursesByViews(from, to, 3),
                        monthlyAggregator.getUpcomingNextMonth(
                            nextRange.from,
                            nextRange.to,
                        ),
                    ]);

                // Collect admin-curated platform updates sitting in the queue
                // (events with category='platform' and status='monthly_pending').
                const platformItems = await notification_queue.findAll({
                    where: {
                        status: 'monthly_pending',
                        category: 'platform',
                    },
                    order: [['createdAt', 'ASC']],
                });

                const platformUpdatesHtml = platformItems.length
                    ? platformItems
                          .map((row) => {
                              const title = row.referenceTitle || '';
                              const desc = row.description || '';
                              return `<p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.65;">
                                  <strong style="color:#1f2937;">${title}</strong>
                                  ${desc ? `<br>${desc}` : ''}
                              </p>`;
                          })
                          .join('')
                    : '';

                const title = `📊 Месечно от Pensa Club — ${monthLabel}`;

                // Persist the newsletter row so it shows up in the admin list
                // with its sent count + recipient history.
                const record = await newsletter.create({
                    title,
                    subject: title,
                    body: monthlyReport({
                        subscriberName: '',
                        monthLabel,
                        stats,
                        topSeminars,
                        topArticles,
                        topCourses,
                        upcoming,
                        platformUpdatesHtml,
                        unsubscribeToken: null,
                    }),
                    type: 'monthly',
                    status: 'sending',
                    targetCategories: ['platform'],
                    platformUpdates: platformUpdatesHtml || null,
                });

                const result = await sendNewsletterToAll({
                    models,
                    item: record,
                    renderPerSubscriber: ({ subscriberName, unsubscribeToken }) =>
                        monthlyReport({
                            subscriberName,
                            monthLabel,
                            stats,
                            topSeminars,
                            topArticles,
                            topCourses,
                            upcoming,
                            platformUpdatesHtml,
                            unsubscribeToken,
                        }),
                });

                // Mark processed platform-queue items as sent
                if (platformItems.length > 0) {
                    await notification_queue.update(
                        { status: 'sent', processedAt: new Date() },
                        {
                            where: {
                                id: { [Op.in]: platformItems.map((r) => r.id) },
                            },
                        },
                    );
                }

                console.log(
                    `[Monthly Report] Done. sent=${result.sent} failed=${result.failed} of ${result.total}. Platform items processed: ${platformItems.length}`,
                );
            } catch (err) {
                console.error('[Monthly Report] Error:', err);
            }
        },
        { timezone: 'Europe/Sofia' },
    );

    console.log('[Monthly Report] Cron scheduled (1st of month, 09:00 Sofia)');
};

module.exports = { startMonthlyReportCron };
