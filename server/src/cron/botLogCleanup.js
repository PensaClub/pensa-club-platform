    const cron = require('node-cron');
const { bot_log } = require('../sequelize/models');
const { Op } = require('sequelize');

/**
 * Изчиства bot logs по-стари от X дни
 * @param {number} daysToKeep - Колко дни да пази логовете (default: 30)
 */
async function cleanupOldBotLogs(daysToKeep = 30) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const deletedCount = await bot_log.destroy({
            where: {
                timestamp: {
                    [Op.lt]: cutoffDate,
                },
            },
        });

        console.log(`🧹 Bot logs cleanup: Deleted ${deletedCount} old records (older than ${daysToKeep} days)`);
        return deletedCount;
    } catch (error) {
        console.error('❌ Error cleaning up bot logs:', error);
        throw error;
    }
}

/**
 * Стартира cron job за автоматично изчистване
 * Изпълнява се всеки ден в 2:00 сутринта
 */
function scheduleBotLogCleanup() {
    // Cron pattern: '0 2 * * *' = Every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('🕒 Starting daily bot logs cleanup...');
        try {
            await cleanupOldBotLogs(30); // Изтрива логове по-стари от 30 дни
        } catch (error) {
            console.error('Error during scheduled bot logs cleanup:', error);
        }
    });

    console.log('✅ Bot logs cleanup cron job scheduled (daily at 2:00 AM)');
}

module.exports = {
    cleanupOldBotLogs,
    scheduleBotLogCleanup,
};