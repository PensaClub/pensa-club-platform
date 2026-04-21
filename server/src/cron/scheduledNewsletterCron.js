/**
 * Scheduled Newsletter Cron — runs every 15 minutes.
 * Finds newsletters with status='scheduled' and scheduledAt <= now,
 * then sends each through the shared sender. Fire-and-forget per item.
 */
const cron = require('node-cron');

const startScheduledNewsletterCron = () => {
    cron.schedule(
        '*/15 * * * *',
        async () => {
            try {
                const { Op } = require('sequelize');
                const {
                    newsletter,
                    newsletter_log,
                    subscriber,
                    subscriber_preference,
                } = require('../sequelize/models/index');
                const { sendNewsletterToAll } = require('../utils/newsletterSender');

                const due = await newsletter.findAll({
                    where: {
                        status: 'scheduled',
                        scheduledAt: { [Op.lte]: new Date() },
                    },
                    order: [['scheduledAt', 'ASC']],
                    limit: 10,
                });

                if (due.length === 0) return;

                console.log(`[scheduled-newsletter] Found ${due.length} due newsletters`);

                for (const item of due) {
                    try {
                        const result = await sendNewsletterToAll({
                            models: {
                                newsletter,
                                newsletter_log,
                                subscriber,
                                subscriber_preference,
                            },
                            item,
                        });
                        console.log(
                            `[scheduled-newsletter] #${item.id} sent=${result.sent} failed=${result.failed} total=${result.total}`,
                        );
                    } catch (err) {
                        console.error(
                            `[scheduled-newsletter] #${item.id} error:`,
                            err?.message || err,
                        );
                        try {
                            await item.update({ status: 'failed' });
                        } catch {
                            /* ignore */
                        }
                    }
                }
            } catch (err) {
                console.error('[scheduled-newsletter] cron error:', err);
            }
        },
        { timezone: 'Europe/Sofia' },
    );

    console.log('[Scheduled Newsletter] Cron scheduled (every 15 minutes, Sofia)');
};

module.exports = { startScheduledNewsletterCron };
