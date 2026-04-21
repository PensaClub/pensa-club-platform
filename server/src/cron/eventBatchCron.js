/**
 * Event Batch Cron — runs once a day at 09:00 Sofia time. Collects pending
 * notification_queue rows (created when admins publish new
 * seminars/articles/courses/etc.) and delivers a single "What's new in
 * Pensa Club" email per subscriber.
 *
 * Daily cadence keeps subscribers reliably informed without spamming their
 * inbox when multiple items are published in the same window.
 */
const cron = require('node-cron');

const startEventBatchCron = () => {
    cron.schedule(
        '0 9 * * *',
        async () => {
            try {
                const { processEventBatch } = require('../utils/eventBatchSender');
                const result = await processEventBatch();
                if (result.processed > 0) {
                    console.log(
                        `[event-batch] processed=${result.processed} recipients=${result.recipients} sent=${result.sent} failed=${result.failed}`,
                    );
                }
            } catch (err) {
                console.error('[event-batch] cron error:', err?.message || err);
            }
        },
        { timezone: 'Europe/Sofia' },
    );

    console.log('[Event Batch] Cron scheduled (daily 09:00 Sofia)');
};

module.exports = { startEventBatchCron };
