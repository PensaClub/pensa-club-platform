// server/src/cron/crawlerScheduler.js
//
// Phase 1 dynamic scheduler: keeps a node-cron task running per active bot,
// and re-syncs every 5 minutes so admin edits to scheduleCron / status take
// effect without a restart. One bot's failure must not poison the others.

const cron = require('node-cron');
const { runCrawlerCleanup } = require('../utils/crawlerCleanup');

const RESYNC_INTERVAL_MS = 5 * 60 * 1000;

// Map<botId, { cronExpr, task }>
const scheduledJobs = new Map();

// Daily 03:00 EEST TTL cleanup. Defined at module scope so it survives
// resyncs (it's not a per-bot job).
let cleanupTask = null;

const stopJob = (botId) => {
    const entry = scheduledJobs.get(botId);
    if (!entry) return;
    try { entry.task.stop(); } catch (_) { /* noop */ }
    scheduledJobs.delete(botId);
};

const startJob = (bot) => {
    const expr = bot.scheduleCron;
    if (!cron.validate(expr)) {
        console.warn(`[CrawlerScheduler] Bot ${bot.id} has invalid cron "${expr}", skipping`);
        return;
    }
    const task = cron.schedule(expr, async () => {
        try {
            // Lazy require to avoid circular import paths between models and
            // the engine when this module is required at boot.
            const { runBot } = require('../services/crawlerEngine');
            console.log(`[CrawlerScheduler] Tick bot=${bot.id} (${bot.name})`);
            const result = await runBot(bot.id, { trigger: 'cron' });
            console.log(`[CrawlerScheduler] Bot ${bot.id} -> ${result.status} seen=${result.itemsSeen} new=${result.itemsNew} errors=${result.errors.length}`);
        } catch (err) {
            console.error(`[CrawlerScheduler] Bot ${bot.id} crashed:`, err && err.message);
        }
    }, {
        timezone: 'Europe/Sofia',
    });
    scheduledJobs.set(bot.id, { cronExpr: expr, task });
};

const syncJobs = async () => {
    let bots;
    try {
        const { crawler_bot } = require('../sequelize/models');
        bots = await crawler_bot.findAll({
            where: { status: 'active' },
            attributes: ['id', 'name', 'scheduleCron', 'status'],
        });
    } catch (err) {
        console.error('[CrawlerScheduler] Failed to load bots:', err && err.message);
        return;
    }

    const seen = new Set();
    for (const bot of bots) {
        seen.add(bot.id);
        const existing = scheduledJobs.get(bot.id);
        if (!existing) {
            startJob(bot);
        } else if (existing.cronExpr !== bot.scheduleCron) {
            stopJob(bot.id);
            startJob(bot);
        }
    }

    // Stop jobs for bots that no longer exist or are no longer active.
    for (const botId of Array.from(scheduledJobs.keys())) {
        if (!seen.has(botId)) stopJob(botId);
    }
};

const startCleanupCron = () => {
    if (cleanupTask) return; // already started
    // Tick at the top of every hour — each bot decides internally if its
    // cleanupDay + cleanupHour match the current Sofia-local time. This
    // lets admins schedule per bot ("every Mon at 04:00", "daily at 22:00")
    // with a single global cron registration.
    cleanupTask = cron.schedule('0 * * * *', async () => {
        try {
            await runCrawlerCleanup();
        } catch (err) {
            console.error('[CrawlerCleanup] crashed:', err?.message);
        }
    }, { timezone: 'Europe/Sofia' });
    console.log('[CrawlerScheduler] TTL cleanup cron registered (hourly, per-bot day/hour gate)');
};

const startCrawlerScheduler = async () => {
    try {
        await syncJobs();
        console.log(`[CrawlerScheduler] Initial sync done — ${scheduledJobs.size} active bot(s)`);
    } catch (err) {
        console.error('[CrawlerScheduler] Initial sync failed:', err && err.message);
    }

    startCleanupCron();

    setInterval(() => {
        syncJobs().catch((err) => {
            console.error('[CrawlerScheduler] Resync failed:', err && err.message);
        });
    }, RESYNC_INTERVAL_MS);
};

module.exports = { startCrawlerScheduler };
