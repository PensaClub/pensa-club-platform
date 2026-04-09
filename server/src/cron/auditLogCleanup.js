const cron = require('node-cron');
const { Op } = require('sequelize');
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');

/**
 * Schedule daily cleanup of admin_user_actions records older than 1 year.
 * Runs every day at 03:00 server time.
 */
const scheduleAuditLogCleanup = () => {
    cron.schedule('0 3 * * *', async () => {
        console.log('[AUDIT CLEANUP] Starting daily cleanup of audit logs...');
        try {
            const { admin_user_action } = require('../sequelize/models');
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            const deleted = await admin_user_action.destroy({
                where: {
                    created_at: { [Op.lt]: oneYearAgo },
                },
            });

            console.log(`[AUDIT CLEANUP] Deleted ${deleted} records older than ${oneYearAgo.toISOString()}`);
        } catch (error) {
            if (error instanceof DatabaseError) {
                console.error('[AUDIT CLEANUP] Database error:', {
                    code: error.original?.code,
                    message: error.message,
                });
            } else if (
                error instanceof ValidationError ||
                error instanceof UniqueConstraintError ||
                error instanceof ForeignKeyConstraintError
            ) {
                console.error('[AUDIT CLEANUP] Validation error:', error.message);
            } else {
                console.error('[AUDIT CLEANUP] Unexpected error:', error);
            }
        }
    });
};

module.exports = scheduleAuditLogCleanup;
