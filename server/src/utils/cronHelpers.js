// server/src/utils/cronHelpers.js
//
// Tiny helpers used by every cron job to:
//   - load its config from `cron_settings` (auto-seeded with defaults)
//   - skip itself if admin disabled it
//   - record run status + duration + recipient count after each tick
//
// Every cron should:
//   1. await getCronConfig(key, { schedule, timezone, description }) at start
//   2. check fresh `enabled` inside its task callback
//   3. await recordCronRun(key, ...) on completion / failure

const { cron_setting } = require('../sequelize/models');

/**
 * Returns the cron_setting row for `key`. Creates it with `defaults` if missing.
 * Subsequent calls return whatever is in DB (so admin edits stick).
 *
 * @param {string} key
 * @param {{schedule: string, timezone?: string, description?: string}} defaults
 * @returns {Promise<object>} plain config object
 */
const getCronConfig = async (key, defaults = {}) => {
    const [row] = await cron_setting.findOrCreate({
        where: { key },
        defaults: {
            key,
            enabled: true,
            schedule: defaults.schedule || '0 0 * * *',
            timezone: defaults.timezone || 'Europe/Sofia',
            description: defaults.description || null,
        },
    });
    return row.toJSON();
};

/**
 * Records the result of a single cron tick.
 * Never throws — failures here would mask the actual error from the cron.
 *
 * @param {string} key
 * @param {{status: 'success'|'failed'|'partial'|'skipped', subscribers?: number, durationMs?: number, error?: string}} result
 */
const recordCronRun = async (key, result = {}) => {
    try {
        await cron_setting.update(
            {
                lastRunAt: new Date(),
                lastRunStatus: result.status || 'success',
                lastRunSubscribers:
                    typeof result.subscribers === 'number'
                        ? result.subscribers
                        : null,
                lastRunDurationMs:
                    typeof result.durationMs === 'number'
                        ? result.durationMs
                        : null,
                lastRunError: result.error
                    ? String(result.error).substring(0, 2000)
                    : null,
            },
            { where: { key } },
        );
    } catch (err) {
        console.error(`[cronHelpers] recordCronRun(${key}) failed:`, err.message);
    }
};

/**
 * Returns true if the cron is enabled in DB.
 * Defaults to TRUE if the row is missing or DB unreachable — safer to run
 * something occasionally than to silently disable a critical job.
 */
const isCronEnabled = async (key) => {
    try {
        const row = await cron_setting.findOne({ where: { key } });
        return row ? row.enabled !== false : true;
    } catch {
        return true;
    }
};

module.exports = {
    getCronConfig,
    recordCronRun,
    isCronEnabled,
};
