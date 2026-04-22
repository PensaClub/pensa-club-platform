/**
 * Scheduled Newsletter Cron — runs every 15 minutes.
 * Finds newsletters with status='scheduled' and scheduledAt <= now,
 * then sends each through the shared sender. Fire-and-forget per item.
 *
 * Schedule + enabled flag are read from `cron_settings` (key: scheduledNewsletter).
 */
const cron = require('node-cron');
const {
    getCronConfig,
    isCronEnabled,
    recordCronRun,
} = require('../utils/cronHelpers');

const CRON_KEY = 'scheduledNewsletter';
const DEFAULT_SCHEDULE = '*/15 * * * *';
const DEFAULT_TIMEZONE = 'Europe/Sofia';
const DEFAULT_DESCRIPTION = 'Планирани бюлетини — на всеки 15 минути';

const startScheduledNewsletterCron = async () => {
    const config = await getCronConfig(CRON_KEY, {
        schedule: DEFAULT_SCHEDULE,
        timezone: DEFAULT_TIMEZONE,
        description: DEFAULT_DESCRIPTION,
    }).catch((e) => {
        console.error('[Scheduled Newsletter] Failed to load config — using defaults:', e.message);
        return { schedule: DEFAULT_SCHEDULE, timezone: DEFAULT_TIMEZONE };
    });

    cron.schedule(
        config.schedule,
        async () => {
            if (!(await isCronEnabled(CRON_KEY))) {
                await recordCronRun(CRON_KEY, { status: 'skipped' });
                return;
            }
            const startedAt = Date.now();
            let totalSent = 0;
            try {
                const { Op } = require('sequelize');
                const models = require('../sequelize/models/index');
                const { newsletter } = models;
                const { sendNewsletterToAll } = require('../utils/newsletterSender');

                const due = await newsletter.findAll({
                    where: {
                        status: 'scheduled',
                        scheduledAt: { [Op.lte]: new Date() },
                    },
                    order: [['scheduledAt', 'ASC']],
                    limit: 10,
                });

                if (due.length === 0) {
                    await recordCronRun(CRON_KEY, {
                        status: 'success',
                        subscribers: 0,
                        durationMs: Date.now() - startedAt,
                    });
                    return;
                }

                console.log(`[scheduled-newsletter] Found ${due.length} due newsletters`);

                for (const item of due) {
                    try {
                        const result = await sendNewsletterToAll({ models, item });
                        totalSent += result.sent || 0;
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
                await recordCronRun(CRON_KEY, {
                    status: 'success',
                    subscribers: totalSent,
                    durationMs: Date.now() - startedAt,
                });
            } catch (err) {
                console.error('[scheduled-newsletter] cron error:', err);
                await recordCronRun(CRON_KEY, {
                    status: 'failed',
                    subscribers: totalSent,
                    durationMs: Date.now() - startedAt,
                    error: err?.message || String(err),
                });
            }
        },
        { timezone: config.timezone },
    );

    console.log(`[Scheduled Newsletter] Cron scheduled (${config.schedule} ${config.timezone})`);
};

module.exports = { startScheduledNewsletterCron };
