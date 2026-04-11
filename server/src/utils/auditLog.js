// server/src/utils/auditLog.js
// Helper for logging admin user management actions to admin_user_actions table.
// Failures are caught silently — audit log failure must NEVER block the main flow.

/**
 * Log an admin user management action.
 *
 * @param {Object} params
 * @param {('lookup_user'|'invite_user'|'send_reset_link'|'reset_completed'|'reset_failed')} params.actionType
 * @param {number} params.adminId - ID of the admin performing the action
 * @param {number|null} [params.targetUserId] - ID of the target user (null if not found)
 * @param {string} params.targetEmail - Email of the target user (always logged)
 * @param {Object} [params.req] - Express request object (used for IP and User-Agent)
 * @param {Object} [params.details] - Extra context as JSONB (e.g. { phoneUsed, smsRequested, errorMessage })
 * @param {boolean} [params.success=true] - Whether the action succeeded
 */
async function logAdminAction({
    actionType,
    adminId,
    targetUserId = null,
    targetEmail,
    req,
    details = null,
    success = true,
}) {
    try {
        const { admin_user_action } = require('../sequelize/models');
        await admin_user_action.create({
            actionType,
            adminId,
            targetUserId,
            targetEmail,
            ipAddress: req?.ip || req?.connection?.remoteAddress || null,
            userAgent: req?.headers?.['user-agent']
                ? String(req.headers['user-agent']).substring(0, 500)
                : null,
            details,
            success,
        });
    } catch (err) {
        // Never block main flow on audit log failure
        console.error('[AUDIT LOG] Failed to record admin action:', err.message);
    }
}

module.exports = { logAdminAction };
