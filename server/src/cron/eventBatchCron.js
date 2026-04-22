/**
 * Event Batch Cron — runs once a day at 09:00 Sofia time. Collects pending
 * notification_queue rows (created when admins publish new
 * seminars/articles/courses/etc.) and delivers a single "What's new in
 * Pensa Club" email per subscriber.
 *
 * Schedule + enabled flag are read from `cron_settings` (key: eventBatch).
 */
const cron = require('node-cron');
const {
    getCronConfig,
    isCronEnabled,
    recordCronRun,
} = require('../utils/cronHelpers');

const CRON_KEY = 'eventBatch';
const DEFAULT_SCHEDULE = '0 9 * * *';
const DEFAULT_TIMEZONE = 'Europe/Sofia';
const DEFAULT_DESCRIPTION = 'Реактивни известия — всеки ден 09:00 Sofia';

const startEventBatchCron = async () => {
    const config = await getCronConfig(CRON_KEY, {
        schedule: DEFAULT_SCHEDULE,
        timezone: DEFAULT_TIMEZONE,
        description: DEFAULT_DESCRIPTION,
    }).catch((e) => {
        console.error('[Event Batch] Failed to load config — using defaults:', e.message);
        return { schedule: DEFAULT_SCHEDULE, timezone: DEFAULT_TIMEZONE };
    });

    cron.schedule(
        config.schedule,
        async () => {
            if (!(await isCronEnabled(CRON_KEY))) {
                console.log('[Event Batch] Skipped (disabled in admin).');
                await recordCronRun(CRON_KEY, { status: 'skipped' });
                return;
            }
            const startedAt = Date.now();
            try {
                const { processEventBatch } = require('../utils/eventBatchSender');
                const result = await processEventBatch();
                if (result.processed > 0) {
                    console.log(
                        `[event-batch] processed=${result.processed} recipients=${result.recipients} sent=${result.sent} failed=${result.failed}`,
                    );
                }
                await recordCronRun(CRON_KEY, {
                    status: result.failed > 0 && result.sent === 0 ? 'failed' : 'success',
                    subscribers: result.sent || 0,
                    durationMs: Date.now() - startedAt,
                });
            } catch (err) {
                console.error('[event-batch] cron error:', err?.message || err);
                await recordCronRun(CRON_KEY, {
                    status: 'failed',
                    durationMs: Date.now() - startedAt,
                    error: err?.message || String(err),
                });
            }
        },
        { timezone: config.timezone },
    );

    console.log(`[Event Batch] Cron scheduled (${config.schedule} ${config.timezone})`);
};

module.exports = { startEventBatchCron };
