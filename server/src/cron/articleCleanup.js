const cron = require('node-cron');
const { cleanupOldArticles } = require('../utils/articleUtils');
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');

const scheduleArticleCleanup = () => {
    // Schedule the cleanup task to run every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        console.log('Starting weekly article cleanup check...');
        try {
            const deletedCount = await cleanupOldArticles();
            console.log(`Cleanup complete. Deleted ${deletedCount} old articles.`);
        } catch (error) {
            if (error instanceof DatabaseError) {
                console.error('Database error during article cleanup:', {
                    code: error.original?.code,
                    message: error.message,
                });
            } else if (error instanceof ValidationError || error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
                console.error('Validation error during article cleanup:', {
                    message: error.message,
                    errors: error.errors,
                });
            } else {
                console.error('Unexpected error during article cleanup:', error);
            }
        }
    });
};

module.exports = scheduleArticleCleanup;
