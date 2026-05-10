// server/src/utils/crawlerCleanup.js
//
// Daily TTL cleanup for the bot crawler. Two distinct responsibilities:
//
//   1. Per-bot finding cleanup (count-based, opt-in per bot)
//      Each bot can configure:
//        cleanupEnabled  — on/off
//        cleanupDay      — 'daily' | 'mon'..'sun'
//        cleanupBatchSize — how many oldest findings to delete THIS run
//      The job runs daily at 03:00 (cron lives in crawlerScheduler) and
//      for each bot that's "due today", deletes the N OLDEST findings by
//      foundAt ASC, regardless of status. This is intentional — admin's
//      explicit choice. For finer-grained control we expose 3 manual
//      bulk endpoints (clear-dismissed / clear-used-older / clear-all).
//
//   2. Run history trim (always-on)
//      Per bot: keep the last RUNS_PER_BOT runs, drop the older ones.
//      Cheap and bounded — these are just log rows, no editorial value.

const { Op } = require('sequelize');

const RUNS_PER_BOT = parseInt(process.env.CRAWLER_RUNS_PER_BOT || '100', 10);

// Map JS Date.getDay() (0=Sun..6=Sat) → our short keys.
const DAY_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// Returns Sofia-local day-of-week and hour, ignoring the server TZ. Important
// because the cron is configured in Europe/Sofia but JS Date methods use the
// server's local TZ (usually UTC in containers).
const sofiaDayHour = (now = new Date()) => {
    try {
        const fmt = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Sofia',
            weekday: 'short',
            hour: 'numeric',
            hour12: false,
        });
        const parts = fmt.formatToParts(now);
        const wd = parts.find((p) => p.type === 'weekday')?.value?.toLowerCase().slice(0, 3) || 'mon';
        const hr = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10) || 0;
        // Intl returns 24 instead of 0 for midnight in some Node versions.
        return { day: wd, hour: hr === 24 ? 0 : hr };
    } catch (_) {
        return { day: DAY_KEY[now.getDay()], hour: now.getHours() };
    }
};

// Bot is "due now" when:
//   - cleanup is enabled
//   - today (in Sofia TZ) matches cleanupDay (or it's 'daily')
//   - current hour (in Sofia TZ) equals cleanupHour
const isCleanupDueNow = (bot, now = new Date()) => {
    if (!bot.cleanupEnabled) return false;
    const { day, hour } = sofiaDayHour(now);
    const targetHour = Number.isFinite(bot.cleanupHour) ? bot.cleanupHour : 3;
    if (hour !== targetHour) return false;
    const targetDay = bot.cleanupDay || 'daily';
    if (targetDay === 'daily') return true;
    return day === targetDay;
};

const cleanupBotFindings = async (bot, models) => {
    const batch = bot.cleanupBatchSize || 100;
    // Find the foundAt cutoff: the N-th oldest finding's foundAt. Anything
    // <= that is in the kill set. Using a subquery / id list keeps the
    // operation atomic and avoids "delete by offset" pitfalls.
    const oldest = await models.crawler_finding.findAll({
        where: { botId: bot.id },
        order: [['foundAt', 'ASC'], ['id', 'ASC']],
        limit: batch,
        attributes: ['id'],
    });
    if (oldest.length === 0) return 0;
    const ids = oldest.map((r) => r.id);
    return models.crawler_finding.destroy({ where: { id: { [Op.in]: ids } } });
};

const trimRunHistoryForBot = async (botId, models) => {
    // Keep the last RUNS_PER_BOT rows by id (newest first); drop everything
    // older. findOne with offset returns the cutoff row; nothing to do if
    // we have fewer than the limit.
    const cutoffRow = await models.crawler_run.findOne({
        where: { botId },
        order: [['id', 'DESC']],
        offset: RUNS_PER_BOT,
        attributes: ['id'],
    });
    if (!cutoffRow) return 0;
    return models.crawler_run.destroy({
        where: { botId, id: { [Op.lte]: cutoffRow.id } },
    });
};

const runCrawlerCleanup = async () => {
    const startedAt = Date.now();
    let findingsDeleted = 0;
    let runsDeleted = 0;
    let botsTouched = 0;

    let models;
    try {
        models = require('../sequelize/models');
    } catch (err) {
        console.error('[CrawlerCleanup] Failed to load models:', err?.message);
        return { findingsDeleted: 0, runsDeleted: 0, error: err?.message };
    }

    let bots;
    try {
        bots = await models.crawler_bot.findAll({
            attributes: ['id', 'name', 'cleanupEnabled', 'cleanupDay', 'cleanupHour', 'cleanupBatchSize'],
        });
    } catch (err) {
        console.error('[CrawlerCleanup] failed to load bots:', err?.message);
        return { findingsDeleted: 0, runsDeleted: 0, error: err?.message };
    }

    const now = new Date();
    for (const bot of bots) {
        // 1. Findings — only on the bot's chosen day + hour, only when enabled.
        try {
            if (isCleanupDueNow(bot, now)) {
                const n = await cleanupBotFindings(bot, models);
                findingsDeleted += n;
                if (n > 0) botsTouched += 1;
            }
        } catch (err) {
            console.error(`[CrawlerCleanup] bot ${bot.id} findings cleanup failed:`, err?.message);
        }

        // 2. Run history — always trimmed.
        try {
            const n = await trimRunHistoryForBot(bot.id, models);
            runsDeleted += n;
        } catch (err) {
            console.error(`[CrawlerCleanup] bot ${bot.id} runs trim failed:`, err?.message);
        }
    }

    const elapsed = Date.now() - startedAt;
    console.log(
        `[CrawlerCleanup] done in ${elapsed}ms — findings deleted: ${findingsDeleted} across ${botsTouched} bot(s), runs deleted: ${runsDeleted}`
    );
    return { findingsDeleted, runsDeleted, botsTouched, elapsedMs: elapsed };
};

module.exports = {
    runCrawlerCleanup,
    isCleanupDueNow,
    sofiaDayHour,
    RUNS_PER_BOT,
};
