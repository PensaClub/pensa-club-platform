const permissions = require('../config/rbacConfig');

// Check if the user has the required permission for a route
exports.checkPermission = (resource, action, subAction = null) => {
    return (req, res, next) => {
        const userRole = req.user ? req.user.role : 'guest';

        // Mentors have isMentor flag but role='user' — treat as 'mentor' for RBAC
        const effectiveRoles = [userRole];
        if (req.user?.isMentor && userRole !== 'mentor') {
            effectiveRoles.push('mentor');
        }

        // Handle nested permissions (e.g., initiative.draft.read)
        if (subAction) {
            if (effectiveRoles.some(role => permissions[resource]?.[action]?.[subAction]?.includes(role))) {
                return next();
            }
        } else {
            // Handle regular permissions (e.g., article.read)
            if (effectiveRoles.some(role => permissions[resource]?.[action]?.includes(role))) {
                return next();
            }
        }

        return res.status(403).json({ error: 'Access denied' });
    };
};
